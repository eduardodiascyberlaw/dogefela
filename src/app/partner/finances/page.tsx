"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  TrendingUp,
  Percent,
  Calendar,
  Clock,
  CheckCircle,
  CreditCard,
  BarChart3,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface CommissionRecord {
  id: string;
  servicePrice: number | string;
  commissionRate: number | string;
  commissionValue: number | string;
  status: string;
  paidAt: string | null;
  paymentRef: string | null;
  createdAt: string;
  appointment: {
    scheduledAt: string;
    client: { firstName: string; lastName: string };
    service: { name: string };
  };
}

interface FinanceSummary {
  totalRevenue: number;
  totalCommission: number;
  pending: number;
  approved: number;
  paid: number;
  commissionRate: number;
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

export default function PartnerFinancesPage() {
  const { data: session } = useSession();
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!session?.user?.id) return;
      try {
        const res = await fetch(
          `/api/commissions?professionalId=${session.user.id}`
        );
        if (res.ok) {
          const data = await res.json();
          setCommissions(data.commissions || []);

          // Build summary from commissions
          const mySummary = (data.summaries || []).find(
            (s: { professionalId: string }) => s.professionalId === session.user.id
          );
          if (mySummary) {
            setSummary(mySummary);
          }
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [session]);

  const displaySummary = summary || {
    totalRevenue: 0,
    totalCommission: 0,
    pending: 0,
    approved: 0,
    paid: 0,
    commissionRate: 0,
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Relatório Financeiro
        </h1>
        <p className="text-gray-500 mt-1">
          Receita gerada e comissões
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-3 border-sky-200 border-t-sky-700 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Receita Gerada</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(displaySummary.totalRevenue)}
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
                  <p className="text-sm text-gray-500">Pendente</p>
                  <p className="text-2xl font-bold text-amber-700 mt-1">
                    {formatCurrency(displaySummary.pending)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Clock size={20} className="text-amber-700" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Aprovada</p>
                  <p className="text-2xl font-bold text-blue-700 mt-1">
                    {formatCurrency(displaySummary.approved)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <CheckCircle size={20} className="text-blue-700" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Paga</p>
                  <p className="text-2xl font-bold text-green-700 mt-1">
                    {formatCurrency(displaySummary.paid)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <CreditCard size={20} className="text-green-700" />
                </div>
              </div>
            </div>
          </div>

          {/* Commission History */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">
                Histórico de Comissões
              </h3>
            </div>
            {commissions.length === 0 ? (
              <div className="text-center py-12">
                <Percent size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">Sem comissões registadas</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {commissions.map((c) => (
                  <div key={c.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">
                            {c.appointment.service.name}
                          </p>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[c.status]}`}>
                            {statusLabels[c.status]}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {c.appointment.client.firstName}{" "}
                          {c.appointment.client.lastName} ·{" "}
                          {formatDate(c.appointment.scheduledAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">
                          {formatCurrency(Number(c.servicePrice))} ×{" "}
                          {String(c.commissionRate)}%
                        </p>
                        <p className="text-sm font-bold text-sky-700">
                          {formatCurrency(Number(c.commissionValue))}
                        </p>
                        {c.paidAt && (
                          <p className="text-[10px] text-green-600">
                            Paga em {formatDate(c.paidAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
