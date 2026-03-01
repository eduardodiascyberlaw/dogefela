import { NextRequest, NextResponse } from "next/server";
import { getConnectionState, getQRCode } from "@/lib/whatsapp";
import { requireAdmin } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const authCheck = await requireAdmin(req);
  if (authCheck.error) return authCheck.error;

  try {
    const state = await getConnectionState();
    let qrcode = null;

    if (state.state === "connecting" || state.state === "close") {
      try {
        qrcode = await getQRCode();
      } catch {
        // QR code not available yet
      }
    }

    return NextResponse.json({
      ...state,
      qrcode,
    });
  } catch {
    return NextResponse.json(
      {
        state: "error",
        instanceName: "dogfela",
        error: "Não foi possível conectar à Evolution API",
      },
      { status: 200 } // Return 200 to avoid breaking the frontend
    );
  }
}
