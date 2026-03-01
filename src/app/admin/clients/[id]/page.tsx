"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Save,
  X,
  Plus,
  AlertTriangle,
  Clock,
  Hash,
  User,
  FileText,
  Heart,
  Shield,
  Printer,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Settings,
} from "lucide-react";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";

interface ClientDetail {
  id: string;
  clientNumber: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  nif: string | null;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  country: string;
  birthDate: string | null;
  notes: string | null;
  allergies: string | null;
  gdprConsent: boolean;
  gdprConsentDate: string | null;
  whatsappOptIn: boolean;
  active: boolean;
  createdAt: string;
  creditBalance: number;
  appointments: Array<{
    id: string;
    scheduledAt: string;
    completedAt: string | null;
    status: string;
    price: number | string;
    paymentMethod: string | null;
    notes: string | null;
    service: { id: string; name: string; category: string; };
    professional: { id: string; name: string; };
  }>;
  credits: Array<{
    id: string;
    type: string;
    amount: number | string;
    balance: number | string;
    description: string | null;
    createdAt: string;
  }>;
  clientPacks: Array<{
    id: string;
    sessionsUsed: number;
    purchasedAt: string;
    expiresAt: string | null;
    pack: {
      name: string;
      totalSessions: number;
      price: number | string;
      services: Array<{ service: { name: string } }>;
    };
  }>;
  _count: {
    appointments: number;
    credits: number;
    messages: number;
  };
}

const statusColors: Record<string, string> = {
  SCHEDULED: "bg-blue-50 text-blue-700",
  IN_PROGRESS: "bg-amber-50 text-amber-700",
  COMPLETED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-600",
  NO_SHOW: "bg-gray-100 text-gray-600",
};

const statusLabels: Record<string, string> = {
  SCHEDULED: "Agendado",
  IN_PROGRESS: "Em curso",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
  NO_SHOW: "Não compareceu",
};

const transactionIcons: Record<string, React.ElementType> = {
  CREDIT: TrendingUp,
  DEBIT: TrendingDown,
  REFUND: RefreshCw,
  ADJUSTMENT: Settings,
};

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");
  const [showCreditForm, setShowCreditForm] = useState(false);
  const [creditAmount, setCreditAmount] = useState("");
  const [creditDescription, setCreditDescription] = useState("");
  const [creditType, setCreditType] = useState("CREDIT");

  async function fetchClient() {
    try {
      const res = await fetch(`/api/clients/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setClient(data);
      } else {
        router.push("/admin/clients");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (params.id) fetchClient();
  }, [params.id]);

  async function addCredit(e: React.FormEvent) {
    e.preventDefault();
    if (!client) return;

    try {
      const res = await fetch("/api/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: client.id,
          type: creditType,
          amount: parseFloat(creditAmount),
          description: creditDescription || `${creditType === "CREDIT" ? "Carregamento" : "Débito"} manual`,
          createdBy: "system",
        }),
      });

      if (res.ok) {
        setShowCreditForm(false);
        setCreditAmount("");
        setCreditDescription("");
        fetchClient();
      } else {
        const err = await res.json();
        alert(err.error || "Erro");
      }
    } catch {
      alert("Erro ao registar transação");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-3 border-sky-200 border-t-sky-700 rounded-full animate-spin" />
      </div>
    );
  }

  if (!client) return null;

  const tabs = [
    { key: "info", label: "Dados", icon: User },
    { key: "history", label: "Histórico", icon: Calendar },
    { key: "credits", label: "Créditos", icon: CreditCard },
    { key: "packs", label: "Packs", icon: FileText },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <Link
          href="/admin/clients"
          className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors mt-1"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center">
              <span className="text-sky-700 font-bold text-lg">
                {client.firstName.charAt(0)}
                {client.lastName.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {client.firstName} {client.lastName}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm font-mono text-sky-600 bg-sky-50 px-2 py-0.5 rounded">
                  #{client.clientNumber}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${client.active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                  {client.active ? "Activo" : "Inactivo"}
                </span>
                <span className="text-sm text-gray-400">
                  Desde {formatDate(client.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="text-center px-4 py-2 bg-white border border-gray-200 rounded-xl">
            <p className={`text-xl font-bold ${client.creditBalance > 0 ? "text-green-600" : client.creditBalance < 0 ? "text-red-600" : "text-gray-400"}`}>
              {formatCurrency(client.creditBalance)}
            </p>
            <p className="text-xs text-gray-500">Saldo</p>
          </div>
          <div className="text-center px-4 py-2 bg-white border border-gray-200 rounded-xl">
            <p className="text-xl font-bold text-gray-900">
              {client._count.appointments}
            </p>
            <p className="text-xs text-gray-500">Reservas</p>
          </div>
        </div>
      </div>

      {/* Allergies Alert */}
      {client.allergies && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">Alergias / Sensibilidades</p>
            <p className="text-sm text-red-700 mt-0.5">{client.allergies}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
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

      {/* Tab Content */}
      {activeTab === "info" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-gray-400" />
                <span className="text-sm text-gray-700">{client.phone}</span>
              </div>
              {client.email && (
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-700">{client.email}</span>
                </div>
              )}
              {client.birthDate && (
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-700">{formatDate(client.birthDate)}</span>
                </div>
              )}
              {client.nif && (
                <div className="flex items-center gap-3">
                  <Hash size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-700">NIF: {client.nif}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Morada</h3>
            <div className="space-y-1 text-sm text-gray-700">
              {client.address && <p>{client.address}</p>}
              {(client.postalCode || client.city) && (
                <p>
                  {client.postalCode} {client.city}
                </p>
              )}
              <p>{client.country}</p>
              {!client.address && !client.city && (
                <p className="text-gray-400 italic">Sem morada registada</p>
              )}
            </div>
          </div>

          {client.notes && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText size={16} className="text-sky-700" />
                Observações
              </h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{client.notes}</p>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield size={16} className="text-sky-700" />
              Consentimentos
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">RGPD</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${client.gdprConsent ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                  {client.gdprConsent ? "Autorizado" : "Não autorizado"}
                </span>
              </div>
              {client.gdprConsentDate && (
                <p className="text-xs text-gray-400">
                  Consentido em {formatDateTime(client.gdprConsentDate)}
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">WhatsApp</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${client.whatsappOptIn ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {client.whatsappOptIn ? "Opt-in" : "Opt-out"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {client.appointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Sem reservas registadas</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {client.appointments.map((apt) => (
                <div key={apt.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center">
                        <Calendar size={18} className="text-sky-700" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{apt.service.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatDateTime(apt.scheduledAt)} · {apt.professional.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(Number(apt.price))}
                      </p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[apt.status]}`}>
                        {statusLabels[apt.status]}
                      </span>
                    </div>
                  </div>
                  {apt.notes && (
                    <p className="text-xs text-gray-500 mt-2 ml-13 pl-13">{apt.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "credits" && (
        <div>
          {/* Credit Balance + Add button */}
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
              <CreditCard size={24} className="text-sky-700" />
              <div>
                <p className="text-xs text-gray-500">Saldo Actual</p>
                <p className={`text-2xl font-bold ${client.creditBalance > 0 ? "text-green-600" : client.creditBalance < 0 ? "text-red-600" : "text-gray-400"}`}>
                  {formatCurrency(client.creditBalance)}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreditForm(true)}
              className="flex items-center gap-2 bg-sky-700 text-white px-4 py-2.5 rounded-xl hover:bg-sky-800 transition-colors font-medium text-sm"
            >
              <Plus size={18} />
              Nova Transação
            </button>
          </div>

          {/* Credit Form Modal */}
          {showCreditForm && (
            <div className="bg-white border border-sky-200 rounded-xl p-6 mb-4">
              <h3 className="font-bold text-gray-900 mb-4">Nova Transação de Crédito</h3>
              <form onSubmit={addCredit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <select
                      value={creditType}
                      onChange={(e) => setCreditType(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="CREDIT">Carregamento</option>
                      <option value="DEBIT">Débito Manual</option>
                      <option value="REFUND">Reembolso</option>
                      <option value="ADJUSTMENT">Ajuste</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor (€)</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0.01"
                      value={creditAmount}
                      onChange={(e) => setCreditAmount(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <input
                    type="text"
                    value={creditDescription}
                    onChange={(e) => setCreditDescription(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Motivo da transação..."
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setShowCreditForm(false)} className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200">
                    Cancelar
                  </button>
                  <button type="submit" className="px-4 py-2 text-sm text-white bg-sky-700 rounded-xl hover:bg-sky-800">
                    Registar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Credit History */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {client.credits.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">Sem transações de crédito</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {client.credits.map((tx) => {
                  const Icon = transactionIcons[tx.type] || CreditCard;
                  const isPositive = Number(tx.amount) > 0;
                  return (
                    <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-gray-50/50">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPositive ? "bg-green-50" : "bg-red-50"}`}>
                          <Icon size={16} className={isPositive ? "text-green-600" : "text-red-600"} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{tx.description || tx.type}</p>
                          <p className="text-xs text-gray-500">{formatDateTime(tx.createdAt)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                          {isPositive ? "+" : ""}{formatCurrency(Number(tx.amount))}
                        </p>
                        <p className="text-xs text-gray-400">
                          Saldo: {formatCurrency(Number(tx.balance))}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "packs" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {client.clientPacks.length === 0 ? (
            <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-12 text-center">
              <FileText size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Sem packs associados</p>
            </div>
          ) : (
            client.clientPacks.map((cp) => {
              const remaining = cp.pack.totalSessions - cp.sessionsUsed;
              const progress = (cp.sessionsUsed / cp.pack.totalSessions) * 100;
              return (
                <div key={cp.id} className="bg-white rounded-xl border border-gray-200 p-5">
                  <h3 className="font-bold text-gray-900">{cp.pack.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{formatCurrency(Number(cp.pack.price))}</p>
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{cp.sessionsUsed}/{cp.pack.totalSessions} sessões</span>
                      <span className={`font-semibold ${remaining > 0 ? "text-green-600" : "text-gray-400"}`}>
                        {remaining} restantes
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-sky-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(100, progress)}%` }}
                      />
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-400">
                    Adquirido em {formatDate(cp.purchasedAt)}
                    {cp.expiresAt && ` · Expira ${formatDate(cp.expiresAt)}`}
                  </div>
                  {cp.pack.services.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Serviços incluídos:</p>
                      <div className="flex flex-wrap gap-1">
                        {cp.pack.services.map((ps, i) => (
                          <span key={i} className="text-[10px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full">
                            {ps.service.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
