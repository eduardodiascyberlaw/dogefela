import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, requireAdmin, sanitizePagination } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const authCheck = await requireAuth(req);
  if (authCheck.error) return authCheck.error;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const active = searchParams.get("active");
    const { page, limit, skip } = sanitizePagination(
      searchParams.get("page"),
      searchParams.get("limit")
    );

    const where: Record<string, unknown> = {};
    if (active !== null && active !== "") where.active = active === "true";

    // PARTNER role: scope to own clients (clients they have served)
    if (authCheck.role === "PARTNER") {
      const clientIds = await prisma.appointment.findMany({
        where: { professionalId: authCheck.userId },
        select: { clientId: true },
        distinct: ["clientId"],
      });
      where.id = { in: clientIds.map((c) => c.clientId) };
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { nif: { contains: search, mode: "insensitive" } },
      ];
      // Try to search by client number
      const num = parseInt(search);
      if (!isNaN(num)) {
        (where.OR as Array<Record<string, unknown>>).push({ clientNumber: num });
      }
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        include: {
          _count: { select: { appointments: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.client.count({ where }),
    ]);

    // Get credit balances for each client
    const clientIds = clients.map((c) => c.id);
    const creditBalances = await prisma.creditTransaction.groupBy({
      by: ["clientId"],
      _sum: { amount: true },
      where: { clientId: { in: clientIds } },
    });

    const balanceMap = new Map(
      creditBalances.map((b) => [b.clientId, Number(b._sum.amount || 0)])
    );

    const clientsWithBalance = clients.map((c) => ({
      ...c,
      creditBalance: balanceMap.get(c.id) || 0,
    }));

    return NextResponse.json({
      clients: clientsWithBalance,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch clients" },
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
      firstName, lastName, email, phone, nif,
      address, postalCode, city, country,
      birthDate, notes, allergies,
      gdprConsent, whatsappOptIn,
    } = body;

    if (!firstName || !lastName || !phone) {
      return NextResponse.json(
        { error: "Nome, apelido e telemóvel são obrigatórios" },
        { status: 400 }
      );
    }

    const client = await prisma.client.create({
      data: {
        firstName,
        lastName,
        email: email || null,
        phone,
        nif: nif || null,
        address: address || null,
        postalCode: postalCode || null,
        city: city || null,
        country: country || "Portugal",
        birthDate: birthDate ? new Date(birthDate) : null,
        notes: notes || null,
        allergies: allergies || null,
        gdprConsent: gdprConsent || false,
        gdprConsentDate: gdprConsent ? new Date() : null,
        whatsappOptIn: whatsappOptIn || false,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}
