"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
} from "lucide-react";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";

interface Appointment {
  id: string;
  scheduledAt: string;
  completedAt: string | null;
  status: string;
  price: number | string;
  paymentMethod: string | null;
  notes: string | null;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    clientNumber: number;
    phone: string;
  };
  service: {
    id: string;
    name: string;
    category: string;
    duration: number;
  };
  professional: {
    id: string;
    name: string;
  };
}

const statusColors: Record<string, string> = {
  SCHEDULED: "bg-blue-50 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
  COMPLETED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-200",
  NO_SHOW: "bg-gray-100 text-gray-600 border-gray-200",
};

const statusLabels: Record<string, string> = {
  SCHEDULED: "Agendado",
  IN_PROGRESS: "Em curso",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
  NO_SHOW: "Não compareceu",
};

const paymentLabels: Record<string, string> = {
  CREDIT_BALANCE: "Saldo Pré-pago",
  CASH: "Dinheiro",
  CARD: "Cartão",
  MBWAY: "MB Way",
  TRANSFER: "Transferência",
  PACK: "Pack",
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  async function fetchAppointments() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "20");
      if (filterStatus) params.set("status", filterStatus);

      const res = await fetch(`/api/appointments?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAppointments();
  }, [filterStatus, page]);

  async function updateStatus(id: string, newStatus: string) {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchAppointments();
    } catch {
      alert("Erro ao actualizar estado");
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reservas</h1>
          <p className="text-gray-500 mt-1">{total} reservas registadas</p>
        </div>
        <Link
          href="/admin/appointments/new"
          className="flex items-center gap-2 bg-sky-700 text-white px-4 py-2.5 rounded-xl hover:bg-sky-800 transition-colors font-medium text-sm"
        >
          <Plus size={18} />
          Nova Reserva
        </Link>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => { setFilterStatus(""); setPage(1); }}
          className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            !filterStatus
              ? "bg-sky-700 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Todos
        </button>
        {Object.entries(statusLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => { setFilterStatus(key); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filterStatus === key
                ? "bg-sky-700 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-sky-200 border-t-sky-700 rounded-full animate-spin" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Nenhuma reserva encontrada</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-50">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0">
                        <Calendar size={18} className="text-sky-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900 text-sm">
                            {apt.service.name}
                          </p>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusColors[apt.status]}`}
                          >
                            {statusLabels[apt.status]}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                          <span className="text-sm text-gray-600 flex items-center gap-1">
                            <User size={12} className="text-gray-400" />
                            <Link href={`/admin/clients/${apt.client.id}`} className="hover:text-sky-700">
                              {apt.client.firstName} {apt.client.lastName}
                            </Link>
                            <span className="text-xs text-gray-400">#{apt.client.clientNumber}</span>
                          </span>
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock size={12} className="text-gray-400" />
                            {formatDateTime(apt.scheduledAt)}
                          </span>
                          <span className="text-xs text-gray-400">
                            Prof: {apt.professional.name}
                          </span>
                        </div>
                        {apt.paymentMethod && (
                          <span className="text-xs text-gray-400 mt-1 inline-block">
                            Pagamento: {paymentLabels[apt.paymentMethod] || apt.paymentMethod}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <p className="text-sm font-bold text-gray-900">
                        {formatCurrency(Number(apt.price))}
                      </p>

                      {/* Quick status actions */}
                      {apt.status === "SCHEDULED" && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => updateStatus(apt.id, "IN_PROGRESS")}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Iniciar"
                          >
                            <Play size={16} />
                          </button>
                          <button
                            onClick={() => updateStatus(apt.id, "COMPLETED")}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Concluir"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => updateStatus(apt.id, "CANCELLED")}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Cancelar"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      )}
                      {apt.status === "IN_PROGRESS" && (
                        <button
                          onClick={() => updateStatus(apt.id, "COMPLETED")}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Concluir"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Página {page} de {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
