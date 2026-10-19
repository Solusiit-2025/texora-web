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
  designServiceType?: "CUSTOMER_FILE" | "TEXORA_DESIGN_SERVICE";
  designServiceFee?: number;
  designNotes?: string;
}

const STORAGE_KEY = "texora-cart";

export function loadCart(): CartLineItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];

    // Bersihkan HANYA item mockup lama ber-ID statis cart-1 & cart-2 jika tersisa
    const cleaned = parsed.filter(
      (item: any) => item && item.id !== "cart-1" && item.id !== "cart-2"
    );

    // Sinkronkan kembali ke localStorage jika ada mock data yang terhapus
    if (cleaned.length !== parsed.length) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      window.dispatchEvent(new Event("texora-cart-updated"));
    }

    return cleaned;
  } catch {
    return [];
  }
}

export function saveCart(items: CartLineItem[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("texora-cart-updated"));
  } catch {
    // abaikan error kuota/serialisasi di mode mockup
  }
}

export function addToCart(item: Omit<CartLineItem, "id">): void {
  const next: CartLineItem = { ...item, id: `cart-${Date.now()}` };
  saveCart([...loadCart(), next]);
}

export function clearCart(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("texora-cart-updated"));
  } catch {
    // ignore
  }
}
