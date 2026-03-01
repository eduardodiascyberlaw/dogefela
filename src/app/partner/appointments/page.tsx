"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  Play,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";

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
  };
  service: {
    id: string;
    name: string;
    category: string;
    duration: number;
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

export default function PartnerAppointmentsPage() {
  const { data: session } = useSession();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  async function fetchAppointments() {
    if (!session?.user?.id) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("professionalId", session.user.id);
      params.set("page", String(page));
      params.set("limit", "20");
      if (filterStatus) params.set("status", filterStatus);

      const res = await fetch(`/api/appointments?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAppointments();
  }, [session, filterStatus, page]);

  async function updateStatus(id: string, newStatus: string) {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchAppointments();
    } catch {
      alert("Erro ao actualizar");
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Minhas Reservas
        </h1>
        <p className="text-gray-500 mt-1">
          As reservas que realizou ou tem agendadas
        </p>
      </div>

      {/* Filters */}
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
          <div className="divide-y divide-gray-50">
            {appointments.map((apt) => (
              <div key={apt.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center">
                      <Calendar size={18} className="text-sky-700" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 text-sm">
                          {apt.service.name}
                        </p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[apt.status]}`}>
                          {statusLabels[apt.status]}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <User size={12} className="text-gray-400" />
                          {apt.client.firstName} {apt.client.lastName}
                        </span>
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock size={12} className="text-gray-400" />
                          {formatDateTime(apt.scheduledAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-bold text-gray-900">
                      {formatCurrency(Number(apt.price))}
                    </p>
                    {apt.status === "SCHEDULED" && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => updateStatus(apt.id, "IN_PROGRESS")}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg"
                          title="Iniciar"
                        >
                          <Play size={16} />
                        </button>
                        <button
                          onClick={() => updateStatus(apt.id, "COMPLETED")}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Concluir"
                        >
                          <CheckCircle size={16} />
                        </button>
                      </div>
                    )}
                    {apt.status === "IN_PROGRESS" && (
                      <button
                        onClick={() => updateStatus(apt.id, "COMPLETED")}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
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
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">Página {page} de {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-gray-200 disabled:opacity-50">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-gray-200 disabled:opacity-50">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
