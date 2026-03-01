"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Users,
  DollarSign,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  FileText,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ReportStats {
  totalRevenue: number;
  totalAppointments: number;
  avgTicket: number;
  revenueByCategory: Array<{ category: string; total: number; count: number }>;
  revenueByProfessional: Array<{ name: string; total: number; count: number }>;
  revenueByPayment: Array<{ method: string; total: number; count: number }>;
  topClients: Array<{ name: string; total: number; count: number }>;
  totalCommissions: number;
}

const categoryLabels: Record<string, string> = {
  ESTETICA_CORPORAL: "Estética Corporal",
  ESTETICA_FACIAL: "Estética Facial",
  CABELEREIRA: "Cabelereira",
  NAIL_DESIGNER: "Nail Designer",
  HOLISTICO: "Holístico",
};

const paymentLabels: Record<string, string> = {
  CREDIT_BALANCE: "Saldo Pré-pago",
  CASH: "Dinheiro",
  CARD: "Cartão",
  MBWAY: "MB Way",
  TRANSFER: "Transferência",
  PACK: "Pack",
};

export default function ReportsPage() {
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split("T")[0];
  });
  const [dateTo, setDateTo] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  async function fetchReport() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("dateFrom", dateFrom);
      params.set("dateTo", dateTo);
      const res = await fetch(`/api/reports?${params.toString()}`);
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

  useEffect(() => {
    fetchReport();
  }, [dateFrom, dateTo]);

  function setPeriodDates(p: string) {
    setPeriod(p);
    const now = new Date();
    let from: Date;
    switch (p) {
      case "today":
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "week":
        from = new Date(now);
        from.setDate(now.getDate() - now.getDay() + 1);
        break;
      case "month":
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "quarter":
        from = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case "year":
        from = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return;
    }
    setDateFrom(from.toISOString().split("T")[0]);
    setDateTo(now.toISOString().split("T")[0]);
  }

  const displayStats = stats || {
    totalRevenue: 0,
    totalAppointments: 0,
    avgTicket: 0,
    revenueByCategory: [],
    revenueByProfessional: [],
    revenueByPayment: [],
    topClients: [],
    totalCommissions: 0,
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-500 mt-1">Relatório financeiro da clínica</p>
        </div>
        <Link
          href="/admin/reports/commissions"
          className="flex items-center gap-2 text-sm font-medium text-sky-700 bg-sky-50 px-4 py-2.5 rounded-xl hover:bg-sky-100 transition-colors"
        >
          <Percent size={18} />
          Comissões
        </Link>
      </div>

      {/* Period Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {[
            { key: "today", label: "Hoje" },
            { key: "week", label: "Semana" },
            { key: "month", label: "Mês" },
            { key: "quarter", label: "Trimestre" },
            { key: "year", label: "Ano" },
          ].map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriodDates(p.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                period === p.key
                  ? "bg-white text-sky-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPeriod("custom");
            }}
            className="px-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <span className="text-gray-400">a</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPeriod("custom");
            }}
            className="px-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-3 border-sky-200 border-t-sky-700 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Receita Bruta</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(displayStats.totalRevenue)}
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
                  <p className="text-sm text-gray-500">Reservas</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {displayStats.totalAppointments}
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
                  <p className="text-sm text-gray-500">Ticket Médio</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(displayStats.avgTicket)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center">
                  <BarChart3 size={20} className="text-sky-700" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Comissões a Pagar</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(displayStats.totalCommissions)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Percent size={20} className="text-amber-700" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue by Category */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">
                Receita por Categoria
              </h3>
              {displayStats.revenueByCategory.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  Sem dados no período seleccionado
                </p>
              ) : (
                <div className="space-y-3">
                  {displayStats.revenueByCategory.map((cat, i) => {
                    const pct =
                      displayStats.totalRevenue > 0
                        ? (cat.total / displayStats.totalRevenue) * 100
                        : 0;
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700">
                            {categoryLabels[cat.category] || cat.category}
                          </span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(cat.total)}{" "}
                            <span className="text-gray-400 font-normal">
                              ({cat.count})
                            </span>
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-sky-500 h-2 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Revenue by Professional */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">
                Receita por Profissional
              </h3>
              {displayStats.revenueByProfessional.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  Sem dados no período seleccionado
                </p>
              ) : (
                <div className="space-y-3">
                  {displayStats.revenueByProfessional.map((pro, i) => {
                    const pct =
                      displayStats.totalRevenue > 0
                        ? (pro.total / displayStats.totalRevenue) * 100
                        : 0;
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700">{pro.name}</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(pro.total)}{" "}
                            <span className="text-gray-400 font-normal">
                              ({pro.count})
                            </span>
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-amber-500 h-2 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Revenue by Payment Method */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">
                Por Método de Pagamento
              </h3>
              {displayStats.revenueByPayment.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  Sem dados no período seleccionado
                </p>
              ) : (
                <div className="space-y-2">
                  {displayStats.revenueByPayment.map((pm, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                    >
                      <span className="text-sm text-gray-700">
                        {paymentLabels[pm.method] || pm.method || "N/A"}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(pm.total)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Clients */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">
                Top 10 Clientes
              </h3>
              {displayStats.topClients.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  Sem dados no período seleccionado
                </p>
              ) : (
                <div className="space-y-2">
                  {displayStats.topClients.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center text-xs font-bold text-sky-700">
                          {i + 1}
                        </span>
                        <span className="text-sm text-gray-700">{c.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(c.total)}
                        </span>
                        <span className="text-xs text-gray-400 ml-1">
                          ({c.count})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
