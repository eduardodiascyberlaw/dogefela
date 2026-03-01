"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  UserCog,
  Mail,
  Phone,
  Percent,
  Shield,
  Edit,
  Briefcase,
} from "lucide-react";

interface Professional {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  phone: string | null;
  commissionRate: number | string | null;
  specialization: string | null;
  nif: string | null;
  iban: string | null;
  createdAt: string;
  _count: {
    performedServices: number;
    commissions: number;
  };
}

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Administrador",
  PARTNER: "Parceiro",
};

const roleColors: Record<string, string> = {
  SUPER_ADMIN: "bg-sky-50 text-sky-700",
  ADMIN: "bg-blue-50 text-blue-700",
  PARTNER: "bg-amber-50 text-amber-700",
};

export default function ProfessionalsPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "PARTNER",
    phone: "",
    commissionRate: "",
    specialization: "",
    nif: "",
    iban: "",
  });

  async function fetchProfessionals() {
    try {
      const res = await fetch("/api/professionals");
      if (res.ok) {
        const data = await res.json();
        setProfessionals(data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProfessionals();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/professionals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowForm(false);
        setFormData({
          name: "",
          email: "",
          password: "",
          role: "PARTNER",
          phone: "",
          commissionRate: "",
          specialization: "",
          nif: "",
          iban: "",
        });
        fetchProfessionals();
      } else {
        const err = await res.json();
        alert(err.error || "Erro ao criar profissional");
      }
    } catch {
      alert("Erro ao criar profissional");
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profissionais</h1>
          <p className="text-gray-500 mt-1">
            {professionals.length} profissionais registados
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-sky-700 text-white px-4 py-2.5 rounded-xl hover:bg-sky-800 transition-colors font-medium text-sm"
        >
          <Plus size={18} />
          Novo Profissional
        </button>
      </div>

      {/* Professionals Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-3 border-sky-200 border-t-sky-700 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {professionals.map((pro) => (
            <div
              key={pro.id}
              className={`bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all ${
                !pro.active ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sky-700 font-bold">
                    {pro.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {pro.name}
                    </h3>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        roleColors[pro.role]
                      }`}
                    >
                      {roleLabels[pro.role]}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600 flex items-center gap-1.5">
                      <Mail size={13} className="text-gray-400" />
                      <span className="truncate">{pro.email}</span>
                    </p>
                    {pro.phone && (
                      <p className="text-sm text-gray-600 flex items-center gap-1.5">
                        <Phone size={13} className="text-gray-400" />
                        {pro.phone}
                      </p>
                    )}
                    {pro.specialization && (
                      <p className="text-sm text-gray-600 flex items-center gap-1.5">
                        <Briefcase size={13} className="text-gray-400" />
                        {pro.specialization}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  {pro.commissionRate && (
                    <span className="text-sm font-semibold text-amber-700 flex items-center gap-1">
                      <Percent size={14} />
                      {String(pro.commissionRate)}%
                    </span>
                  )}
                  <span className="text-xs text-gray-400">
                    {pro._count.performedServices} reservas
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                Novo Profissional
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Registar um novo profissional ou parceiro
              </p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Min. 6 caracteres"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="PARTNER">Parceiro</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telemóvel
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Taxa de Comissão (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.commissionRate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        commissionRate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Ex: 30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Especialização
                  </label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specialization: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Ex: Cabelereira"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NIF
                  </label>
                  <input
                    type="text"
                    value={formData.nif}
                    onChange={(e) =>
                      setFormData({ ...formData, nif: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Contribuinte fiscal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IBAN
                  </label>
                  <input
                    type="text"
                    value={formData.iban}
                    onChange={(e) =>
                      setFormData({ ...formData, iban: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="PT50..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 text-sm font-medium text-white bg-sky-700 rounded-xl hover:bg-sky-800 transition-colors"
                >
                  Criar Profissional
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
