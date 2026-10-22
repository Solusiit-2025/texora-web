"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Sparkles, 
  Users, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  UserCheck, 
  Briefcase, 
  Package, 
  Building2 
} from "lucide-react";

interface RoleOption {
  role: "ADMINISTRATOR" | "SALES_REP" | "WAREHOUSE_STAFF" | "CUSTOMER";
  name: string;
  email: string;
  password: string;
  label: string;
  badge: string;
  badgeColor: string;
  icon: React.ElementType;
  description: string;
  allowedScope: string;
  targetUrl: string;
}

const ROLES: RoleOption[] = [
  {
    role: "ADMINISTRATOR",
    name: "Pricilia Kishin Hassanannd",
    email: "admin@texora.co.id",
    password: "Admin@XoraMateria2026!",
    label: "Super Admin / Direksi",
    badge: "Full Access",
    badgeColor: "bg-brand-500 text-slate-950",
    icon: ShieldCheck,
    description: "Akses penuh ke semua modul, pengaturan sistem, finance, audit log, dan persetujuan.",
    allowedScope: "Semua Rute /portal/* & /customer/*",
    targetUrl: "/portal/dashboard",
  },
  {
    role: "SALES_REP",
    name: "Rian Pratama",
    email: "rian.sales@texora.co.id",
    password: "Sales@XoraMateria2026!",
    label: "Sales Executive",
    badge: "Sales & CRM",
    badgeColor: "bg-cyan-500 text-slate-950",
    icon: Briefcase,
    description: "Mengelola omnichannel WhatsApp/email, pipeline leads, deal, dan inkuiri mitra.",
    allowedScope: "Katalog, CRM, Orders (Settings & Finance dibatasi)",
    targetUrl: "/portal/crm/leads",
  },
  {
    role: "WAREHOUSE_STAFF",
    name: "Bambang Santoso",
    email: "bambang.wh@texora.co.id",
    password: "Gudang@XoraMateria2026!",
    label: "Warehouse Staff",
    badge: "Gudang & Roll",
    badgeColor: "bg-amber-500 text-slate-950",
    icon: Package,
    description: "Scan barcode kain roll, inventory cutting, pemenuhan pengiriman ekspedisi.",
    allowedScope: "Inventory, Barcode, Fulfillment (Settings & Finance dibatasi)",
    targetUrl: "/portal/warehouse/inventory",
  },
  {
    role: "CUSTOMER",
    name: "Hendra Wijaya",
    email: "hendra@garmentkreatif.com",
    password: "Customer@XoraMateria2026!",
    label: "Customer B2B Partner",
    badge: "Mitra Garmen",
    badgeColor: "bg-emerald-500 text-slate-950",
    icon: Building2,
    description: "Portal mandiri mitra untuk katalog harga khusus, approval proof, dan tracking order.",
    allowedScope: "Customer Dashboard (/customer/*). Dilarang akses /portal/*",
    targetUrl: "/customer/dashboard",
  },
];

export default function RbacDemoSwitcher() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [currentRole, setCurrentRole] = useState<string>("ADMINISTRATOR");
  const [currentUserEmail, setCurrentUserEmail] = useState<string>("");
  const [switchingRole, setSwitchingRole] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentRole(data.user.role);
          setCurrentUserEmail(data.user.email);
        }
      })
      .catch(() => {});
  }, []);

  const handleSwitch = async (target: RoleOption) => {
    if (target.email === currentUserEmail) return;

    setSwitchingRole(target.role);
    setNotification(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: target.email,
          password: target.password,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setNotification(`Berhasil beralih role ke ${target.label}! Mengalihkan...`);
        setTimeout(() => {
          window.location.href = target.targetUrl;
        }, 500);
      } else {
        setNotification(`Gagal beralih role: ${data.error || "Kesalahan jaringan"}`);
        setSwitchingRole(null);
      }
    } catch {
      setNotification("Gagal menghubungi server autentikasi.");
      setSwitchingRole(null);
    }
  };

  return (
    <div className="rounded-2xl border border-brand-500/30 bg-slate-950/80 p-4 sm:p-5 shadow-xl transition-all">
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">RBAC Role Testing &amp; Switcher</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-brand-500/20 text-brand-300 border border-brand-500/40">
                INTERNAL TESTING SUITE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Role aktif saat ini:{" "}
              <span className="font-bold text-white font-mono">{currentRole}</span>
              {currentUserEmail && <span className="text-slate-500 font-mono"> ({currentUserEmail})</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <span>{isOpen ? "Sembunyikan Panel" : "Buka Panel Role"}</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Switcher Card Grid */}
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3">
          {notification && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{notification}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {ROLES.map((roleOpt) => {
              const Icon = roleOpt.icon;
              const isActive = currentRole === roleOpt.role;
              const isSwitching = switchingRole === roleOpt.role;

              return (
                <div
                  key={roleOpt.role}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                    isActive
                      ? "bg-brand-500/10 border-brand-500/50 ring-1 ring-brand-500/30"
                      : "bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-brand-400" />
                        <span className="text-xs font-bold text-white">{roleOpt.label}</span>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${roleOpt.badgeColor}`}>
                        {roleOpt.badge}
                      </span>
                    </div>

                    <div className="text-[11px] font-semibold text-slate-300 truncate">
                      {roleOpt.name}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 mb-2 truncate">
                      {roleOpt.email}
                    </div>

                    <p className="text-[10px] text-slate-400 leading-snug line-clamp-2 mb-2">
                      {roleOpt.description}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-slate-800/60 mt-auto">
                    <div className="text-[10px] text-slate-500 mb-2 truncate">
                      <span className="text-slate-400 font-medium">Akses:</span> {roleOpt.allowedScope}
                    </div>

                    <button
                      type="button"
                      disabled={isActive || Boolean(switchingRole)}
                      onClick={() => handleSwitch(roleOpt)}
                      className={`w-full py-1.5 px-2.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                        isActive
                          ? "bg-brand-500/20 text-brand-400 border border-brand-500/30 cursor-default"
                          : "bg-slate-800 hover:bg-brand-600 hover:text-white text-slate-200 border border-slate-700"
                      }`}
                    >
                      {isSwitching ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Beralih...</span>
                        </>
                      ) : isActive ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
                          <span>Role Aktif</span>
                        </>
                      ) : (
                        <>
                          <span>Ganti ke Role Ini</span>
                          <ArrowRight className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
