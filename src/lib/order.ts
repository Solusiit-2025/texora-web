export interface PlacedOrderItem {
  id: string;
  fabricName: string;
  gsm: number;
  lengthMeters: number;
  unitPrice: number;
  subtotal: number;
  customDesignTitle?: string;
}

export interface PlacedOrder {
  orderNumber: string;
  customerName: string;
  customerCompany?: string;
  totalAmount: number;
  taxAmount: number;
  shippingAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  trackingNumber?: string;
  createdAt: string;
  notes?: string;
  items: PlacedOrderItem[];
}

const STORAGE_KEY = "texora-last-order";

export function saveLastOrder(order: PlacedOrder): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
  } catch {
    // abaikan error serialisasi di mode mockup
  }
}

export function loadLastOrder(): PlacedOrder | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PlacedOrder;
    if (parsed && (parsed.customerName === "Hendra Wijaya" || parsed.orderNumber === "TEX-202610-001")) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
