import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const authCheck = await requireAdmin(req);
  if (authCheck.error) return authCheck.error;
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [
      totalClients,
      newClientsThisMonth,
      appointmentsToday,
      appointmentsThisWeek,
      revenueThisMonth,
      revenueLastMonth,
      totalCreditsBalance,
      pendingCommissions,
      upcomingBirthdays,
      inactiveClients,
    ] = await Promise.all([
      // Total active clients
      prisma.client.count({ where: { active: true } }),

      // New clients this month
      prisma.client.count({
        where: { createdAt: { gte: startOfMonth } },
      }),

      // Appointments today
      prisma.appointment.count({
        where: {
          scheduledAt: { gte: startOfDay, lt: endOfDay },
          status: { not: "CANCELLED" },
        },
      }),

      // Appointments this week
      prisma.appointment.count({
        where: {
          scheduledAt: { gte: startOfWeek, lt: endOfWeek },
          status: { not: "CANCELLED" },
        },
      }),

      // Revenue this month (completed appointments)
      prisma.appointment.aggregate({
        _sum: { price: true },
        where: {
          status: "COMPLETED",
          completedAt: { gte: startOfMonth },
        },
      }),

      // Revenue last month
      prisma.appointment.aggregate({
        _sum: { price: true },
        where: {
          status: "COMPLETED",
          completedAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),

      // Total credits balance (sum of all credit transactions)
      prisma.creditTransaction.aggregate({
        _sum: { amount: true },
        where: {},
      }),

      // Pending commissions
      prisma.commissionRecord.aggregate({
        _sum: { commissionValue: true },
        where: { status: "PENDING" },
      }),

      // Upcoming birthdays (next 7 days)
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count FROM clients
        WHERE "birthDate" IS NOT NULL
        AND active = true
        AND (
          (EXTRACT(MONTH FROM "birthDate") = EXTRACT(MONTH FROM NOW())
           AND EXTRACT(DAY FROM "birthDate") BETWEEN EXTRACT(DAY FROM NOW()) AND EXTRACT(DAY FROM NOW()) + 7)
          OR
          (EXTRACT(MONTH FROM "birthDate") = EXTRACT(MONTH FROM NOW()) + 1
           AND EXTRACT(DAY FROM "birthDate") <= EXTRACT(DAY FROM NOW()) + 7 -
             EXTRACT(DAY FROM (DATE_TRUNC('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 day')))
        )
      `.catch(() => [{ count: BigInt(0) }]),

      // Inactive clients (no appointment in 60+ days)
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(DISTINCT c.id) as count
        FROM clients c
        WHERE c.active = true
        AND c.id NOT IN (
          SELECT DISTINCT "clientId" FROM appointments
          WHERE "scheduledAt" > ${sixtyDaysAgo}
          AND status != 'CANCELLED'
        )
        AND c.id IN (
          SELECT DISTINCT "clientId" FROM appointments
        )
      `.catch(() => [{ count: BigInt(0) }]),
    ]);

    return NextResponse.json({
      totalClients,
      newClientsThisMonth,
      appointmentsToday,
      appointmentsThisWeek,
      revenueThisMonth: Number(revenueThisMonth._sum.price || 0),
      revenueLastMonth: Number(revenueLastMonth._sum.price || 0),
      totalCreditsBalance: Number(totalCreditsBalance._sum.amount || 0),
      pendingCommissions: Number(pendingCommissions._sum.commissionValue || 0),
      upcomingBirthdays: Number(
        Array.isArray(upcomingBirthdays) ? upcomingBirthdays[0]?.count || 0 : 0
      ),
      inactiveClients: Number(
        Array.isArray(inactiveClients) ? inactiveClients[0]?.count || 0 : 0
      ),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
