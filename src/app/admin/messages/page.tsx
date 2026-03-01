"use client";

import { useEffect, useState } from "react";
import {
  MessageSquare,
  Send,
  Clock,
  Edit,
  Wifi,
  WifiOff,
  QrCode,
  CheckCheck,
  Check,
  Users,
  Search,
  Phone,
  AlertCircle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import Image from "next/image";

interface MessageTemplate {
  id: string;
  name: string;
  type: string;
  content: string;
  active: boolean;
  createdAt: string;
}

interface MessageLogEntry {
  id: string;
  clientId: string | null;
  templateId: string | null;
  type: string;
  channel: string;
  to: string;
  content: string;
  status: string;
  createdAt: string;
  client?: {
    firstName: string;
    lastName: string;
  };
  template?: {
    name: string;
  };
}

interface WhatsAppStatus {
  state: string;
  instanceName: string;
  qrcode?: {
    base64?: string;
    code?: string;
    count?: number;
  };
  error?: string;
}

const typeLabels: Record<string, string> = {
  REMINDER: "Lembrete",
  PROMOTION: "Promoção",
  BIRTHDAY: "Aniversário",
  FOLLOW_UP: "Seguimento",
  REACTIVATION: "Reactivação",
  CUSTOM: "Personalizada",
};

const typeColors: Record<string, string> = {
  REMINDER: "bg-blue-50 text-blue-700",
  PROMOTION: "bg-sky-50 text-sky-700",
  BIRTHDAY: "bg-pink-50 text-pink-700",
  FOLLOW_UP: "bg-green-50 text-green-700",
  REACTIVATION: "bg-amber-50 text-amber-700",
  CUSTOM: "bg-gray-100 text-gray-700",
};

const statusIcons: Record<string, React.ReactNode> = {
  PENDING: <Clock size={12} className="text-gray-400" />,
  SENT: <Check size={12} className="text-blue-500" />,
  DELIVERED: <CheckCheck size={12} className="text-blue-500" />,
  READ: <CheckCheck size={12} className="text-green-500" />,
  RECEIVED: <MessageSquare size={12} className="text-sky-500" />,
  FAILED: <AlertCircle size={12} className="text-red-500" />,
};

export default function MessagesPage() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [history, setHistory] = useState<MessageLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"templates" | "send" | "history">(
    "templates"
  );
  const [waStatus, setWaStatus] = useState<WhatsAppStatus | null>(null);
  const [waLoading, setWaLoading] = useState(true);

  // Send form state
  const [sendPhone, setSendPhone] = useState("");
  const [sendTemplateId, setSendTemplateId] = useState("");
  const [sendCustomMsg, setSendCustomMsg] = useState("");
  const [sendVars, setSendVars] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{
    success?: boolean;
    error?: string;
  } | null>(null);

  useEffect(() => {
    fetchTemplates();
    fetchWaStatus();
  }, []);

  useEffect(() => {
    if (activeTab === "history") fetchHistory();
  }, [activeTab]);

  async function fetchTemplates() {
    try {
      const res = await fetch("/api/messages/templates");
      if (res.ok) setTemplates(await res.json());
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchWaStatus() {
    setWaLoading(true);
    try {
      const res = await fetch("/api/whatsapp/status");
      if (res.ok) setWaStatus(await res.json());
    } catch {
      setWaStatus({ state: "error", instanceName: "dogfela" });
    } finally {
      setWaLoading(false);
    }
  }

  async function fetchHistory() {
    try {
      const res = await fetch("/api/messages/history");
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch {
      console.error("Error fetching history");
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setSendResult(null);

    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: sendPhone,
          templateId: sendTemplateId || undefined,
          customMessage: !sendTemplateId ? sendCustomMsg : undefined,
          variables: sendVars,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSendResult({ success: true });
        setSendPhone("");
        setSendCustomMsg("");
        setSendVars({});
      } else {
        setSendResult({ error: data.error || "Erro ao enviar" });
      }
    } catch {
      setSendResult({ error: "Erro de rede" });
    } finally {
      setSending(false);
    }
  }

  const selectedTemplate = templates.find((t) => t.id === sendTemplateId);
  const templateVars = selectedTemplate
    ? [...selectedTemplate.content.matchAll(/\{\{(\w+)\}\}/g)].map(
        (m) => m[1]
      )
    : [];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mensagens</h1>
          <p className="text-gray-500 mt-1">
            Templates e envio de mensagens WhatsApp
          </p>
        </div>

        {/* WhatsApp Status Badge */}
        <div className="flex items-center gap-2">
          {waLoading ? (
            <span className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-500">
              <Loader2 size={14} className="animate-spin" />
              A verificar...
            </span>
          ) : waStatus?.state === "open" ? (
            <span className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-sm text-green-700">
              <Wifi size={14} />
              WhatsApp Conectado
            </span>
          ) : waStatus?.state === "connecting" ? (
            <span className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-sm text-amber-700">
              <QrCode size={14} />
              A aguardar QR Code
            </span>
          ) : (
            <span className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-full text-sm text-red-600">
              <WifiOff size={14} />
              Desconectado
            </span>
          )}
          <button
            onClick={fetchWaStatus}
            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
            title="Actualizar estado"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* QR Code Banner */}
      {waStatus?.state === "connecting" && waStatus.qrcode?.base64 && (
        <div className="mb-6 bg-white rounded-xl border border-amber-200 p-6 flex items-center gap-6">
          <div className="flex-shrink-0">
            <Image
              src={waStatus.qrcode.base64}
              alt="QR Code WhatsApp"
              width={200}
              height={200}
              className="rounded-lg"
            />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Ligue o WhatsApp
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Abra o WhatsApp no telemóvel da Priscila → Dispositivos conectados
              → Conectar dispositivo → Leia este QR Code
            </p>
            <button
              onClick={fetchWaStatus}
              className="flex items-center gap-2 px-3 py-1.5 bg-sky-700 text-white rounded-lg text-sm hover:bg-sky-800 transition-colors"
            >
              <RefreshCw size={14} />
              Actualizar QR Code
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          {
            key: "templates" as const,
            label: "Templates",
            icon: MessageSquare,
          },
          { key: "send" as const, label: "Enviar", icon: Send },
          { key: "history" as const, label: "Histórico", icon: Clock },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-white text-sky-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===================== TEMPLATES TAB ===================== */}
      {activeTab === "templates" && (
        <div>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-3 border-sky-200 border-t-sky-700 rounded-full animate-spin" />
            </div>
          ) : templates.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <MessageSquare
                size={48}
                className="mx-auto text-gray-300 mb-3"
              />
              <p className="text-gray-500">Nenhum template configurado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((t) => (
                <div
                  key={t.id}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{t.name}</h3>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeColors[t.type]}`}
                    >
                      {typeLabels[t.type]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-4 bg-gray-50 p-3 rounded-lg">
                    {t.content}
                  </p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <span
                      className={`text-xs font-medium ${
                        t.active ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      {t.active ? "Activo" : "Inactivo"}
                    </span>
                    <button className="p-1.5 text-gray-400 hover:text-sky-600 transition-colors">
                      <Edit size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================== SEND TAB ===================== */}
      {activeTab === "send" && (
        <div className="max-w-2xl">
          <form onSubmit={handleSend} className="space-y-6">
            {/* Phone */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Phone size={18} className="text-sky-700" />
                Destinatário
              </h3>
              <input
                type="tel"
                required
                value={sendPhone}
                onChange={(e) => setSendPhone(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="+351 9XX XXX XXX ou 9XX XXX XXX"
              />
            </div>

            {/* Template or Custom */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MessageSquare size={18} className="text-sky-700" />
                Mensagem
              </h3>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template (opcional)
                </label>
                <select
                  value={sendTemplateId}
                  onChange={(e) => {
                    setSendTemplateId(e.target.value);
                    setSendVars({});
                  }}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">-- Mensagem personalizada --</option>
                  {templates
                    .filter((t) => t.active)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({typeLabels[t.type]})
                      </option>
                    ))}
                </select>
              </div>

              {/* Template Variables */}
              {selectedTemplate && templateVars.length > 0 && (
                <div className="space-y-2 mb-3">
                  <p className="text-xs text-gray-500 font-medium">
                    Variáveis do template:
                  </p>
                  {templateVars.map((v) => (
                    <div key={v}>
                      <label className="block text-xs text-gray-500 mb-0.5">
                        {`{{${v}}}`}
                      </label>
                      <input
                        type="text"
                        value={sendVars[v] || ""}
                        onChange={(e) =>
                          setSendVars({ ...sendVars, [v]: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                        placeholder={`Valor para ${v}`}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Template Preview */}
              {selectedTemplate && (
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg mb-3">
                  <p className="text-xs font-medium text-green-800 mb-1">
                    Pré-visualização:
                  </p>
                  <p className="text-sm text-green-900 whitespace-pre-wrap">
                    {selectedTemplate.content.replace(
                      /\{\{(\w+)\}\}/g,
                      (_, k) => sendVars[k] || `[${k}]`
                    )}
                  </p>
                </div>
              )}

              {/* Custom Message */}
              {!sendTemplateId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mensagem
                  </label>
                  <textarea
                    required={!sendTemplateId}
                    value={sendCustomMsg}
                    onChange={(e) => setSendCustomMsg(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                    placeholder="Escreva a sua mensagem..."
                  />
                </div>
              )}
            </div>

            {/* Result */}
            {sendResult && (
              <div
                className={`p-3 rounded-xl text-sm ${
                  sendResult.success
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-600 border border-red-200"
                }`}
              >
                {sendResult.success
                  ? "✅ Mensagem enviada com sucesso!"
                  : `❌ ${sendResult.error}`}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={
                sending ||
                waStatus?.state !== "open" ||
                !sendPhone
              }
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
              {sending ? "A enviar..." : "Enviar WhatsApp"}
            </button>

            {waStatus?.state !== "open" && (
              <p className="text-xs text-amber-600">
                ⚠️ WhatsApp não está conectado. Ligue o WhatsApp para enviar
                mensagens.
              </p>
            )}
          </form>
        </div>
      )}

      {/* ===================== HISTORY TAB ===================== */}
      {activeTab === "history" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {history.length === 0 ? (
            <div className="text-center py-12">
              <Clock size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">
                Nenhuma mensagem no histórico
              </p>
              <p className="text-sm text-gray-400 mt-1">
                As mensagens enviadas aparecerão aqui
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {history.map((msg) => (
                <div
                  key={msg.id}
                  className="p-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          msg.status === "RECEIVED"
                            ? "bg-sky-50"
                            : "bg-green-50"
                        }`}
                      >
                        {msg.status === "RECEIVED" ? (
                          <MessageSquare
                            size={14}
                            className="text-sky-700"
                          />
                        ) : (
                          <Send size={14} className="text-green-700" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">
                            {msg.status === "RECEIVED"
                              ? "Recebida"
                              : "Enviada"}
                            {msg.client &&
                              ` — ${msg.client.firstName} ${msg.client.lastName}`}
                          </p>
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            {statusIcons[msg.status]}
                            {msg.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {msg.content}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-400">
                            {formatDateTime(msg.createdAt)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {msg.to}
                          </span>
                          {msg.template && (
                            <span
                              className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                                typeColors[msg.type]
                              }`}
                            >
                              {msg.template.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
