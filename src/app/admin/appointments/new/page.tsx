"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Calendar,
  User,
  Scissors,
  CreditCard,
  Search,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ClientOption {
  id: string;
  clientNumber: number;
  firstName: string;
  lastName: string;
  phone: string;
  creditBalance: number;
  allergies: string | null;
}

interface ServiceOption {
  id: string;
  name: string;
  category: string;
  price: number | string;
  duration: number;
  professionalType: string;
}

interface ProfessionalOption {
  id: string;
  name: string;
  role: string;
  commissionRate: number | string | null;
}

interface ClientPack {
  id: string;
  sessionsUsed: number;
  pack: {
    name: string;
    totalSessions: number;
    services: Array<{ service: { id: string; name: string } }>;
  };
}

const categoryLabels: Record<string, string> = {
  ESTETICA_CORPORAL: "Estética Corporal",
  ESTETICA_FACIAL: "Estética Facial",
  CABELEREIRA: "Cabelereira",
  NAIL_DESIGNER: "Nail Designer",
  HOLISTICO: "Holístico",
};

export default function NewAppointmentPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Options
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [professionals, setProfessionals] = useState<ProfessionalOption[]>([]);
  const [clientPacks, setClientPacks] = useState<ClientPack[]>([]);

  // Search
  const [clientSearch, setClientSearch] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  // Form
  const [selectedClient, setSelectedClient] = useState<ClientOption | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceOption | null>(null);
  const [formData, setFormData] = useState({
    serviceId: "",
    professionalId: "",
    scheduledDate: "",
    scheduledTime: "",
    price: "",
    paymentMethod: "",
    notes: "",
    clientPackId: "",
  });

  useEffect(() => {
    // Fetch services and professionals
    Promise.all([
      fetch("/api/services?active=true").then((r) => r.json()),
      fetch("/api/professionals").then((r) => r.json()),
    ]).then(([servicesData, professionalsData]) => {
      setServices(servicesData);
      setProfessionals(professionalsData);
    });
  }, []);

  // Search clients
  useEffect(() => {
    if (clientSearch.length >= 2) {
      fetch(`/api/clients?search=${clientSearch}&limit=10`)
        .then((r) => r.json())
        .then((data) => {
          setClients(data.clients);
          setShowClientDropdown(true);
        });
    } else {
      setClients([]);
      setShowClientDropdown(false);
    }
  }, [clientSearch]);

  // When client is selected, fetch their packs
  useEffect(() => {
    if (selectedClient) {
      fetch(`/api/clients/${selectedClient.id}`)
        .then((r) => r.json())
        .then((data) => {
          setClientPacks(data.clientPacks || []);
        });
    }
  }, [selectedClient]);

  // When service is selected, auto-fill price
  function handleServiceChange(serviceId: string) {
    const service = services.find((s) => s.id === serviceId);
    setSelectedService(service || null);
    setFormData((prev) => ({
      ...prev,
      serviceId,
      price: service ? String(service.price) : "",
    }));
  }

  function selectClient(client: ClientOption) {
    setSelectedClient(client);
    setClientSearch(`${client.firstName} ${client.lastName}`);
    setShowClientDropdown(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClient) {
      alert("Seleccione um cliente");
      return;
    }
    setSaving(true);

    try {
      const scheduledAt = new Date(
        `${formData.scheduledDate}T${formData.scheduledTime}`
      );

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient.id,
          serviceId: formData.serviceId,
          professionalId: formData.professionalId,
          scheduledAt: scheduledAt.toISOString(),
          price: parseFloat(formData.price),
          paymentMethod: formData.paymentMethod || null,
          notes: formData.notes || null,
          clientPackId: formData.clientPackId || null,
        }),
      });

      if (res.ok) {
        router.push("/admin/appointments");
      } else {
        const err = await res.json();
        alert(err.error || "Erro ao criar reserva");
      }
    } catch {
      alert("Erro ao criar reserva");
    } finally {
      setSaving(false);
    }
  }

  // Group services by category
  const groupedServices = services.reduce(
    (acc, s) => {
      if (!acc[s.category]) acc[s.category] = [];
      acc[s.category].push(s);
      return acc;
    },
    {} as Record<string, ServiceOption[]>
  );

  // Available packs for selected service
  const availablePacks = clientPacks.filter((cp) => {
    if (!formData.serviceId) return false;
    return (
      cp.pack.services.some((ps) => ps.service.id === formData.serviceId) &&
      cp.sessionsUsed < cp.pack.totalSessions
    );
  });

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/appointments"
          className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Nova Reserva
          </h1>
          <p className="text-gray-500 mt-1">Registar uma nova reserva</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Client Selection */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User size={20} className="text-sky-700" />
              Cliente
            </h2>

            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={clientSearch}
                onChange={(e) => {
                  setClientSearch(e.target.value);
                  if (selectedClient) setSelectedClient(null);
                }}
                placeholder="Pesquisar por nome, telemóvel..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />

              {/* Dropdown */}
              {showClientDropdown && clients.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {clients.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => selectClient(c)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            {c.firstName} {c.lastName}
                          </span>
                          <span className="text-xs text-sky-600 ml-2">
                            #{c.clientNumber}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">{c.phone}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedClient && (
              <div className="mt-4 p-3 bg-sky-50 rounded-xl border border-sky-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      {selectedClient.firstName} {selectedClient.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      #{selectedClient.clientNumber} · {selectedClient.phone}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Saldo</p>
                    <p
                      className={`text-sm font-bold ${
                        selectedClient.creditBalance > 0
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {formatCurrency(selectedClient.creditBalance)}
                    </p>
                  </div>
                </div>
                {selectedClient.allergies && (
                  <div className="mt-2 flex items-start gap-2 bg-red-50 p-2 rounded-lg">
                    <AlertTriangle
                      size={14}
                      className="text-red-500 flex-shrink-0 mt-0.5"
                    />
                    <p className="text-xs text-red-700">
                      {selectedClient.allergies}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Service Selection */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Scissors size={20} className="text-sky-700" />
              Serviço
            </h2>

            <select
              required
              value={formData.serviceId}
              onChange={(e) => handleServiceChange(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 mb-4"
            >
              <option value="">Seleccione um serviço...</option>
              {Object.entries(groupedServices).map(([cat, svcs]) => (
                <optgroup key={cat} label={categoryLabels[cat] || cat}>
                  {svcs.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {formatCurrency(Number(s.price))} ({s.duration}
                      min)
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            {selectedService && (
              <div className="flex items-center gap-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                <span className="flex items-center gap-1">
                  <CreditCard size={14} />
                  {formatCurrency(Number(selectedService.price))}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {selectedService.duration} min
                </span>
                <span className="text-xs text-gray-400">
                  {selectedService.professionalType === "PRINCIPAL"
                    ? "Principal"
                    : "Parceiro"}
                </span>
              </div>
            )}
          </div>

          {/* Schedule & Professional */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-sky-700" />
              Agendamento
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.scheduledDate}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduledDate: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.scheduledTime}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduledTime: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profissional *
                </label>
                <select
                  required
                  value={formData.professionalId}
                  onChange={(e) =>
                    setFormData({ ...formData, professionalId: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">Seleccione...</option>
                  {professionals.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}{" "}
                      {p.commissionRate
                        ? `(${p.commissionRate}% comissão)`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Payment & Notes */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard size={20} className="text-sky-700" />
              Pagamento
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preço (€) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Método de Pagamento
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentMethod: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="">Seleccione...</option>
                    <option value="CASH">Dinheiro</option>
                    <option value="CARD">Cartão</option>
                    <option value="MBWAY">MB Way</option>
                    <option value="TRANSFER">Transferência</option>
                    <option value="CREDIT_BALANCE">
                      Saldo Pré-pago{" "}
                      {selectedClient
                        ? `(${formatCurrency(selectedClient.creditBalance)})`
                        : ""}
                    </option>
                    {availablePacks.length > 0 && (
                      <option value="PACK">Sessão de Pack</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Pack selection */}
              {formData.paymentMethod === "PACK" && availablePacks.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pack
                  </label>
                  <select
                    value={formData.clientPackId}
                    onChange={(e) =>
                      setFormData({ ...formData, clientPackId: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="">Seleccione o pack...</option>
                    {availablePacks.map((cp) => (
                      <option key={cp.id} value={cp.id}>
                        {cp.pack.name} ({cp.sessionsUsed}/{cp.pack.totalSessions}{" "}
                        usadas)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Warning if credit balance insufficient */}
              {formData.paymentMethod === "CREDIT_BALANCE" &&
                selectedClient &&
                parseFloat(formData.price || "0") >
                  selectedClient.creditBalance && (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 p-3 rounded-xl">
                    <AlertTriangle
                      size={14}
                      className="text-amber-600 flex-shrink-0 mt-0.5"
                    />
                    <p className="text-xs text-amber-800">
                      Saldo insuficiente. O cliente tem{" "}
                      {formatCurrency(selectedClient.creditBalance)} de saldo.
                    </p>
                  </div>
                )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                  placeholder="Observações sobre a reserva..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <Link
            href="/admin/appointments"
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving || !selectedClient}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-sky-700 rounded-xl hover:bg-sky-800 transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? "A guardar..." : "Criar Reserva"}
          </button>
        </div>
      </form>
    </div>
  );
}
