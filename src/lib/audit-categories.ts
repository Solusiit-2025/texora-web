/**
 * Kategori log audit berdasarkan prefix `action`.
 *
 * Modul ini sengaja TANPA dependensi server (prisma) supaya bisa diimpor
 * komponen client (halaman /portal/audit-logs) maupun route API.
 */
export const AUDIT_CATEGORIES: Record<string, string[]> = {
  security: ["LOGIN_", "LOGOUT", "2FA_"],
  access: ["USER_", "ROLE_", "RBAC_", "MENU_"],
  content: ["CMS_", "PRODUCT_", "SEO_", "I18N_", "TRANSLATION_", "ARTICLE_"],
  system: ["BACKUP_", "CRON_", "SYSTEM_"],
  sales: ["QUOTE_", "LEAD_", "ORDER_"],
};

/** Kategori dari sebuah `action` (untuk badge/filter di UI). */
export function auditCategoryOf(action: string): string {
  for (const [category, prefixes] of Object.entries(AUDIT_CATEGORIES)) {
    if (prefixes.some((prefix) => action.startsWith(prefix))) return category;
  }
  return "other";
}
