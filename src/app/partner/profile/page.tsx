"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Percent,
  Save,
  Shield,
} from "lucide-react";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  specialization: string | null;
  commissionRate: number | string | null;
  nif: string | null;
  iban: string | null;
  createdAt: string;
}

export default function PartnerProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/partner/profile");
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setFormData({ name: data.name, phone: data.phone || "" });
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/partner/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setEditing(false);
      }
    } catch {
      alert("Erro ao guardar");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-3 border-sky-200 border-t-sky-700 rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-gray-500 mt-1">
          Os seus dados profissionais na Dog Fella
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <User size={20} className="text-sky-700" />
              Dados Pessoais
            </h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="text-sm text-sky-700 hover:text-sky-800 font-medium"
              >
                Editar
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1 text-sm text-white bg-sky-700 px-3 py-1 rounded-lg hover:bg-sky-800 disabled:opacity-50"
                >
                  <Save size={14} />
                  {saving ? "..." : "Guardar"}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Nome
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              ) : (
                <p className="text-sm text-gray-900">{profile.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Email
              </label>
              <p className="text-sm text-gray-900 flex items-center gap-2">
                <Mail size={14} className="text-gray-400" />
                {profile.email}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                O email não pode ser alterado
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Telemóvel
              </label>
              {editing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              ) : (
                <p className="text-sm text-gray-900 flex items-center gap-2">
                  <Phone size={14} className="text-gray-400" />
                  {profile.phone || "Não definido"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Professional Info (read-only) */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase size={20} className="text-sky-700" />
            Dados Profissionais
          </h2>
          <div className="space-y-4">
            {profile.specialization && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Especialização
                </label>
                <p className="text-sm text-gray-900">
                  {profile.specialization}
                </p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Taxa de Comissão
              </label>
              <p className="text-sm text-gray-900 flex items-center gap-2">
                <Percent size={14} className="text-amber-600" />
                {profile.commissionRate
                  ? `${profile.commissionRate}%`
                  : "Não definida"}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Definida pela administração
              </p>
            </div>
            {profile.nif && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  NIF
                </label>
                <p className="text-sm text-gray-900">{profile.nif}</p>
              </div>
            )}
            {profile.iban && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  IBAN
                </label>
                <p className="text-sm text-gray-900 font-mono">
                  {profile.iban}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Shield size={12} />
              Os dados profissionais e fiscais são geridos pela administração.
              Para alterações, contacte o Super Admin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
