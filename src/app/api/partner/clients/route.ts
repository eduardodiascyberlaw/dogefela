import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const authCheck = await requireAuth(req, ["PARTNER"]);
  if (authCheck.error) return authCheck.error;

  try {
    const userId = authCheck.userId;

    // Find all clients this professional has served
    const appointments = await prisma.appointment.findMany({
      where: {
        professionalId: userId,
        status: "COMPLETED",
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    // Aggregate by client
    const clientMap = new Map<
      string,
      {
        id: string;
        firstName: string;
        lastName: string;
        phone: string;
        email: string | null;
        appointmentCount: number;
        totalRevenue: number;
        lastVisit: string | null;
      }
    >();

    appointments.forEach((apt) => {
      const key = apt.clientId;
      const existing = clientMap.get(key);
      if (existing) {
        existing.appointmentCount++;
        existing.totalRevenue += Number(apt.price);
        if (
          !existing.lastVisit ||
          new Date(apt.scheduledAt) > new Date(existing.lastVisit)
        ) {
          existing.lastVisit = apt.scheduledAt.toISOString();
        }
      } else {
        clientMap.set(key, {
          id: apt.client.id,
          firstName: apt.client.firstName,
          lastName: apt.client.lastName,
          phone: apt.client.phone,
          email: apt.client.email,
          appointmentCount: 1,
          totalRevenue: Number(apt.price),
          lastVisit: apt.scheduledAt.toISOString(),
        });
      }
    });

    const clients = Array.from(clientMap.values()).sort(
      (a, b) => b.appointmentCount - a.appointmentCount
    );

    return NextResponse.json(clients);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}
