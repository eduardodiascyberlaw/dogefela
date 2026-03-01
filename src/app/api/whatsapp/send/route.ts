import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendTextMessage, processTemplate } from "@/lib/whatsapp";
import { requireAdmin } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  const authCheck = await requireAdmin(req);
  if (authCheck.error) return authCheck.error;

  try {
    const body = await req.json();
    const { clientId, templateId, customMessage, variables, phone } = body;

    let messageText = "";
    let targetPhone = phone;
    let templateUsed = null;

    // If using template, process it
    if (templateId) {
      const template = await prisma.messageTemplate.findUnique({
        where: { id: templateId },
      });

      if (!template) {
        return NextResponse.json(
          { error: "Template não encontrado" },
          { status: 404 }
        );
      }

      messageText = processTemplate(template.content, variables || {});
      templateUsed = template;
    } else if (customMessage) {
      messageText = customMessage;
    } else {
      return NextResponse.json(
        { error: "Mensagem ou template necessário" },
        { status: 400 }
      );
    }

    // Get client phone if clientId provided
    if (clientId && !targetPhone) {
      const client = await prisma.client.findUnique({
        where: { id: clientId },
        select: { phone: true, firstName: true, lastName: true, whatsappOptIn: true },
      });

      if (!client) {
        return NextResponse.json(
          { error: "Cliente não encontrado" },
          { status: 404 }
        );
      }

      if (!client.whatsappOptIn) {
        return NextResponse.json(
          { error: "Cliente não autorizou WhatsApp" },
          { status: 403 }
        );
      }

      targetPhone = client.phone;
    }

    if (!targetPhone) {
      return NextResponse.json(
        { error: "Número de telemóvel necessário" },
        { status: 400 }
      );
    }

    // Send via Evolution API
    const result = await sendTextMessage(targetPhone, messageText);

    // Log the message
    await prisma.messageLog.create({
      data: {
        clientId: clientId || null,
        templateId: templateId || null,
        type: templateUsed?.type || "CUSTOM",
        channel: "WHATSAPP",
        to: targetPhone,
        content: messageText,
        status: "SENT",
        externalId: result?.key?.id || null,
      },
    });

    return NextResponse.json({
      success: true,
      messageId: result?.key?.id,
      to: targetPhone,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to send message";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
