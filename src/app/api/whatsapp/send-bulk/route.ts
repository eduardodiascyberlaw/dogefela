import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendTextMessage, processTemplate } from "@/lib/whatsapp";
import { requireAdmin } from "@/lib/api-auth";

const MAX_RECIPIENTS = 100;

export async function POST(req: NextRequest) {
  const authCheck = await requireAdmin(req);
  if (authCheck.error) return authCheck.error;

  try {
    const body = await req.json();
    const { templateId, clientIds, variables, filters } = body;

    if (!templateId) {
      return NextResponse.json(
        { error: "Template necessário para envio em massa" },
        { status: 400 }
      );
    }

    // Validate max recipients limit on explicit client list
    if (clientIds && clientIds.length > MAX_RECIPIENTS) {
      return NextResponse.json(
        { error: `Máximo de ${MAX_RECIPIENTS} destinatários por envio` },
        { status: 400 }
      );
    }

    const template = await prisma.messageTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template não encontrado" },
        { status: 404 }
      );
    }

    // Get clients
    let clients;
    if (clientIds && clientIds.length > 0) {
      clients = await prisma.client.findMany({
        where: {
          id: { in: clientIds },
          active: true,
          whatsappOptIn: true,
        },
        select: { id: true, firstName: true, lastName: true, phone: true },
      });
    } else if (filters) {
      const where: Record<string, unknown> = {
        active: true,
        whatsappOptIn: true,
      };

      // Filter: inactive clients (no appointment in X days)
      if (filters.inactiveDays) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - filters.inactiveDays);
        where.id = {
          in: await prisma.appointment
            .groupBy({
              by: ["clientId"],
              _max: { scheduledAt: true },
              having: { scheduledAt: { _max: { lt: cutoff } } },
            })
            .then((r) => r.map((x) => x.clientId)),
        };
      }

      // Filter: birthday today/this week
      if (filters.birthdayRange) {
        // This requires raw SQL for birthday matching
        // Simplified: just get clients
      }

      clients = await prisma.client.findMany({
        where,
        select: { id: true, firstName: true, lastName: true, phone: true },
        take: MAX_RECIPIENTS,
      });
    } else {
      return NextResponse.json(
        { error: "Seleccione clientes ou filtros" },
        { status: 400 }
      );
    }

    // Enforce max recipients limit
    if (clients.length > MAX_RECIPIENTS) {
      clients = clients.slice(0, MAX_RECIPIENTS);
    }

    // Send messages with delay between each
    const results = { sent: 0, failed: 0, errors: [] as string[] };

    for (const client of clients) {
      try {
        const clientVars = {
          nome: client.firstName,
          nomeCompleto: `${client.firstName} ${client.lastName}`,
          ...variables,
        };

        const message = processTemplate(template.content, clientVars);
        const result = await sendTextMessage(client.phone, message);

        // Log
        await prisma.messageLog.create({
          data: {
            clientId: client.id,
            templateId: template.id,
            type: template.type,
            channel: "WHATSAPP",
            to: client.phone,
            content: message,
            status: "SENT",
            externalId: result?.key?.id || null,
          },
        });

        results.sent++;

        // Delay 2s between messages to avoid being flagged
        await new Promise((r) => setTimeout(r, 2000));
      } catch (error) {
        results.failed++;
        results.errors.push(
          `${client.firstName} ${client.lastName}: ${
            error instanceof Error ? error.message : "Erro"
          }`
        );
      }
    }

    return NextResponse.json({
      success: true,
      totalClients: clients.length,
      ...results,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send bulk messages";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
