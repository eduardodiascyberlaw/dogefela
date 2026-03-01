"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Users, Phone, Mail, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PartnerClient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  appointmentCount: number;
  totalRevenue: number;
  lastVisit: string | null;
}

export default function PartnerClientsPage() {
  const { data: session } = useSession();
  const [clients, setClients] = useState<PartnerClient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClients() {
      if (!session?.user?.id) return;
      try {
        const res = await fetch(`/api/partner/clients`);
        if (res.ok) {
          const data = await res.json();
          setClients(data);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchClients();
  }, [session]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Meus Clientes</h1>
        <p className="text-gray-500 mt-1">
          Clientes que já atendeu na Dog Fella
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-sky-200 border-t-sky-700 rounded-full animate-spin" />
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Ainda não atendeu nenhum cliente</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {clients.map((client) => (
              <div key={client.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
                      <span className="text-sky-700 font-semibold text-sm">
                        {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {client.firstName} {client.lastName}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Phone size={10} className="text-gray-400" />
                          {client.phone}
                        </span>
                        {client.email && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Mail size={10} className="text-gray-400" />
                            {client.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {client.appointmentCount} reservas
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(client.totalRevenue)} receita
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
