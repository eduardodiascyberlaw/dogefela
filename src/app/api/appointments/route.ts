import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, requireAdmin, sanitizePagination } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const authCheck = await requireAuth(req);
  if (authCheck.error) return authCheck.error;

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const clientId = searchParams.get("clientId");
    const professionalId = searchParams.get("professionalId");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const { page, limit, skip } = sanitizePagination(
      searchParams.get("page"),
      searchParams.get("limit")
    );

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (clientId) where.clientId = clientId;
    if (professionalId) where.professionalId = professionalId;
    if (dateFrom || dateTo) {
      where.scheduledAt = {};
      if (dateFrom) (where.scheduledAt as Record<string, unknown>).gte = new Date(dateFrom);
      if (dateTo) (where.scheduledAt as Record<string, unknown>).lte = new Date(dateTo);
    }

    // PARTNER role: scope to own appointments only
    if (authCheck.role === "PARTNER") {
      where.professionalId = authCheck.userId;
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          client: { select: { id: true, firstName: true, lastName: true, clientNumber: true, phone: true } },
          service: { select: { id: true, name: true, category: true, duration: true } },
          professional: { select: { id: true, name: true } },
        },
        orderBy: { scheduledAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.appointment.count({ where }),
    ]);

    return NextResponse.json({
      appointments,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const authCheck = await requireAdmin(req);
  if (authCheck.error) return authCheck.error;

  try {
    const body = await req.json();
    const {
      clientId, serviceId, professionalId,
      scheduledAt, price, paymentMethod, notes, clientPackId,
    } = body;

    if (!clientId || !serviceId || !professionalId || !scheduledAt || price === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Start a transaction for complex operations
    const result = await prisma.$transaction(async (tx) => {
      // Create appointment
      const appointment = await tx.appointment.create({
        data: {
          clientId,
          serviceId,
          professionalId,
          scheduledAt: new Date(scheduledAt),
          price,
          paymentMethod: paymentMethod || null,
          notes: notes || null,
          clientPackId: clientPackId || null,
        },
        include: {
          client: { select: { id: true, firstName: true, lastName: true } },
          service: { select: { id: true, name: true } },
          professional: { select: { id: true, name: true, commissionRate: true } },
        },
      });

      // If payment is by credit balance, create debit transaction
      if (paymentMethod === "CREDIT_BALANCE") {
        const currentBalance = await tx.creditTransaction.aggregate({
          _sum: { amount: true },
          where: { clientId },
        });

        const balance = Number(currentBalance._sum.amount || 0);
        if (balance < Number(price)) {
          throw new Error("Saldo insuficiente");
        }

        await tx.creditTransaction.create({
          data: {
            clientId,
            type: "DEBIT",
            amount: -Math.abs(Number(price)),
            balance: balance - Number(price),
            description: `Pagamento: ${appointment.service.name}`,
            appointmentId: appointment.id,
            createdBy: authCheck.userId,
          },
        });
      }

      // If payment is by pack, decrement sessions
      if (paymentMethod === "PACK" && clientPackId) {
        const clientPack = await tx.clientPack.findUnique({
          where: { id: clientPackId },
          include: { pack: true },
        });

        if (!clientPack) {
          throw new Error("Pack not found");
        }

        if (clientPack.sessionsUsed >= clientPack.pack.totalSessions) {
          throw new Error("Todas as sessões do pack foram utilizadas");
        }

        await tx.clientPack.update({
          where: { id: clientPackId },
          data: { sessionsUsed: { increment: 1 } },
        });
      }

      // Auto-create commission record if professional is a partner
      if (appointment.professional.commissionRate) {
        const commRate = Number(appointment.professional.commissionRate);
        const commValue = (Number(price) * commRate) / 100;

        await tx.commissionRecord.create({
          data: {
            professionalId,
            appointmentId: appointment.id,
            servicePrice: price,
            commissionRate: commRate,
            commissionValue: commValue,
            status: "PENDING",
          },
        });
      }

      return appointment;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create appointment";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
