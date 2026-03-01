import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const authCheck = await requireAdmin(req);
  if (authCheck.error) return authCheck.error;

  try {
    const { searchParams } = new URL(req.url);
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const professionalId = searchParams.get("professionalId");
    const category = searchParams.get("category");

    const where: Record<string, unknown> = {
      status: "COMPLETED",
    };

    if (dateFrom || dateTo) {
      where.completedAt = {};
      if (dateFrom)
        (where.completedAt as Record<string, unknown>).gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        (where.completedAt as Record<string, unknown>).lte = end;
      }
    }

    if (professionalId) where.professionalId = professionalId;
    if (category) where.service = { category };

    // Get all completed appointments in range
    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        service: { select: { name: true, category: true } },
        professional: { select: { name: true } },
        client: { select: { firstName: true, lastName: true } },
      },
    });

    // Total revenue
    const totalRevenue = appointments.reduce(
      (sum, a) => sum + Number(a.price),
      0
    );
    const totalAppointments = appointments.length;
    const avgTicket = totalAppointments > 0 ? totalRevenue / totalAppointments : 0;

    // Revenue by category
    const catMap = new Map<string, { total: number; count: number }>();
    appointments.forEach((a) => {
      const cat = a.service.category;
      const existing = catMap.get(cat) || { total: 0, count: 0 };
      existing.total += Number(a.price);
      existing.count++;
      catMap.set(cat, existing);
    });
    const revenueByCategory = Array.from(catMap.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.total - a.total);

    // Revenue by professional
    const proMap = new Map<string, { total: number; count: number }>();
    appointments.forEach((a) => {
      const name = a.professional.name;
      const existing = proMap.get(name) || { total: 0, count: 0 };
      existing.total += Number(a.price);
      existing.count++;
      proMap.set(name, existing);
    });
    const revenueByProfessional = Array.from(proMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total);

    // Revenue by payment method
    const pmMap = new Map<string, { total: number; count: number }>();
    appointments.forEach((a) => {
      const method = a.paymentMethod || "N/A";
      const existing = pmMap.get(method) || { total: 0, count: 0 };
      existing.total += Number(a.price);
      existing.count++;
      pmMap.set(method, existing);
    });
    const revenueByPayment = Array.from(pmMap.entries())
      .map(([method, data]) => ({ method, ...data }))
      .sort((a, b) => b.total - a.total);

    // Top 10 clients
    const clientMap = new Map<string, { total: number; count: number }>();
    appointments.forEach((a) => {
      const name = `${a.client.firstName} ${a.client.lastName}`;
      const existing = clientMap.get(name) || { total: 0, count: 0 };
      existing.total += Number(a.price);
      existing.count++;
      clientMap.set(name, existing);
    });
    const topClients = Array.from(clientMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // Total pending commissions
    const pendingCommissions = await prisma.commissionRecord.aggregate({
      _sum: { commissionValue: true },
      where: {
        status: "PENDING",
        ...(dateFrom || dateTo
          ? {
              createdAt: {
                ...(dateFrom && { gte: new Date(dateFrom) }),
                ...(dateTo && {
                  lte: (() => {
                    const d = new Date(dateTo);
                    d.setHours(23, 59, 59, 999);
                    return d;
                  })(),
                }),
              },
            }
          : {}),
      },
    });

    return NextResponse.json({
      totalRevenue,
      totalAppointments,
      avgTicket,
      revenueByCategory,
      revenueByProfessional,
      revenueByPayment,
      topClients,
      totalCommissions: Number(pendingCommissions._sum.commissionValue || 0),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
