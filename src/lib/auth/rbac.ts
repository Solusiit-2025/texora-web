import { findMenuItemByPath } from "@/config/portal-menu";

export type UserRole = "ADMINISTRATOR" | "SALES_REP" | "WAREHOUSE_STAFF" | "CUSTOMER";

export interface RouteRule {
  pathPrefix: string;
  allowedRoles: UserRole[];
}

export const ROUTE_PERMISSIONS: RouteRule[] = [
  // Super Admin Only
  { pathPrefix: "/portal/settings", allowedRoles: ["ADMINISTRATOR"] },
  { pathPrefix: "/portal/audit-logs", allowedRoles: ["ADMINISTRATOR"] },
  { pathPrefix: "/portal/catalog-management", allowedRoles: ["ADMINISTRATOR"] },
  { pathPrefix: "/portal/content-management", allowedRoles: ["ADMINISTRATOR"] },
  { pathPrefix: "/portal/backup", allowedRoles: ["ADMINISTRATOR"] },
  { pathPrefix: "/portal/finance", allowedRoles: ["ADMINISTRATOR"] },

  // Purchasing & Procurement
  { pathPrefix: "/portal/purchasing", allowedRoles: ["ADMINISTRATOR", "WAREHOUSE_STAFF"] },

  // Warehouse & Inventory
  { pathPrefix: "/portal/warehouse", allowedRoles: ["ADMINISTRATOR", "WAREHOUSE_STAFF"] },

  // CRM & Sales
  { pathPrefix: "/portal/crm", allowedRoles: ["ADMINISTRATOR", "SALES_REP"] },
  { pathPrefix: "/portal/sales-report", allowedRoles: ["ADMINISTRATOR", "SALES_REP"] },
  { pathPrefix: "/portal/social-media", allowedRoles: ["ADMINISTRATOR", "SALES_REP"] },

  // OMS & Operations
  { pathPrefix: "/portal/oms", allowedRoles: ["ADMINISTRATOR", "SALES_REP", "WAREHOUSE_STAFF"] },

  // General Portal Dashboard
  { pathPrefix: "/portal", allowedRoles: ["ADMINISTRATOR", "SALES_REP", "WAREHOUSE_STAFF"] },

  // Customer Self-Service Portal
  { pathPrefix: "/customer", allowedRoles: ["CUSTOMER", "ADMINISTRATOR"] },
];

/**
 * Checks if a given role is authorized to access a pathname.
 */
export function isRouteAllowed(pathname: string, role?: string): boolean {
  if (!role) return false;

  const userRole = role as UserRole;

  // ADMINISTRATOR always has root privileges
  if (userRole === "ADMINISTRATOR") return true;

  // Find most specific matching rule
  const matchedRules = ROUTE_PERMISSIONS.filter((r) =>
    pathname.startsWith(r.pathPrefix)
  );

  if (matchedRules.length === 0) {
    // Path not under strict RBAC restriction
    return true;
  }

  // Sort by longest pathPrefix first for most specific rule
  matchedRules.sort((a, b) => b.pathPrefix.length - a.pathPrefix.length);
  const targetRule = matchedRules[0];

  return targetRule.allowedRoles.includes(userRole);
}

/**
 * Returns default landing page for a role after successful login.
 * Untuk role custom, gunakan `RoleDefinition.defaultRoute` dari role-store.
 */
export function getDefaultDashboard(role?: string): string {
  switch (role) {
    case "ADMINISTRATOR":
      return "/portal/dashboard";
    case "SALES_REP":
      return "/portal/crm/leads";
    case "WAREHOUSE_STAFF":
      return "/portal/warehouse/inventory";
    case "CUSTOMER":
      return "/customer/dashboard";
    default:
      return "/portal/dashboard";
  }
}

/**
 * Cek apakah akses sebuah rute portal ditolak oleh konfigurasi
 * Role & Menu Management (peta menu per role).
 *
 * - Token lama tanpa klaim `menu` -> pakai aturan ROUTE_PERMISSIONS.
 * - Administrator -> selalu diizinkan.
 * - Rute yang tidak terdaftar pada registry menu -> pakai aturan ROUTE_PERMISSIONS.
 */
export function isMenuDenied(
  pathname: string,
  role?: string,
  menuIds?: string[]
): boolean {
  if (!role) return false;
  if (role === "ADMINISTRATOR") return false;
  if (!Array.isArray(menuIds)) return false;

  const item = findMenuItemByPath(pathname);
  if (!item) return false;

  return !menuIds.includes(item.id);
}
