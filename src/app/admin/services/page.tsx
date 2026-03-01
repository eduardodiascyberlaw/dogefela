"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Scissors,
  Sparkles,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Clock,
  Filter,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Service {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number | string;
  duration: number;
  active: boolean;
  professionalType: string;
  imageUrl: string | null;
}

const categoryLabels: Record<string, string> = {
  ESTETICA_CORPORAL: "Estética Corporal",
  ESTETICA_FACIAL: "Estética Facial",
  CABELEREIRA: "Cabelereira",
  NAIL_DESIGNER: "Nail Designer",
  HOLISTICO: "Holístico",
};

const categoryColors: Record<string, string> = {
  ESTETICA_CORPORAL: "bg-pink-50 text-pink-700 border-pink-200",
  ESTETICA_FACIAL: "bg-sky-50 text-sky-700 border-sky-200",
  CABELEREIRA: "bg-amber-50 text-amber-700 border-amber-200",
  NAIL_DESIGNER: "bg-blue-50 text-blue-700 border-blue-200",
  HOLISTICO: "bg-green-50 text-green-700 border-green-200",
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "ESTETICA_CORPORAL",
    price: "",
    duration: "",
    professionalType: "PRINCIPAL",
    active: true,
  });

  async function fetchServices() {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filterCategory) params.set("category", filterCategory);
      const res = await fetch(`/api/services?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setServices(data);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchServices();
  }, [search, filterCategory]);

  function openNewForm() {
    setEditingService(null);
    setFormData({
      name: "",
      description: "",
      category: "ESTETICA_CORPORAL",
      price: "",
      duration: "",
      professionalType: "PRINCIPAL",
      active: true,
    });
    setShowForm(true);
  }

  function openEditForm(service: Service) {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || "",
      category: service.category,
      price: String(service.price),
      duration: String(service.duration),
      professionalType: service.professionalType,
      active: service.active,
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const url = editingService
        ? `/api/services/${editingService.id}`
        : "/api/services";
      const method = editingService ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          duration: parseInt(formData.duration),
        }),
      });

      if (res.ok) {
        setShowForm(false);
        fetchServices();
      } else {
        const err = await res.json();
        alert(err.error || "Erro ao guardar serviço");
      }
    } catch {
      alert("Erro ao guardar serviço");
    }
  }

  async function toggleActive(service: Service) {
    try {
      const res = await fetch(`/api/services/${service.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !service.active }),
      });
      if (res.ok) fetchServices();
    } catch {
      alert("Erro ao alterar estado");
    }
  }

  async function deleteService(service: Service) {
    if (!confirm(`Tem a certeza que quer eliminar "${service.name}"?`)) return;
    try {
      const res = await fetch(`/api/services/${service.id}`, { method: "DELETE" });
      if (res.ok) fetchServices();
    } catch {
      alert("Erro ao eliminar serviço");
    }
  }

  const grouped = services.reduce(
    (acc, s) => {
      if (!acc[s.category]) acc[s.category] = [];
      acc[s.category].push(s);
      return acc;
    },
    {} as Record<string, Service[]>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
          <p className="text-gray-500 mt-1">
            {services.length} serviços registados
          </p>
        </div>
        <button
          onClick={openNewForm}
          className="flex items-center gap-2 bg-sky-700 text-white px-4 py-2.5 rounded-xl hover:bg-sky-800 transition-colors font-medium text-sm"
        >
          <Plus size={18} />
          Novo Serviço
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Pesquisar serviços..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="pl-10 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="">Todas as categorias</option>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-3 border-sky-200 border-t-sky-700 rounded-full animate-spin" />
        </div>
      ) : filterCategory ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onEdit={openEditForm}
              onToggle={toggleActive}
              onDelete={deleteService}
            />
          ))}
        </div>
      ) : (
        Object.entries(categoryLabels).map(([cat, label]) => {
          const catServices = grouped[cat];
          if (!catServices || catServices.length === 0) return null;
          return (
            <div key={cat} className="mb-8">
              <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${categoryColors[cat]}`}
                >
                  {label}
                </span>
                <span className="text-sm font-normal text-gray-400">
                  {catServices.length} serviço{catServices.length !== 1 ? "s" : ""}
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {catServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onEdit={openEditForm}
                    onToggle={toggleActive}
                    onDelete={deleteService}
                  />
                ))}
              </div>
            </div>
          );
        })
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {editingService ? "Editar Serviço" : "Novo Serviço"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Ex: Sculpt Body"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                  placeholder="Descrição do serviço..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profissional
                  </label>
                  <select
                    value={formData.professionalType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        professionalType: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="PRINCIPAL">Principal</option>
                    <option value="PARCEIRO">Parceiro</option>
                  </select>
                </div>
              </div>

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
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duração (min) *
                  </label>
                  <input
                    type="number"
                    required
                    min="5"
                    step="5"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="60"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) =>
                      setFormData({ ...formData, active: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-100 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600" />
                </label>
                <span className="text-sm text-gray-700">Serviço activo</span>
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
                  {editingService ? "Guardar Alterações" : "Criar Serviço"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ServiceCard({
  service,
  onEdit,
  onToggle,
  onDelete,
}: {
  service: Service;
  onEdit: (s: Service) => void;
  onToggle: (s: Service) => void;
  onDelete: (s: Service) => void;
}) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all ${
        !service.active ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{service.name}</h3>
          {service.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {service.description}
            </p>
          )}
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ml-2 ${
            categoryColors[service.category]
          }`}
        >
          {categoryLabels[service.category]}
        </span>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-xl font-bold text-sky-700">
            {formatCurrency(Number(service.price))}
          </span>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Clock size={14} />
          <span>{service.duration} min</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            service.professionalType === "PRINCIPAL"
              ? "bg-sky-50 text-sky-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {service.professionalType === "PRINCIPAL" ? "Principal" : "Parceiro"}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggle(service)}
            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
            title={service.active ? "Desactivar" : "Activar"}
          >
            {service.active ? (
              <ToggleRight size={18} className="text-green-600" />
            ) : (
              <ToggleLeft size={18} />
            )}
          </button>
          <button
            onClick={() => onEdit(service)}
            className="p-1.5 text-gray-400 hover:text-sky-600 transition-colors"
            title="Editar"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(service)}
            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
