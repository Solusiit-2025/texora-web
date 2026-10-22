"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronRight,
  KeyRound,
  Loader2,
  Lock,
  Palette,
  Plus,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import { getMenuIcon } from "@/components/portal/menu-icons";
import {
  ALL_MENU_ITEM_IDS,
  ALL_MENU_ITEMS,
  PortalMenuGroup,
  PortalUserRole,
  ROLE_DEFINITIONS,
  RoleDefinition,
} from "@/config/portal-menu";

type MenuMap = Record<string, string[]>;

interface PortalUser {
  id: string;
  name: string;
  email: string;
  role: string;
  companyName: string | null;
  createdAt: string;
}

const TONE_OPTIONS: { value: RoleDefinition["tone"]; label: string }[] = [
  { value: "rose", label: "Rose" },
  { value: "emerald", label: "Emerald" },
  { value: "amber", label: "Amber" },
  { value: "sky", label: "Sky" },
  { value: "violet", label: "Violet" },
  { value: "cyan", label: "Cyan" },
];

const TONE_STYLES: Record<RoleDefinition["tone"], string> = {
  rose: "bg-rose-500/10 border-rose-500/30 text-rose-300",
  emerald: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
  amber: "bg-amber-500/10 border-amber-500/30 text-amber-300",
  sky: "bg-sky-500/10 border-sky-500/30 text-sky-300",
  violet: "bg-violet-500/10 border-violet-500/30 text-violet-300",
  cyan: "bg-cyan-500/10 border-cyan-500/30 text-cyan-300",
};

export default function RoleMenuManagementPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [groups, setGroups] = useState<PortalMenuGroup[]>([]);
  const [map, setMap] = useState<MenuMap>({});
  const [defaults, setDefaults] = useState<MenuMap>({});
  const [selectedRole, setSelectedRole] = useState<PortalUserRole>("SALES_REP");
  const [roles, setRoles] = useState<RoleDefinition[]>(ROLE_DEFINITIONS);
  const [users, setUsers] = useState<PortalUser[]>([]);
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [usersForbidden, setUsersForbidden] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [userMessage, setUserMessage] = useState<{ ok: boolean; text: string } | null>(null);

  // Form tambah/edit user
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [savingUser, setSavingUser] = useState(false);
  const [userFormError, setUserFormError] = useState<string | null>(null);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "CUSTOMER",
    companyName: "",
    phoneNumber: "",
  });

  // Form tambah role custom
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [formLabel, setFormLabel] = useState("");
  const [formShort, setFormShort] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formTone, setFormTone] = useState<RoleDefinition["tone"]>("violet");
  const [formRoute, setFormRoute] = useState("/portal/dashboard");
  const [formPreset, setFormPreset] = useState("empty");
  const [formCopyFrom, setFormCopyFrom] = useState("SALES_REP");

  const loadConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/rbac/menu");
      const json = await res.json();

      if (json?.success) {
        setGroups(json.data.groups ?? []);
        setMap(json.data.map ?? {});
        setDefaults(json.data.defaults ?? {});
        if (Array.isArray(json.data.roles) && json.data.roles.length > 0) {
          setRoles(json.data.roles);
        }
      } else {
        setMessage({ ok: false, text: json?.error || "Gagal memuat konfigurasi." });
      }
    } catch {
      setMessage({ ok: false, text: "Gagal menghubungi server." });
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const res = await fetch(`/api/rbac/users?page=${userPage}&limit=10`);
      const json = await res.json();
      if (res.status === 403) {
        setUsersForbidden(true);
        return;
      }
      if (json?.success) {
        setUsers(json.data.users ?? []);
        if (json.data.pagination) {
          setUserTotalPages(json.data.pagination.totalPages || 1);
        }
      }
    } catch {
      // best-effort
    } finally {
      setLoadingUsers(false);
    }
  }, [userPage]);

  useEffect(() => {
    loadConfig();
    loadUsers();
  }, [loadConfig, loadUsers]);

  const activeRole = roles.find((r) => r.role === selectedRole);

  // Pastikan role terpilih selalu valid setelah role dihapus/ditambahkan
  useEffect(() => {
    if (roles.length > 0 && !roles.some((r) => r.role === selectedRole)) {
      setSelectedRole(roles[0].role);
    }
  }, [roles, selectedRole]);

  const isDirty = useMemo(() => {
    for (const def of roles) {
      if (def.locked) continue;
      const current = [...(map[def.role] ?? [])].sort().join(",");
      const original = [...(defaults[def.role] ?? [])].sort().join(",");
      if (current !== original) return true;
    }
    return false;
  }, [map, defaults, roles]);

  const toggleItem = (role: PortalUserRole, itemId: string) => {
    if (activeRole?.locked) return;
    setMap((prev) => {
      const current = prev[role] ?? [];
      const next = current.includes(itemId)
        ? current.filter((id) => id !== itemId)
        : [...current, itemId];
      return { ...prev, [role]: next };
    });
  };

  const toggleGroup = (role: PortalUserRole, group: PortalMenuGroup) => {
    if (activeRole?.locked) return;
    const groupIds = group.items.map((i) => i.id);
    setMap((prev) => {
      const current = prev[role] ?? [];
      const allOn = groupIds.every((id) => current.includes(id));
      const next = allOn
        ? current.filter((id) => !groupIds.includes(id))
        : Array.from(new Set([...current, ...groupIds]));
      return { ...prev, [role]: next };
    });
  };

  /**
   * Preset modul per role.
   *
   * "Web Publish + CMS" = website publik (katalog, artikel, RFQ) + CMS,
   * tanpa modul produksi/keuangan/warehouse/social yang tidak dipakai.
   *
   * CATATAN: menu yang dimatikan di sini juga MENUTUP akses route-nya
   * (lihat isMenuDenied di src/lib/auth/rbac.ts), jadi modul benar-benar
   * tidak bisa dibuka - bukan cuma disembunyikan dari sidebar.
   */
  const MENU_PRESETS: Array<{
    key: string;
    label: string;
    desc: string;
    keep: string[];
  }> = [
    {
      key: "publish-cms",
      label: "Web Publish + CMS",
      desc: "Dashboard, katalog, CMS, audit, RBAC + RFQ & pipeline lead",
      keep: [
        "dashboard",
        "catalog",
        "content",
        "audit",
        "settings",
        "users-rbac",
        "crm.leads",
        "crm.quotes",
      ],
    },
    {
      key: "publish-cms-sales",
      label: "Publish + CMS + Sales",
      desc: "Tambah database pelanggan & rekap penjualan",
      keep: [
        "dashboard",
        "catalog",
        "content",
        "audit",
        "settings",
        "users-rbac",
        "crm.leads",
        "crm.quotes",
        "crm.customers",
        "crm.sales-report",
      ],
    },
    {
      key: "full",
      label: "Semua Modul",
      desc: "Aktifkan kembali seluruh modul portal",
      keep: ALL_MENU_ITEM_IDS,
    },
  ];

  const applyPreset = (presetKey: string) => {
    if (activeRole?.locked) return;
    const preset = MENU_PRESETS.find((p) => p.key === presetKey);
    if (!preset) return;

    setMap((prev) => ({
      ...prev,
      [selectedRole]: preset.keep.filter((id) =>
        ALL_MENU_ITEM_IDS.includes(id)
      ),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/rbac/menu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ map }),
      });
      const json = await res.json();

      if (json?.success) {
        setMap(json.data.map ?? {});
        setMessage({
          ok: true,
          text: "Hak akses menu tersimpan. Berlaku untuk sesi baru (maks 15 menit) dan langsung untuk halaman yang sedang dimuat.",
        });
        await loadConfig();
      } else {
        setMessage({ ok: false, text: json?.error || "Gagal menyimpan." });
      }
    } catch {
      setMessage({ ok: false, text: "Gagal menghubungi server." });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setMap(defaults);
    setMessage({ ok: true, text: "Konfigurasi dikembalikan ke default. Klik Simpan untuk menerapkan." });
  };

  const handleChangeRole = async (userId: string, role: string) => {
    setUserMessage(null);
    try {
      const res = await fetch("/api/rbac/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      const json = await res.json();

      if (json?.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: json.data.user.role } : u))
        );
        setUserMessage({ ok: true, text: json.message });
      } else {
        setUserMessage({ ok: false, text: json?.error || "Gagal mengubah peran." });
      }
    } catch {
      setUserMessage({ ok: false, text: "Gagal menghubungi server." });
    }
  };

  const resetUserForm = () => {
    setUserForm({ name: "", email: "", password: "", role: "CUSTOMER", companyName: "", phoneNumber: "" });
    setEditingUserId(null);
    setUserFormError(null);
    setShowUserForm(false);
  };

  const openCreateUser = () => {
    resetUserForm();
    setShowUserForm(true);
  };

  const openEditUser = (u: PortalUser) => {
    setUserForm({
      name: u.name,
      email: u.email,
      password: "",
      role: u.role,
      companyName: u.companyName || "",
      phoneNumber: "",
    });
    setEditingUserId(u.id);
    setUserFormError(null);
    setShowUserForm(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormError(null);
    setSavingUser(true);
    try {
      const payload: any = {
        name: userForm.name.trim(),
        email: userForm.email.trim(),
        role: userForm.role,
        companyName: userForm.companyName.trim() || null,
        phoneNumber: userForm.phoneNumber.trim() || null,
      };
      if (userForm.password) payload.password = userForm.password;
      if (editingUserId) payload.userId = editingUserId;

      const res = await fetch("/api/rbac/users", {
        method: editingUserId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json?.success) {
        setUserMessage({ ok: true, text: json.message });
        resetUserForm();
        await loadUsers();
      } else {
        setUserFormError(json?.error || "Gagal menyimpan pengguna.");
      }
    } catch {
      setUserFormError("Gagal menghubungi server.");
    } finally {
      setSavingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string, label: string) => {
    if (!window.confirm(`Hapus pengguna "${label}"?`)) return;
    setUserMessage(null);
    try {
      const res = await fetch("/api/rbac/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const json = await res.json();
      if (json?.success) {
        setUserMessage({ ok: true, text: json.message });
        await loadUsers();
      } else {
        setUserMessage({ ok: false, text: json?.error || "Gagal menghapus pengguna." });
      }
    } catch {
      setUserMessage({ ok: false, text: "Gagal menghubungi server." });
    }
  };

  const resetCreateForm = () => {
    setFormLabel("");
    setFormShort("");
    setFormDesc("");
    setFormTone("violet");
    setFormRoute("/portal/dashboard");
    setFormPreset("empty");
    setFormCopyFrom("SALES_REP");
    setCreateError(null);
    setShowCreateForm(false);
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    const label = formLabel.trim();
    if (label.length < 3) {
      setCreateError("Nama role minimal 3 karakter.");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/rbac/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label,
          shortLabel: formShort.trim(),
          description: formDesc.trim(),
          tone: formTone,
          defaultRoute: formRoute,
          preset: formPreset,
          copyFrom: formCopyFrom,
        }),
      });
      const json = await res.json();

      if (json?.success) {
        setRoles(json.data.roles ?? []);
        setSelectedRole(json.data.role?.role ?? selectedRole);
        resetCreateForm();
        setMessage({ ok: true, text: json.message });
        await loadConfig();
      } else {
        setCreateError(json?.error || "Gagal membuat role baru.");
      }
    } catch {
      setCreateError("Gagal menghubungi server.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteRole = async (roleKey: string, label: string) => {
    if (
      !window.confirm(
        `Hapus role "${label}"?\n\nPengguna dengan role ini akan kembali ke peran dasarnya, dan hak akses menu role ini ikut terhapus.`
      )
    ) {
      return;
    }

    setMessage(null);
    try {
      const res = await fetch("/api/rbac/roles", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: roleKey }),
      });
      const json = await res.json();

      if (json?.success) {
        setRoles(json.data.roles ?? []);
        setSelectedRole("SALES_REP");
        setMessage({ ok: true, text: json.message });
        await loadConfig();
        await loadUsers();
      } else {
        setMessage({ ok: false, text: json?.error || "Gagal menghapus role." });
      }
    } catch {
      setMessage({ ok: false, text: "Gagal menghubungi server." });
    }
  };

  const menuCount = (role: PortalUserRole) => map[role]?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold mb-2">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Role &amp; Menu Management (RBAC)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
            Pengaturan Peran &amp; Menu Portal
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Tentukan menu portal mana saja yang terlihat dan dapat diakses untuk setiap peran.
            Menu yang dicabut tidak hanya disembunyikan dari sidebar, tetapi juga memblokir akses
            URL secara langsung.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            disabled={!isDirty || saving}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold flex items-center gap-2 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || saving}
            className="px-4 py-2 rounded-xl bg-brand-500 text-slate-950 text-xs font-bold flex items-center gap-2 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{saving ? "Menyimpan..." : "Simpan Hak Akses"}</span>
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`px-4 py-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            message.ok
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          {message.ok ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Modal Tambah/Edit User */}
      {showUserForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">
              {editingUserId ? "Edit Pengguna" : "Tambah Pengguna"}
            </h3>
            {userFormError && (
              <div className="px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-300">
                {userFormError}
              </div>
            )}
            <form onSubmit={handleSaveUser} className="space-y-3">
              <input
                type="text"
                placeholder="Nama"
                value={userForm.name}
                onChange={(e) => setUserForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={userForm.email}
                onChange={(e) => setUserForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
                required
              />
              <input
                type="password"
                placeholder={editingUserId ? "Password baru (opsional)" : "Password (min 8)"}
                value={userForm.password}
                onChange={(e) => setUserForm((f) => ({ ...f, password: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
              />
              <input
                type="text"
                placeholder="Perusahaan (opsional)"
                value={userForm.companyName}
                onChange={(e) => setUserForm((f) => ({ ...f, companyName: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
              />
              <input
                type="text"
                placeholder="No. WhatsApp (opsional)"
                value={userForm.phoneNumber}
                onChange={(e) => setUserForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
              />
              <select
                value={userForm.role}
                onChange={(e) => setUserForm((f) => ({ ...f, role: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"
              >
                {roles.map((def) => (
                  <option key={def.role} value={def.role}>
                    {def.label}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={savingUser}
                  className="flex-1 py-2 rounded-lg bg-brand-500 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 hover:brightness-110 disabled:opacity-40"
                >
                  {savingUser ? "Menyimpan..." : "Simpan"}
                </button>
                <button
                  type="button"
                  onClick={resetUserForm}
                  disabled={savingUser}
                  className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 text-xs font-bold hover:text-white transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-16 flex items-center justify-center gap-2 text-slate-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Memuat konfigurasi Role &amp; Menu...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Daftar Role */}
          <div className="lg:col-span-4 space-y-3">
            <div className="glass-panel rounded-3xl border border-slate-800 p-5">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-4 h-4 text-brand-400" />
                <h2 className="text-sm font-display font-bold text-white">Daftar Peran</h2>
              </div>

              <div className="space-y-2">
                {roles.map((def) => {
                  const isActive = def.role === selectedRole;
                  return (
                    <div
                      key={def.role}
                      className={`relative rounded-xl border transition-all ${
                        isActive
                          ? "bg-brand-500/10 border-brand-500/50 ring-1 ring-brand-500/30"
                          : "bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedRole(def.role)}
                        className="w-full text-left p-3.5"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5 pr-6">
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`px-2 py-0.5 rounded-full border text-[10px] font-black tracking-wide ${
                                TONE_STYLES[def.tone] || TONE_STYLES.violet
                              }`}
                            >
                              {def.shortLabel}
                            </span>
                            <span className="text-xs font-bold text-white truncate">
                              {def.label}
                            </span>
                            {!def.system && (
                              <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[9px] font-bold text-slate-400 tracking-wide shrink-0">
                                CUSTOM
                              </span>
                            )}
                          </div>
                          {def.locked ? (
                            <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          ) : (
                            <ChevronRight
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isActive ? "text-brand-400" : "text-slate-600"
                              }`}
                            />
                          )}
                        </div>
                        <p className="text-[10px] leading-snug text-slate-400 mb-2">
                          {def.description}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] font-mono">
                          <span className="text-brand-400">
                            {menuCount(def.role)}/{ALL_MENU_ITEM_IDS.length} menu aktif
                          </span>
                          {def.locked && (
                            <span className="text-slate-500">• terkunci (full access)</span>
                          )}
                        </div>
                      </button>

                      {!def.system && (
                        <button
                          type="button"
                          title={`Hapus role ${def.label}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRole(def.role, def.label);
                          }}
                          className="absolute top-2.5 right-2.5 p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Tambah Role */}
              {!showCreateForm ? (
                <button
                  type="button"
                  onClick={() => setShowCreateForm(true)}
                  className="mt-3 w-full py-2.5 rounded-xl border border-dashed border-slate-700 bg-slate-950/40 text-slate-300 text-xs font-bold flex items-center justify-center gap-2 hover:border-brand-500/60 hover:text-brand-300 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Role Baru</span>
                </button>
              ) : (
                <form
                  onSubmit={handleCreateRole}
                  className="mt-3 p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Role Baru</span>
                    <span className="text-[10px] text-slate-500">
                      Tersimpan di SystemSetting (tanpa migrasi DB)
                    </span>
                  </div>

                  {createError && (
                    <div className="px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-300">
                      {createError}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Nama Role *
                    </label>
                    <input
                      type="text"
                      value={formLabel}
                      onChange={(e) => setFormLabel(e.target.value)}
                      maxLength={60}
                      placeholder="mis. Purchasing Staff"
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-600 focus:border-brand-500 outline-none"
                    />
                    <p className="text-[10px] text-slate-600 font-mono">
                      Kunci otomatis:{" "}
                      {(formLabel || "role")
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "_")
                        .replace(/^_+|_+$/g, "")
                        .toUpperCase() || "ROLE"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Singkatan
                      </label>
                      <input
                        type="text"
                        value={formShort}
                        onChange={(e) => setFormShort(e.target.value.slice(0, 4))}
                        maxLength={4}
                        placeholder="PCH"
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-600 focus:border-brand-500 outline-none font-mono uppercase"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                        <Palette className="w-3 h-3" /> Warna
                      </label>
                      <select
                        value={formTone}
                        onChange={(e) => setFormTone(e.target.value as RoleDefinition["tone"])}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:border-brand-500 outline-none"
                      >
                        {TONE_OPTIONS.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Deskripsi
                    </label>
                    <textarea
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      rows={2}
                      maxLength={200}
                      placeholder="Tanggung jawab role ini..."
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-600 focus:border-brand-500 outline-none resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Halaman Awal
                      </label>
                      <select
                        value={formRoute}
                        onChange={(e) => setFormRoute(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:border-brand-500 outline-none"
                      >
                        <option value="/portal/dashboard">Dashboard Analitik</option>
                        {ALL_MENU_ITEMS.filter(
                          (i) => i.href !== "/portal/dashboard"
                        ).map((i) => (
                          <option key={i.href} value={i.href}>
                            {i.name}
                          </option>
                        ))}
                        <option value="/customer/dashboard">Portal Pelanggan</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Mulai Dari
                      </label>
                      <select
                        value={formPreset}
                        onChange={(e) => setFormPreset(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:border-brand-500 outline-none"
                      >
                        <option value="empty">Tanpa menu (pilih manual)</option>
                        <option value="dashboard">Dashboard saja</option>
                        <option value="copy">Salin dari role lain</option>
                        <option value="all">Semua menu (full access)</option>
                      </select>
                    </div>
                  </div>

                  {formPreset === "copy" && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Salin Hak Akses Dari
                      </label>
                      <select
                        value={formCopyFrom}
                        onChange={(e) => setFormCopyFrom(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:border-brand-500 outline-none"
                      >
                        {roles.map((r) => (
                          <option key={r.role} value={r.role}>
                            {r.label} ({r.role})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={creating || formLabel.trim().length < 3}
                      className="flex-1 py-2 rounded-lg bg-brand-500 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      {creating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                      <span>{creating ? "Membuat..." : "Buat Role"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={resetCreateForm}
                      disabled={creating}
                      className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 text-xs font-bold hover:text-white transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="glass-panel rounded-3xl border border-slate-800 p-5">
              <h3 className="text-xs font-bold text-white mb-2">Aturan Penyimpanan</h3>
              <ul className="space-y-2 text-[11px] text-slate-400 leading-snug">
                <li className="flex gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    Menu yang dicabut akan disembunyikan dari sidebar dan memblokir akses
                    URL langsung.
                  </span>
                </li>
                <li className="flex gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    Klaim akses pada sesi pengguna disegarkan otomatis setiap kali portal
                    dimuat (maks. 15 menit untuk token aktif).
                  </span>
                </li>
                <li className="flex gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    Peran Administrator tidak dapat dikurangi agar platform tetap dapat
                    dikelola.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Matriks Menu */}
          <div className="lg:col-span-8 space-y-4">
            <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
              <div className="p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-display font-bold text-white">
                    Matriks Menu &times; Peran
                  </h3>
                  <p className="text-xs text-slate-400">
                    {activeRole ? (
                      <>
                        Menampilkan hak akses untuk{" "}
                        <span className="text-brand-400 font-bold">{activeRole.label}</span> (
                        {activeRole.role})
                      </>
                    ) : (
                      "Pilih satu peran untuk melihat daftar menu."
                    )}
                  </p>
                </div>
                <div className="text-[10px] font-mono px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400">
                  {menuCount(selectedRole)}/{ALL_MENU_ITEM_IDS.length} aktif
                </div>
              </div>

              {/* PRESET MODUL: 1 klik untuk mode "Web Publish + CMS" */}
              {activeRole && !activeRole.locked && (
                <div className="mb-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-white">
                        Preset modul cepat
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                        Menu yang dimatikan juga <strong>menutup akses route</strong>{" "}
                        modul tsb (bukan cuma disembunyikan dari sidebar). Klik
                        preset, lalu tekan &quot;Simpan&quot;.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {MENU_PRESETS.map((p) => {
                      const active = (map[selectedRole] ?? []).length === p.keep.length;
                      return (
                        <button
                          key={p.key}
                          type="button"
                          onClick={() => applyPreset(p.key)}
                          title={p.desc}
                          className={`px-3 py-2 rounded-xl text-[11px] font-bold border transition-all ${
                            active
                              ? "bg-brand-500/20 border-brand-500/50 text-brand-200"
                              : "bg-slate-950 border-slate-700 text-slate-300 hover:border-brand-500/40 hover:text-white"
                          }`}
                        >
                          {p.label}
                          <span className="block font-normal text-[9px] text-slate-500 mt-0.5">
                            {p.keep.length} menu
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="divide-y divide-slate-800/80">
                {groups.map((group) => {
                  const current = map[selectedRole] ?? [];
                  const groupIds = group.items.map((i) => i.id);
                  const enabledCount = groupIds.filter((id) => current.includes(id)).length;
                  const allEnabled = enabledCount === groupIds.length;

                  return (
                    <div key={group.id} className="p-5">
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <div>
                          <div className="text-xs font-bold text-white">{group.title}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {group.module} • {enabledCount}/{groupIds.length} aktif
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleGroup(selectedRole, group)}
                          disabled={activeRole?.locked}
                          className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          {allEnabled ? "Nonaktifkan Semua" : "Aktifkan Semua"}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {group.items.map((item) => {
                          const Icon = getMenuIcon(item.icon);
                          const checked = (map[selectedRole] ?? []).includes(item.id);

                          return (
                            <label
                              key={item.id}
                              className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                                checked
                                  ? "bg-brand-500/10 border-brand-500/40"
                                  : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                              } ${activeRole?.locked ? "cursor-not-allowed opacity-80" : ""}`}
                            >
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={checked}
                                disabled={activeRole?.locked}
                                onChange={() => toggleItem(selectedRole, item.id)}
                              />
                              <span
                                className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                                  checked
                                    ? "bg-brand-500 border-brand-500 text-slate-950"
                                    : "bg-slate-900 border-slate-700"
                                }`}
                              >
                                {checked && <Check className="w-3 h-3" strokeWidth={3} />}
                              </span>
                              <span className="min-w-0">
                                <span className="flex items-center gap-1.5">
                                  <Icon
                                    className={`w-3.5 h-3.5 shrink-0 ${
                                      checked ? "text-brand-400" : "text-slate-500"
                                    }`}
                                  />
                                  <span className="text-[11px] font-bold text-white truncate">
                                    {item.name}
                                  </span>
                                </span>
                                <span className="block text-[10px] text-slate-500 font-mono truncate">
                                  {item.href}
                                </span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Managedan Pengguna */}
            <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
              <div className="p-5 border-b border-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-400" />
                <div>
                  <h3 className="text-base font-display font-bold text-white">
                    Pengguna &amp; Penugasan Peran
                  </h3>
                  <p className="text-xs text-slate-400">
                    Tambah, edit, hapus pengguna, dan ubah peran.
                  </p>
                </div>
              </div>

              {usersForbidden ? (
                <div className="p-5 flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/25 rounded-xl">
                  <Lock className="w-4 h-4 shrink-0" />
                  <span>
                    Daftar pengguna hanya dapat dilihat oleh Administrator.
                  </span>
                </div>
              ) : (
                <>
                  {userMessage && (
                    <div
                      className={`mx-5 mt-4 px-3.5 py-2.5 rounded-xl border text-[11px] font-semibold flex items-center gap-2 ${
                        userMessage.ok
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                          : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                      }`}
                    >
                      <span>{userMessage.text}</span>
                    </div>
                  )}

                  <div className="px-5 py-3 flex justify-end">
                    <button
                      type="button"
                      onClick={openCreateUser}
                      className="px-3 py-1.5 rounded-xl bg-brand-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:brightness-110 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Tambah User
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900/80 text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-5 font-bold">Nama &amp; Email</th>
                          <th className="py-3 px-5 font-bold">Peran Saat Ini</th>
                          <th className="py-3 px-5 font-bold">Ubah Peran</th>
                            <th className="py-3 px-5 font-bold">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {loadingUsers ? (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-slate-500 text-xs">
                              <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" />
                              Memuat pengguna...
                            </td>
                          </tr>
                        ) : users.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-slate-500 text-xs">
                              Belum ada pengguna di database.
                            </td>
                          </tr>
                        ) : (
                          users.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-900/40">
                              <td className="py-3.5 px-5">
                                <div className="font-bold text-white">{u.name}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{u.email}</div>
                              </td>
                              <td className="py-3.5 px-5">
                                <span className="px-2 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-[10px] font-bold">
                                  {u.role}
                                </span>
                              </td>
                              <td className="py-3.5 px-5">
                                <select
                                  value={u.role}
                                  onChange={(e) => handleChangeRole(u.id, e.target.value)}
                                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-slate-200 focus:border-brand-500 outline-none"
                                >
                                  {roles.map((def) => (
                                    <option key={def.role} value={def.role}>
                                      {def.label} {def.system ? "" : "(custom)"}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-3.5 px-5">
                                <div className="flex items-center gap-2">
                                  <button type="button" onClick={() => openEditUser(u)} className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-[10px] font-bold hover:text-white transition-colors">Edit</button>
                                  <button type="button" onClick={() => handleDeleteUser(u.id, u.name)} className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[10px] font-bold hover:bg-rose-500/20 transition-colors">Hapus</button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  {!usersForbidden && (
                    <div className="px-5 py-3 flex items-center justify-between border-t border-slate-800">
                      <button type="button" disabled={userPage <= 1} onClick={() => setUserPage((p) => Math.max(1, p - 1))} className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 disabled:opacity-40">Sebelumnya</button>
                      <span className="text-xs text-slate-400">Halaman {userPage} / {userTotalPages}</span>
                      <button type="button" disabled={userPage >= userTotalPages} onClick={() => setUserPage((p) => Math.min(userTotalPages, p + 1))} className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 disabled:opacity-40">Berikutnya</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
