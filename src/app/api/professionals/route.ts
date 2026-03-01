import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";
import { requireAdmin, requireSuperAdmin } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const authCheck = await requireAdmin(req);
  if (authCheck.error) return authCheck.error;

  try {
    const professionals = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "PARTNER", "SUPER_ADMIN"] } },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        phone: true,
        commissionRate: true,
        specialization: true,
        nif: true,
        iban: true,
        createdAt: true,
        _count: { select: { performedServices: true, commissions: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(professionals);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch professionals" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const authCheck = await requireSuperAdmin(req);
  if (authCheck.error) return authCheck.error;

  try {
    const body = await req.json();
    const { name, email, password, role, phone, commissionRate, specialization, nif, iban } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Role creation validation:
    // PARTNER can only be created by ADMIN or SUPER_ADMIN
    // ADMIN can only be created by SUPER_ADMIN
    // SUPER_ADMIN can only be created by SUPER_ADMIN
    const targetRole = role || "PARTNER";
    if (targetRole === "ADMIN" && authCheck.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Apenas SUPER_ADMIN pode criar utilizadores ADMIN" },
        { status: 403 }
      );
    }
    if (targetRole === "SUPER_ADMIN" && authCheck.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Apenas SUPER_ADMIN pode criar utilizadores SUPER_ADMIN" },
        { status: 403 }
      );
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email já registado" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: targetRole,
        phone: phone || null,
        commissionRate: commissionRate ? parseFloat(commissionRate) : null,
        specialization: specialization || null,
        nif: nif || null,
        iban: iban || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        commissionRate: true,
        specialization: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create professional" },
      { status: 500 }
    );
  }
}
