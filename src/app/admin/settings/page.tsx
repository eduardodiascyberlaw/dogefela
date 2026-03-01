"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Bell,
  Shield,
  Database,
  Globe,
  Palette,
  MessageSquare,
  Wifi,
  WifiOff,
  QrCode,
  RefreshCw,
  Loader2,
} from "lucide-react";
import Image from "next/image";

interface WhatsAppStatus {
  state: string;
  instanceName: string;
  qrcode?: {
    base64?: string;
    code?: string;
    count?: number;
  };
  error?: string;
}

export default function SettingsPage() {
  const [waStatus, setWaStatus] = useState<WhatsAppStatus | null>(null);
  const [waLoading, setWaLoading] = useState(true);

  useEffect(() => {
    fetchWaStatus();
  }, []);

  async function fetchWaStatus() {
    setWaLoading(true);
    try {
      const res = await fetch("/api/whatsapp/status");
      if (res.ok) setWaStatus(await res.json());
    } catch {
      setWaStatus({ state: "error", instanceName: "dogfela" });
    } finally {
      setWaLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500 mt-1">
          Configurações gerais do sistema Dog Fella
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Globe size={20} className="text-sky-700" />
            Informações da Clínica
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Clínica
              </label>
              <input
                type="text"
                defaultValue="Dog Fella"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telemóvel / WhatsApp
              </label>
              <input
                type="text"
                defaultValue="+351 9XX XXX XXX"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instagram
              </label>
              <input
                type="text"
                defaultValue="@dogfella.pt"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                disabled
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare size={20} className="text-sky-700" />
            WhatsApp (Evolution API v2.2.3)
          </h2>
          <div className="space-y-4">
            {waLoading ? (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Loader2 size={16} className="animate-spin text-gray-400" />
                <span className="text-sm text-gray-500">A verificar conexão...</span>
              </div>
            ) : waStatus?.state === "open" ? (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-green-800">
                    WhatsApp Conectado
                  </p>
                  <p className="text-xs text-green-600">
                    Instância: {waStatus.instanceName}
                  </p>
                </div>
                <Wifi size={20} className="text-green-600" />
              </div>
            ) : waStatus?.state === "connecting" ? (
              <>
                <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      A aguardar conexão
                    </p>
                    <p className="text-xs text-amber-600">
                      Leia o QR Code com o WhatsApp
                    </p>
                  </div>
                  <QrCode size={20} className="text-amber-600" />
                </div>
                {waStatus.qrcode?.base64 && (
                  <div className="flex justify-center">
                    <Image
                      src={waStatus.qrcode.base64}
                      alt="QR Code"
                      width={180}
                      height={180}
                      className="rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-red-700">
                    Desconectado
                  </p>
                  <p className="text-xs text-red-500">
                    {waStatus?.error || "Não foi possível conectar"}
                  </p>
                </div>
                <WifiOff size={20} className="text-red-500" />
              </div>
            )}

            <button
              onClick={fetchWaStatus}
              className="flex items-center gap-2 px-3 py-2 text-sm text-sky-700 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors w-full justify-center"
            >
              <RefreshCw size={14} />
              Actualizar Estado
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield size={20} className="text-sky-700" />
            Segurança
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Sessão expira após</span>
              <span className="text-sm font-medium text-gray-900">
                24 horas
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Autenticação</span>
              <span className="text-sm font-medium text-gray-900">
                Credenciais (email + password)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Encriptação</span>
              <span className="text-sm font-medium text-gray-900">
                bcrypt (12 rounds)
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Database size={20} className="text-sky-700" />
            Sistema
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Versão</span>
              <span className="text-sm font-medium text-gray-900">1.0.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Framework</span>
              <span className="text-sm font-medium text-gray-900">
                Next.js 14
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Base de Dados</span>
              <span className="text-sm font-medium text-gray-900">
                PostgreSQL 17
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">ORM</span>
              <span className="text-sm font-medium text-gray-900">
                Prisma 5
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
