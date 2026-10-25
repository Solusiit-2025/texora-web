/**
 * Registry menu portal (Fungsi 3 - Aplikasi Transaksi Internal).
 *
 * File ini murni data (tanpa import React) agar aman dipakai oleh:
 * - Client component (sidebar portal, halaman admin Role & Menu)
 * - Server component / route handler
 * - Middleware (Edge Runtime)
 */

/**
 * Kunci peran pengguna. Bukan lagi union terbatas: role custom dapat dibuat
 * dari UI (Role & Menu Management) dan disimpan di SystemSetting.
 * Kunci bawaan sistem: ADMINISTRATOR, SALES_REP, WAREHOUSE_STAFF, CUSTOMER.
 */
export type PortalUserRole = string;

export type MenuIconName =
  | "layout-dashboard"
  | "messages-square"
  | "message-circle"
  | "mail"
  | "trending-up"
  | "users"
  | "bar-chart-3"
  | "clipboard-list"
  | "file-check"
  | "file-text"
  | "barcode"
  | "scissors"
  | "landmark"
  | "shopping-cart"
  | "sliders"
  | "layout-template"
  | "shield-alert"
  | "shield-check"
  | "settings"
  | "database-backup";

export interface PortalMenuItem {
  /** ID stabil, dipakai sebagai kunci penyimpanan hak akses. */
  id: string;
  name: string;
  href: string;
  icon: MenuIconName;
  /** Kode modul/business unit. */
  module: string;
  description: string;
}

export interface PortalMenuGroup {
  id: string;
  title: string;
  module: string;
  items: PortalMenuItem[];
}

export interface RoleDefinition {
  /** Kunci peran: string bebas untuk role custom (bukan lagi enum Prisma). */
  role: string;
  label: string;
  shortLabel: string;
  description: string;
  /** Role terkunci: seluruh menu aktif dan tidak dapat dicabut. */
  locked: boolean;
  tone: "rose" | "emerald" | "amber" | "sky" | "violet" | "cyan";
  /** true = peran bawaan sistem (tidak dapat dihapus). */
  system: boolean;
  /** Halaman tujuan setelah login. */
  defaultRoute: string;
  /** Hak akses menu awal ketika role dibuat / direset. */
  defaultMenuIds?: string[];
}

export const PORTAL_MENU_GROUPS: PortalMenuGroup[] = [
  {
    id: "executive",
    title: "Executive Overview",
    module: "Executive",
    items: [
      {
        id: "dashboard",
        name: "Dashboard Analitik",
        href: "/portal/dashboard",
        icon: "layout-dashboard",
        module: "Executive",
        description: "Ringkasan KPI penjualan, produksi, dan inventori real-time.",
      },
    ],
  },
  {
    id: "crm",
    title: "CRM & Penjualan",
    module: "CRM & Penjualan",
    items: [
      {
        id: "crm.social",
        name: "Social Listening & Prospek",
        href: "/portal/social-media",
        icon: "messages-square",
        module: "CRM & Penjualan",
        description: "Monitoring komentar Instagram/TikTok & konversi jadi prospek.",
      },
      {
        id: "crm.inbox",
        name: "WhatsApp",
        href: "/portal/crm/inbox",
        icon: "message-circle",
        module: "CRM & Penjualan",
        description: "Kotak masuk WhatsApp sales & percakapan pelanggan.",
      },
      {
        id: "crm.webmail",
        name: "Webmail Sales",
        href: "/portal/crm/webmail",
        icon: "mail",
        module: "CRM & Penjualan",
        description: "Email sales, template blast, dan riwayat balasan.",
      },
      {
        id: "crm.leads",
        name: "Pipeline Leads & Deals",
        href: "/portal/crm/leads",
        icon: "trending-up",
        module: "CRM & Penjualan",
        description: "Kanban pipeline prospek dari cold lead sampai closing.",
      },
      {
        id: "crm.quotes",
        name: "Permintaan Penawaran (RFQ)",
        href: "/portal/crm/quotes",
        icon: "file-text",
        module: "CRM & Penjualan",
        description: "Daftar permintaan penawaran harga dari form website.",
      },
      {
        id: "crm.customers",
        name: "Database Pelanggan 360°",
        href: "/portal/crm/customers",
        icon: "users",
        module: "CRM & Penjualan",
        description: "Profil pelanggan, riwayat transaksi, dan nilai lifetime.",
      },
      {
        id: "crm.sales-report",
        name: "Rekap Penjualan & Sales Order",
        href: "/portal/sales-report",
        icon: "bar-chart-3",
        module: "CRM & Penjualan",
        description: "Rekap omzet, reorder, dan performa sales representative.",
      },
    ],
  },
  {
    id: "oms",
    title: "OMS & Digital Proofing",
    module: "OMS & Digital Proofing",
    items: [
      {
        id: "oms.orders",
        name: "Antrean Pesanan & SPK",
        href: "/portal/oms/orders",
        icon: "clipboard-list",
        module: "OMS & Digital Proofing",
        description: "Antrean produksi, Surat Perintah Kerja, dan status order.",
      },
      {
        id: "oms.custom-orders",
        name: "Approval Digital Proof",
        href: "/portal/oms/custom-orders",
        icon: "file-check",
        module: "OMS & Digital Proofing",
        description: "Review proof digital sebelum naik mesin cetak sublimasi.",
      },
      {
        id: "oms.invoices",
        name: "Faktur & CoreTax PPN",
        href: "/portal/oms/invoices",
        icon: "file-text",
        module: "OMS & Digital Proofing",
        description: "Terbit faktur pajak, e-faktur, dan rekonsiliasi.",
      },
    ],
  },
  {
    id: "warehouse",
    title: "Gudang & Logistik",
    module: "Gudang & Logistik",
    items: [
      {
        id: "warehouse.inventory",
        name: "Stok Roll & Barcode",
        href: "/portal/warehouse/inventory",
        icon: "barcode",
        module: "Gudang & Logistik",
        description: "Mutasi stok roll kain, opname, dan barcode kain.",
      },
      {
        id: "warehouse.fulfillment",
        name: "Pemotongan & Ekspedisi",
        href: "/portal/warehouse/fulfillment",
        icon: "scissors",
        module: "Gudang & Logistik",
        description: "Antrian cutting, packing, dan serah terima ke ekspedisi.",
      },
    ],
  },
  {
    id: "finance",
    title: "Finance & Akuntansi",
    module: "Finance & Akuntansi",
    items: [
      {
        id: "finance",
        name: "Laporan Keuangan & Laba Rugi",
        href: "/portal/finance",
        icon: "landmark",
        module: "Finance & Akuntansi",
        description: "Laporan keuangan, laba rugi, dan pos buku.",
      },
    ],
  },
  {
    id: "purchasing",
    title: "Purchasing & Pengadaan",
    module: "Purchasing & Pengadaan",
    items: [
      {
        id: "purchasing",
        name: "Purchasing & Supplier",
        href: "/portal/purchasing",
        icon: "shopping-cart",
        module: "Purchasing & Pengadaan",
        description: "PO, supplier, dan harga beli kain sublimasi.",
      },
    ],
  },
  {
    id: "configuration",
    title: "Katalog & Pengaturan",
    module: "Katalog & Pengaturan",
    items: [
      {
        id: "catalog",
        name: "Katalog Kain & Pricing",
        href: "/portal/catalog-management",
        icon: "sliders",
        module: "Katalog & Pengaturan",
        description: "Produk kain, varian, dan tier harga pelanggan.",
      },
      {
        id: "content",
        name: "CMS Konten Website",
        href: "/portal/content-management",
        icon: "layout-template",
        module: "Katalog & Pengaturan",
        description: "Kelola hero slide, testimoni, FAQ, dan konten publik.",
      },
      {
        id: "audit",
        name: "Log Audit & 2FA Admin",
        href: "/portal/audit-logs",
        icon: "shield-alert",
        module: "Katalog & Pengaturan",
        description: "Jejak audit aktivitas sistem dan status 2FA.",
      },
      {
        id: "backup",
        name: "Backup & Restore Database",
        href: "/portal/backup",
        icon: "database-backup",
        module: "Katalog & Pengaturan",
        description: "Backup dan pemulihan database sistem.",
      },
      {
        id: "settings",
        name: "Konfigurasi Sistem & RBAC",
        href: "/portal/settings",
        icon: "settings",
        module: "Katalog & Pengaturan",
        description: "Integrasi, keamanan, dan pengaturan global platform.",
      },
      {
        id: "users-rbac",
        name: "Role & Menu Management",
        href: "/portal/settings/users-rbac",
        icon: "shield-check",
        module: "Katalog & Pengaturan",
        description: "Atur matriks hak akses menu portal untuk setiap peran.",
      },
    ],
  },
];

export const ALL_MENU_ITEMS: PortalMenuItem[] = PORTAL_MENU_GROUPS.flatMap(
  (group) => group.items
);

export const ALL_MENU_ITEM_IDS: string[] = ALL_MENU_ITEMS.map((item) => item.id);

/**
 * Default hak akses menu per role bawaan, diturunkan dari ROUTE_PERMISSIONS
 * (src/lib/auth/rbac.ts) agar konsisten dengan perilaku sistem saat ini.
 */
export const DEFAULT_ROLE_MENU: Record<string, string[]> = {
  ADMINISTRATOR: [...ALL_MENU_ITEM_IDS],
  SALES_REP: [
    "dashboard",
    "crm.social",
    "crm.inbox",
    "crm.webmail",
    "crm.leads",
    "crm.quotes",
    "crm.customers",
    "crm.sales-report",
    "oms.orders",
    "oms.custom-orders",
    "oms.invoices",
  ],
  WAREHOUSE_STAFF: [
    "dashboard",
    "oms.orders",
    "warehouse.inventory",
    "warehouse.fulfillment",
    "purchasing",
  ],
  CUSTOMER: [],
};

/**
 * Peran bawaan sistem (tidak dapat dihapus).
 * Peran custom lainnya ditambahkan dari /portal/settings/users-rbac.
 */
export const BASE_ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    role: "ADMINISTRATOR",
    label: "Administrator",
    shortLabel: "ADM",
    description:
      "Akses penuh seluruh modul portal, konfigurasi sistem, dan pengelolaan hak akses.",
    locked: true,
    tone: "rose",
    system: true,
    defaultRoute: "/portal/dashboard",
    defaultMenuIds: [...ALL_MENU_ITEM_IDS],
  },
  {
    role: "SALES_REP",
    label: "Sales Representative",
    shortLabel: "SLS",
    description:
      "Fokus CRM, pipeline leads, konversi sales order, dan monitoring social listening.",
    locked: false,
    tone: "emerald",
    system: true,
    defaultRoute: "/portal/crm/leads",
    defaultMenuIds: [...DEFAULT_ROLE_MENU.SALES_REP],
  },
  {
    role: "WAREHOUSE_STAFF",
    label: "Warehouse Staff",
    shortLabel: "GDG",
    description:
      "Fokus operasional gudang, stok roll, pemotongan, ekspedisi, dan purchasing.",
    locked: false,
    tone: "amber",
    system: true,
    defaultRoute: "/portal/warehouse/inventory",
    defaultMenuIds: [...DEFAULT_ROLE_MENU.WAREHOUSE_STAFF],
  },
  {
    role: "CUSTOMER",
    label: "Customer",
    shortLabel: "CUS",
    description:
      "Hanya akses portal pelanggan (/customer) - tidak memiliki menu portal internal.",
    locked: false,
    tone: "sky",
    system: true,
    defaultRoute: "/customer/dashboard",
    defaultMenuIds: [],
  },
];

/** Alias kompatibilitas: daftar peran bawaan sistem. */
export const ROLE_DEFINITIONS: RoleDefinition[] = BASE_ROLE_DEFINITIONS;

export function getRoleDefinition(role?: string | null): RoleDefinition | undefined {
  if (!role) return undefined;
  return ROLE_DEFINITIONS.find((r) => r.role === role);
}

/**
 * Cari item menu yang cocok dengan sebuah pathname.
 * Match jika pathname sama persis dengan href atau merupakan sub-path dari href.
 */
export function findMenuItemByPath(pathname: string): PortalMenuItem | undefined {
  const normalized = pathname.replace(/\/+$/, "") || "/";

  const matches = ALL_MENU_ITEMS.filter((item) => {
    const href = item.href.replace(/\/+$/, "");
    return normalized === href || normalized.startsWith(`${href}/`);
  });

  // Ambil yang paling spesifik (href terpanjang).
  return matches.sort(
    (a, b) => b.href.length - a.href.length
  )[0];
}

/**
 * Daftar item menu milik sebuah role berdasarkan peta hak akses.
 */
export function resolveMenuItems(menuIds: string[]): PortalMenuItem[] {
  const allowed = new Set(menuIds);
  return ALL_MENU_ITEMS.filter((item) => allowed.has(item.id));
}

/**
 * Rakit ulang peta hak akses agar hanya berisi id menu dan kunci role yang valid.
 * @param roles daftar role yang berlaku (bawaan + custom dari role-store)
 */
export function sanitizeMenuMap(
  input: Record<string, unknown> | null | undefined,
  roles: RoleDefinition[] = BASE_ROLE_DEFINITIONS
): Record<PortalUserRole, string[]> {
  const result: Record<PortalUserRole, string[]> = {};

  for (const def of roles) {
    if (def.locked) {
      result[def.role] = [...ALL_MENU_ITEM_IDS];
      continue;
    }

    const fallback = def.defaultMenuIds ?? DEFAULT_ROLE_MENU[def.role] ?? [];

    const raw = Array.isArray(input?.[def.role])
      ? (input?.[def.role] as unknown[])
      : fallback;

    const valid = raw.filter(
      (id): id is string =>
        typeof id === "string" && ALL_MENU_ITEM_IDS.includes(id)
    );

    result[def.role] = Array.from(new Set(valid));
  }

  return result;
}
