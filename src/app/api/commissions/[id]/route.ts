import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAdmin(req);
  if (authCheck.error) return authCheck.error;

  try {
    const { id } = await params;
    const body = await req.json();
    const { status, paymentRef, notes } = body;

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (paymentRef !== undefined) updateData.paymentRef = paymentRef;
    if (notes !== undefined) updateData.notes = notes;

    if (status === "PAID") {
      updateData.paidAt = new Date();
    }

    const commission = await prisma.commissionRecord.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(commission);
  } catch {
    return NextResponse.json(
      { error: "Failed to update commission" },
      { status: 500 }
    );
  }
}
