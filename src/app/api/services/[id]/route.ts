import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/api-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAuth(req);
  if (authCheck.error) return authCheck.error;

  try {
    const { id } = await params;
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        _count: { select: { appointments: true } },
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(service);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch service" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAdmin(req);
  if (authCheck.error) return authCheck.error;

  try {
    const { id } = await params;
    const body = await req.json();
    const { name, description, category, price, duration, active, professionalType, imageUrl } = body;

    const service = await prisma.service.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(category && { category }),
        ...(price !== undefined && { price }),
        ...(duration !== undefined && { duration: parseInt(duration) }),
        ...(active !== undefined && { active }),
        ...(professionalType && { professionalType }),
        ...(imageUrl !== undefined && { imageUrl }),
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update service" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAdmin(req);
  if (authCheck.error) return authCheck.error;

  try {
    const { id } = await params;

    // Check if service has appointments
    const appointmentCount = await prisma.appointment.count({
      where: { serviceId: id },
    });

    if (appointmentCount > 0) {
      // Soft delete - just deactivate
      await prisma.service.update({
        where: { id },
        data: { active: false },
      });
      return NextResponse.json({ message: "Service deactivated (has appointments)" });
    }

    await prisma.service.delete({ where: { id } });
    return NextResponse.json({ message: "Service deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete service" },
      { status: 500 }
    );
  }
}
