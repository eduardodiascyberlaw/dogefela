"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Calendar,
  CreditCard,
  TrendingUp,
  Cake,
  AlertCircle,
  Scissors,
  UserCog,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface DashboardStats {
  totalClients: number;
  newClientsThisMonth: number;
  appointmentsToday: number;
  appointmentsThisWeek: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  totalCreditsBalance: number;
  pendingCommissions: number;
  upcomingBirthdays: number;
  inactiveClients: number;
}

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  color = "sky",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
  color?: string;
}) {
  const colors: Record<string, string> = {
    sky: "bg-sky-50 text-sky-700",
    gold: "bg-amber-50 text-amber-700",
    green: "bg-green-50 text-green-700",
    blue: "bg-blue-50 text-blue-700",
    red: "bg-red-50 text-red-700",
    pink: "bg-pink-50 text-pink-700",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subValue && (
            <p className="text-xs text-gray-400 mt-1">{subValue}</p>
          )}
        </div>
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  // Fallback stats if API not ready yet
  const displayStats = stats || {
    totalClients: 0,
    newClientsThisMonth: 0,
    appointmentsToday: 0,
    appointmentsThisWeek: 0,
    revenueThisMonth: 0,
    revenueLastMonth: 0,
    totalCreditsBalance: 0,
    pendingCommissions: 0,
    upcomingBirthdays: 0,
    inactiveClients: 0,
  };

  const revenueChange =
    displayStats.revenueLastMonth > 0
      ? (
          ((displayStats.revenueThisMonth - displayStats.revenueLastMonth) /
            displayStats.revenueLastMonth) *
          100
        ).toFixed(1)
      : "0";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Bem-vindo de volta! Aqui está o resumo da Dog Fella.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Users}
          label="Clientes Activos"
          value={displayStats.totalClients}
          subValue={`+${displayStats.newClientsThisMonth} este mês`}
          color="sky"
        />
        <StatCard
          icon={Calendar}
          label="Reservas Hoje"
          value={displayStats.appointmentsToday}
          subValue={`${displayStats.appointmentsThisWeek} esta semana`}
          color="blue"
        />
        <StatCard
          icon={TrendingUp}
          label="Receita do Mês"
          value={formatCurrency(displayStats.revenueThisMonth)}
          subValue={`${Number(revenueChange) >= 0 ? "+" : ""}${revenueChange}% vs mês anterior`}
          color="green"
        />
        <StatCard
          icon={CreditCard}
          label="Créditos em Circulação"
          value={formatCurrency(displayStats.totalCreditsBalance)}
          color="gold"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={UserCog}
          label="Comissões Pendentes"
          value={formatCurrency(displayStats.pendingCommissions)}
          color="pink"
        />
        <StatCard
          icon={Cake}
          label="Aniversários (7 dias)"
          value={displayStats.upcomingBirthdays}
          color="sky"
        />
        <StatCard
          icon={AlertCircle}
          label="Clientes Inactivos"
          value={displayStats.inactiveClients}
          subValue="Sem visita há 60+ dias"
          color="red"
        />
        <StatCard
          icon={Scissors}
          label="Serviços Disponíveis"
          value="14"
          subValue="5 categorias"
          color="blue"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Acções Rápidas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: "/admin/clients/new", label: "Novo Cliente", icon: Users },
            { href: "/admin/appointments/new", label: "Nova Reserva", icon: Calendar },
            { href: "/admin/services", label: "Gerir Serviços", icon: Scissors },
            { href: "/admin/reports", label: "Ver Relatórios", icon: TrendingUp },
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
