import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { MessageStatus } from "@prisma/client";

/**
 * Webhook endpoint for Evolution API
 * Receives events: messages.upsert, messages.update, connection.update, qrcode.updated, send.message
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, instance, data } = body;

    switch (event) {
      case "messages.upsert": {
        // Incoming message from a client
        if (data?.key?.fromMe === false) {
          const phone = data.key.remoteJid?.replace("@s.whatsapp.net", "") || "";
          const messageText =
            data.message?.conversation ||
            data.message?.extendedTextMessage?.text ||
            "";

          if (phone && messageText) {
            // Find client by phone
            const client = await prisma.client.findFirst({
              where: {
                phone: { contains: phone.slice(-9) }, // Match last 9 digits
                active: true,
              },
            });

            // Log incoming message
            await prisma.messageLog.create({
              data: {
                clientId: client?.id ?? undefined,
                type: "CUSTOM",
                channel: "WHATSAPP",
                to: phone,
                content: messageText,
                status: "RECEIVED",
                externalId: data.key.id || null,
              },
            });

          }
        }
        break;
      }

      case "messages.update": {
        // Message delivery status update
        const messageId = data?.key?.id;
        const status = data?.update?.status;

        if (messageId) {
          const statusMap: Record<number, MessageStatus> = {
            1: "PENDING",
            2: "SENT",
            3: "DELIVERED",
            4: "READ",
            5: "READ", // PLAYED maps to READ
          };

          const newStatus: MessageStatus = statusMap[status] || "SENT";

          await prisma.messageLog.updateMany({
            where: { externalId: messageId },
            data: { status: newStatus },
          });

        }
        break;
      }

      case "connection.update": {
        // Could trigger notifications to admin if disconnected
        break;
      }

      case "qrcode.updated": {
        break;
      }

      case "send.message": {
        // Confirmation of sent message
        break;
      }

      default:
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ received: true }); // Always return 200 to avoid retries
  }
}

// Allow GET for webhook health check
export async function GET() {
  return NextResponse.json({ status: "ok", webhook: "evolution-api" });
}
