import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, sanitizePagination } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const authCheck = await requireAdmin(req);
  if (authCheck.error) return authCheck.error;

  try {
    const { searchParams } = new URL(req.url);
    const { page, limit, skip } = sanitizePagination(
      searchParams.get("page"),
      searchParams.get("limit")
    );

    const messages = await prisma.messageLog.findMany({
      include: {
        client: {
          select: { firstName: true, lastName: true },
        },
        template: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    return NextResponse.json(messages);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch message history" },
      { status: 500 }
    );
  }
}
