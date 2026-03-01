"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Percent,
  CheckCircle,
  Clock,
  DollarSign,
  User,
  Calendar,
  Check,
  CreditCard,
  Filter,
} from "lucide-react";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";

interface CommissionRecord {
  id: string;
  servicePrice: number | string;
  commissionRate: number | string;
  commissionValue: number | string;
  status: string;
  paidAt: string | null;
  paymentRef: string | null;
  notes: string | null;
  createdAt: string;
  professional: { id: string; name: string };
  appointment: {
    id: string;
    scheduledAt: string;
    client: { firstName: string; lastName: string };
    service: { name: string };
  };
}

interface CommissionSummary {
  professionalId: string;
  professionalName: string;
  totalServices: number;
  totalRevenue: number;
  commissionRate: number;
  totalCommission: number;
  pending: number;
  approved: number;
  paid: number;
}

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  APPROVED: "bg-blue-50 text-blue-700",
  PAID: "bg-green-50 text-green-700",
  DISPUTED: "bg-red-50 text-red-600",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovada",
  PAID: "Paga",
  DISPUTED: "Contestada",
};

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [summaries, setSummaries] = useState<CommissionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [view, setView] = useState<"summary" | "detail">("summary");

  async function fetchCommissions() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set("status", filterStatus);
      const res = await fetch(`/api/commissions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCommissions(data.commissions || []);
        setSummaries(data.summaries || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCommissions();
  }, [filterStatus]);

  async function updateStatus(id: string, status: string, paymentRef?: string) {
    try {
      const res = await fetch(`/api/commissions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, paymentRef }),
      });
      if (res.ok) fetchCommissions();
    } catch {
      alert("Erro ao actualizar comissão");
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/reports"
          className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comissões</h1>
          <p className="text-gray-500 mt-1">
            Gestão de comissões dos parceiros
          </p>
        </div>
      </div>

      {/* View Toggle + Filters */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-6">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setView("summary")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === "summary"
                ? "bg-white text-sky-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Resumo
          </button>
          <button
            onClick={() => setView("detail")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              view === "detail"
                ? "bg-white text-sky-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Detalhe
          </button>
        </div>

        <div className="flex gap-2">
          {Object.entries(statusLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() =>
                setFilterStatus(filterStatus === key ? "" : key)
              }
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filterStatus === key
                  ? "bg-sky-700 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-3 border-sky-200 border-t-sky-700 rounded-full animate-spin" />
        </div>
      ) : view === "summary" ? (
        <div className="space-y-4">
          {summaries.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Percent size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Sem comissões registadas</p>
            </div>
          ) : (
            summaries.map((s) => (
              <div
                key={s.professionalId}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
                      <User size={18} className="text-sky-700" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {s.professionalName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {s.totalServices} serviços · Taxa: {s.commissionRate}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500">Receita Gerada</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(s.totalRevenue)}
                    </p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl">
                    <p className="text-xs text-amber-600">Pendente</p>
                    <p className="text-lg font-bold text-amber-700">
                      {formatCurrency(s.pending)}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <p className="text-xs text-blue-600">Aprovada</p>
                    <p className="text-lg font-bold text-blue-700">
                      {formatCurrency(s.approved)}
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-xl">
                    <p className="text-xs text-green-600">Paga</p>
                    <p className="text-lg font-bold text-green-700">
                      {formatCurrency(s.paid)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Detail view */
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {commissions.length === 0 ? (
            <div className="p-12 text-center">
              <Percent size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">Sem comissões encontradas</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {commissions.map((c) => (
                <div
                  key={c.id}
                  className="p-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900">
                          {c.professional.name}
                        </span>
                        <span className="text-xs text-gray-400">·</span>
                        <span className="text-sm text-gray-600">
                          {c.appointment.service.name}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            statusColors[c.status]
                          }`}
                        >
                          {statusLabels[c.status]}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>
                          Cliente: {c.appointment.client.firstName}{" "}
                          {c.appointment.client.lastName}
                        </span>
                        <span>
                          {formatDate(c.appointment.scheduledAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {formatCurrency(Number(c.servicePrice))} ×{" "}
                          {String(c.commissionRate)}%
                        </p>
                        <p className="text-sm font-bold text-sky-700">
                          {formatCurrency(Number(c.commissionValue))}
                        </p>
                      </div>

                      {c.status === "PENDING" && (
                        <button
                          onClick={() => updateStatus(c.id, "APPROVED")}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Aprovar"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      {c.status === "APPROVED" && (
                        <button
                          onClick={() => {
                            const ref = prompt("Referência de pagamento:");
                            if (ref !== null) {
                              updateStatus(c.id, "PAID", ref);
                            }
                          }}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Marcar como paga"
                        >
                          <CreditCard size={16} />
                        </button>
                      )}
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
