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
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        appointments: {
          include: {
            service: true,
            professional: { select: { id: true, name: true } },
          },
          orderBy: { scheduledAt: "desc" },
          take: 20,
        },
        credits: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        clientPacks: {
          include: {
            pack: { include: { services: { include: { service: true } } } },
          },
        },
        _count: {
          select: { appointments: true, credits: true, messages: true },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    // PARTNER: only allow access to clients they have served
    if (authCheck.role === "PARTNER") {
      const hasServed = await prisma.appointment.findFirst({
        where: {
          clientId: id,
          professionalId: authCheck.userId,
        },
        select: { id: true },
      });
      if (!hasServed) {
        return NextResponse.json(
          { error: "Acesso negado" },
          { status: 403 }
        );
      }
    }

    // Calculate credit balance
    const creditBalance = await prisma.creditTransaction.aggregate({
      _sum: { amount: true },
      where: { clientId: id },
    });

    return NextResponse.json({
      ...client,
      creditBalance: Number(creditBalance._sum.amount || 0),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch client" },
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
    const {
      firstName, lastName, email, phone, nif,
      address, postalCode, city, country,
      birthDate, notes, allergies,
      gdprConsent, whatsappOptIn, active,
    } = body;

    const updateData: Record<string, unknown> = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email || null;
    if (phone !== undefined) updateData.phone = phone;
    if (nif !== undefined) updateData.nif = nif || null;
    if (address !== undefined) updateData.address = address || null;
    if (postalCode !== undefined) updateData.postalCode = postalCode || null;
    if (city !== undefined) updateData.city = city || null;
    if (country !== undefined) updateData.country = country;
    if (birthDate !== undefined)
      updateData.birthDate = birthDate ? new Date(birthDate) : null;
    if (notes !== undefined) updateData.notes = notes || null;
    if (allergies !== undefined) updateData.allergies = allergies || null;
    if (active !== undefined) updateData.active = active;
    if (whatsappOptIn !== undefined) updateData.whatsappOptIn = whatsappOptIn;
    if (gdprConsent !== undefined) {
      updateData.gdprConsent = gdprConsent;
      if (gdprConsent) updateData.gdprConsentDate = new Date();
    }

    const client = await prisma.client.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(client);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update client" },
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

    // Soft delete - just deactivate
    await prisma.client.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json({ message: "Client deactivated" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to deactivate client" },
      { status: 500 }
    );
  }
}
