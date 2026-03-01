import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const authCheck = await requireAdmin(req);
  if (authCheck.error) return authCheck.error;

  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");

    if (!clientId) {
      return NextResponse.json(
        { error: "clientId is required" },
        { status: 400 }
      );
    }

    const [transactions, balance] = await Promise.all([
      prisma.creditTransaction.findMany({
        where: { clientId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.creditTransaction.aggregate({
        _sum: { amount: true },
        where: { clientId },
      }),
    ]);

    return NextResponse.json({
      transactions,
      balance: Number(balance._sum.amount || 0),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch credits" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const authCheck = await requireAdmin(req);
  if (authCheck.error) return authCheck.error;

  try {
    const body = await req.json();
    const { clientId, type, amount, description } = body;

    if (!clientId || !type || amount === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get current balance
    const currentBalance = await prisma.creditTransaction.aggregate({
      _sum: { amount: true },
      where: { clientId },
    });

    const prevBalance = Number(currentBalance._sum.amount || 0);
    const transactionAmount =
      type === "CREDIT" || type === "REFUND"
        ? Math.abs(Number(amount))
        : -Math.abs(Number(amount));
    const newBalance = prevBalance + transactionAmount;

    if (newBalance < 0 && (type === "DEBIT" || type === "ADJUSTMENT")) {
      return NextResponse.json(
        { error: "Saldo insuficiente" },
        { status: 400 }
      );
    }

    const transaction = await prisma.creditTransaction.create({
      data: {
        clientId,
        type,
        amount: transactionAmount,
        balance: newBalance,
        description: description || null,
        createdBy: authCheck.userId,
      },
    });

    return NextResponse.json(
      { transaction, balance: newBalance },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}
