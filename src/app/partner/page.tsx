"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Calendar,
  TrendingUp,
  Percent,
  Clock,
  CheckCircle,
  BarChart3,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PartnerStats {
  appointmentsThisMonth: number;
  appointmentsTotal: number;
  revenueThisMonth: number;
  revenueTotal: number;
  commissionPending: number;
  commissionPaid: number;
  upcomingAppointments: number;
}

export default function PartnerDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<PartnerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/partner/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const displayStats = stats || {
    appointmentsThisMonth: 0,
    appointmentsTotal: 0,
    revenueThisMonth: 0,
    revenueTotal: 0,
    commissionPending: 0,
    commissionPaid: 0,
    upcomingAppointments: 0,
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Olá, {session?.user?.name?.split(" ")[0]}!
        </h1>
        <p className="text-gray-500 mt-1">
          Aqui está o resumo da sua actividade.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Reservas (Mês)</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {displayStats.appointmentsThisMonth}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {displayStats.appointmentsTotal} total
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Calendar size={20} className="text-blue-700" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Receita Gerada (Mês)</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(displayStats.revenueThisMonth)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {formatCurrency(displayStats.revenueTotal)} total
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <TrendingUp size={20} className="text-green-700" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Comissão Pendente</p>
              <p className="text-2xl font-bold text-amber-700 mt-1">
                {formatCurrency(displayStats.commissionPending)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {formatCurrency(displayStats.commissionPaid)} já paga
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <Percent size={20} className="text-amber-700" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Próximos Agendamentos</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {displayStats.upcomingAppointments}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center">
              <Clock size={20} className="text-sky-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Acções Rápidas
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/partner/appointments", label: "Minhas Reservas", icon: Calendar },
            { href: "/partner/clients", label: "Meus Clientes", icon: CheckCircle },
            { href: "/partner/finances", label: "Financeiro", icon: BarChart3 },
            { href: "/partner/profile", label: "Meu Perfil", icon: Clock },
          ].map((action) => (
            <a
              key={action.href}
              href={action.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-sky-200 hover:bg-sky-50 transition-all text-center"
            >
              <action.icon size={24} className="text-sky-700" />
              <span className="text-sm font-medium text-gray-700">
                {action.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
