import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const authCheck = await requireAuth(req, ["PARTNER"]);
  if (authCheck.error) return authCheck.error;

  try {
    const user = await prisma.user.findUnique({
      where: { id: authCheck.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        specialization: true,
        commissionRate: true,
        nif: true,
        iban: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const authCheck = await requireAuth(req, ["PARTNER"]);
  if (authCheck.error) return authCheck.error;

  try {
    const body = await req.json();
    const { name, phone } = body;

    // Partners can only update name and phone
    const user = await prisma.user.update({
      where: { id: authCheck.userId },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone: phone || null }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        specialization: true,
        commissionRate: true,
        nif: true,
        iban: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user);
  } catch {
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
