import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const authCheck = await requireAuth(req);
  if (authCheck.error) return authCheck.error;

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const professionalId = searchParams.get("professionalId");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (professionalId) where.professionalId = professionalId;

    // PARTNER role: scope to own commissions only
    if (authCheck.role === "PARTNER") {
      where.professionalId = authCheck.userId;
    }

    const commissions = await prisma.commissionRecord.findMany({
      where,
      include: {
        professional: { select: { id: true, name: true, commissionRate: true } },
        appointment: {
          include: {
            client: { select: { firstName: true, lastName: true } },
            service: { select: { name: true, category: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Build summaries per professional
    const summaryMap = new Map<
      string,
      {
        professionalId: string;
        professionalName: string;
        totalServices: number;
        totalRevenue: number;
        commissionRate: number;
        totalCommission: number;
        pending: number;
        approved: number;
        paid: number;
      }
    >();

    commissions.forEach((c) => {
      const key = c.professionalId;
      const existing = summaryMap.get(key) || {
        professionalId: c.professionalId,
        professionalName: c.professional.name,
        totalServices: 0,
        totalRevenue: 0,
        commissionRate: Number(c.professional.commissionRate || c.commissionRate),
        totalCommission: 0,
        pending: 0,
        approved: 0,
        paid: 0,
      };

      existing.totalServices++;
      existing.totalRevenue += Number(c.servicePrice);
      existing.totalCommission += Number(c.commissionValue);

      if (c.status === "PENDING") existing.pending += Number(c.commissionValue);
      else if (c.status === "APPROVED")
        existing.approved += Number(c.commissionValue);
      else if (c.status === "PAID") existing.paid += Number(c.commissionValue);

      summaryMap.set(key, existing);
    });

    return NextResponse.json({
      commissions,
      summaries: Array.from(summaryMap.values()),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch commissions" },
      { status: 500 }
    );
  }
}
