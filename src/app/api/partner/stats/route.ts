import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const authCheck = await requireAuth(req, ["PARTNER"]);
  if (authCheck.error) return authCheck.error;

  try {
    const userId = authCheck.userId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      appointmentsThisMonth,
      appointmentsTotal,
      revenueThisMonth,
      revenueTotal,
      commissionPending,
      commissionPaid,
      upcomingAppointments,
    ] = await Promise.all([
      prisma.appointment.count({
        where: {
          professionalId: userId,
          status: "COMPLETED",
          completedAt: { gte: startOfMonth },
        },
      }),
      prisma.appointment.count({
        where: {
          professionalId: userId,
          status: "COMPLETED",
        },
      }),
      prisma.appointment.aggregate({
        _sum: { price: true },
        where: {
          professionalId: userId,
          status: "COMPLETED",
          completedAt: { gte: startOfMonth },
        },
      }),
      prisma.appointment.aggregate({
        _sum: { price: true },
        where: {
          professionalId: userId,
          status: "COMPLETED",
        },
      }),
      prisma.commissionRecord.aggregate({
        _sum: { commissionValue: true },
        where: {
          professionalId: userId,
          status: { in: ["PENDING", "APPROVED"] },
        },
      }),
      prisma.commissionRecord.aggregate({
        _sum: { commissionValue: true },
        where: {
          professionalId: userId,
          status: "PAID",
        },
      }),
      prisma.appointment.count({
        where: {
          professionalId: userId,
          status: "SCHEDULED",
          scheduledAt: { gte: now },
        },
      }),
    ]);

    return NextResponse.json({
      appointmentsThisMonth,
      appointmentsTotal,
      revenueThisMonth: Number(revenueThisMonth._sum.price || 0),
      revenueTotal: Number(revenueTotal._sum.price || 0),
      commissionPending: Number(commissionPending._sum.commissionValue || 0),
      commissionPaid: Number(commissionPaid._sum.commissionValue || 0),
      upcomingAppointments,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
