/**
 * WhatsApp Integration via Evolution API v2
 * Instance: dogfela
 * API running on VPS at port 8080
 */

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "";
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "";
const INSTANCE_NAME = process.env.EVOLUTION_INSTANCE || "dogfela";

interface EvolutionResponse {
  key?: { id: string };
  error?: string;
  message?: string;
  status?: number;
  [key: string]: unknown;
}

async function evolutionFetch(
  endpoint: string,
  method: string = "GET",
  body?: Record<string, unknown>
): Promise<EvolutionResponse> {
  const url = `${EVOLUTION_API_URL}${endpoint}`;
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      apikey: EVOLUTION_API_KEY,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(url, options);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.response?.message || data?.message || "Evolution API error");
    }
    return data;
  } catch (error) {
    throw error;
  }
}

// ==============================
// Instance Management
// ==============================

export async function getConnectionState(): Promise<{
  state: string;
  instanceName: string;
}> {
  const data = await evolutionFetch(
    `/instance/connectionState/${INSTANCE_NAME}`
  );
  return {
    state: (data.instance as { state: string })?.state || "unknown",
    instanceName: INSTANCE_NAME,
  };
}

export async function getQRCode(): Promise<{
  base64?: string;
  code?: string;
  pairingCode?: string;
  count?: number;
}> {
  const data = await evolutionFetch(`/instance/connect/${INSTANCE_NAME}`);
  return data as { base64?: string; code?: string; pairingCode?: string; count?: number };
}

export async function logoutInstance(): Promise<void> {
  await evolutionFetch(`/instance/logout/${INSTANCE_NAME}`, "DELETE");
}

export async function restartInstance(): Promise<void> {
  await evolutionFetch(`/instance/restart/${INSTANCE_NAME}`, "PUT");
}

// ==============================
// Send Messages
// ==============================

/**
 * Format phone number to WhatsApp format
 * Accepts: +351912345678, 351912345678, 912345678
 * Returns: 351912345678@s.whatsapp.net
 */
function formatPhone(phone: string): string {
  // Remove all non-digits
  let clean = phone.replace(/\D/g, "");

  // Add Portugal country code if missing
  if (clean.length === 9 && (clean.startsWith("9") || clean.startsWith("2"))) {
    clean = `351${clean}`;
  }

  return clean;
}

export async function sendTextMessage(
  phone: string,
  message: string
): Promise<EvolutionResponse> {
  const number = formatPhone(phone);

  return evolutionFetch(`/message/sendText/${INSTANCE_NAME}`, "POST", {
    number,
    text: message,
  });
}

export async function sendMediaMessage(
  phone: string,
  mediaUrl: string,
  caption?: string,
  mediaType: "image" | "video" | "document" | "audio" = "image"
): Promise<EvolutionResponse> {
  const number = formatPhone(phone);

  return evolutionFetch(`/message/sendMedia/${INSTANCE_NAME}`, "POST", {
    number,
    mediatype: mediaType,
    media: mediaUrl,
    caption: caption || "",
  });
}

export async function sendButtonMessage(
  phone: string,
  title: string,
  description: string,
  buttons: Array<{ displayText: string; id: string }>
): Promise<EvolutionResponse> {
  const number = formatPhone(phone);

  return evolutionFetch(`/message/sendButtons/${INSTANCE_NAME}`, "POST", {
    number,
    title,
    description,
    buttons: buttons.map((b) => ({
      type: "reply",
      buttonText: { displayText: b.displayText },
      buttonId: b.id,
    })),
  });
}

// ==============================
// Template Processing
// ==============================

/**
 * Replace template variables with actual values
 * Variables: {{nome}}, {{servico}}, {{data}}, {{hora}}, {{dias}}, {{valor}}, {{saldo}}
 */
export function processTemplate(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
  }
  return result;
}

// ==============================
// Check if number is on WhatsApp
// ==============================

export async function checkWhatsAppNumber(
  phone: string
): Promise<{ exists: boolean; jid?: string }> {
  const number = formatPhone(phone);

  try {
    const data = await evolutionFetch(
      `/chat/whatsappNumbers/${INSTANCE_NAME}`,
      "POST",
      { numbers: [number] }
    );

    const results = data as unknown as Array<{
      exists: boolean;
      jid: string;
      number: string;
    }>;

    if (Array.isArray(results) && results.length > 0) {
      return { exists: results[0].exists, jid: results[0].jid };
    }

    return { exists: false };
  } catch {
    return { exists: false };
  }
}

// ==============================
// Profile Picture
// ==============================

export async function getProfilePicture(
  phone: string
): Promise<string | null> {
  const number = formatPhone(phone);

  try {
    const data = await evolutionFetch(
      `/chat/fetchProfile/${INSTANCE_NAME}`,
      "POST",
      { number }
    );
    return (data as { profilePictureUrl?: string }).profilePictureUrl || null;
  } catch {
    return null;
  }
}
