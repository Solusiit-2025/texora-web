export interface CartLineItem {
  id: string;
  fabricName: string;
  gsm: number;
  widthInch: number;
  meters: number;
  unitPrice: number;
  sublimationPrintFeePerMeter: number;
  customDesignTitle?: string;
  customDesignDpi?: number;
}

const STORAGE_KEY = "texora-cart";

export function loadCart(): CartLineItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartLineItem[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // abaikan error kuota/serialisasi di mode mockup
  }
}

export function addToCart(item: Omit<CartLineItem, "id">): void {
  const next: CartLineItem = { ...item, id: `cart-${Date.now()}` };
  saveCart([...loadCart(), next]);
}
