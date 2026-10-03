// Type Definitions for PT. Texora Visi Prima

export type UserRole = "CUSTOMER" | "SALES_REP" | "WAREHOUSE_STAFF" | "ADMINISTRATOR";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyName?: string;
  phoneNumber?: string;
  taxId?: string;
}

export interface PriceTier {
  id: string;
  minMeters: number;
  maxMeters?: number;
  unitPrice: number;
}

export interface FabricVariant {
  id: string;
  gsm: number;
  colorName: string;
  stockMeters: number;
}

export interface FabricProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  composition: string;
  weaveType: string;
  widthInch: number;
  isSublimationReady: boolean;
  basePricePerMeter: number;
  thumbnailUrl: string;
  category: "Sportswear" | "Fashion & Hijab" | "Merchandise & Flag" | "Home Living";
  variants: FabricVariant[];
  priceTiers: PriceTier[];
}

export type DesignStatus = "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "REJECTED";

export interface CustomSublimationDesign {
  id: string;
  title: string;
  fileUrl: string;
  fileName: string;
  fileSizeBytes: number;
  dpi: number;
  printWidthCm: number;
  printHeightCm: number;
  status: DesignStatus;
  fabricId: string;
  fabricName: string;
  requiredMeters: number;
  proofNotes?: string;
}

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "IN_PRODUCTION"
  | "QUALITY_CONTROL"
  | "READY_TO_SHIP"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentStatus = "UNPAID" | "PAID" | "EXPIRED" | "REFUNDED";

export interface OrderItem {
  id: string;
  fabricName: string;
  gsm: number;
  lengthMeters: number;
  unitPrice: number;
  subtotal: number;
  customDesignTitle?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerCompany?: string;
  customerEmail: string;
  customerPhone: string;
  totalAmount: number;
  taxAmount: number;
  shippingAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  trackingNumber?: string;
  createdAt: string;
  items: OrderItem[];
  notes?: string;
}

export type LeadStage =
  | "NEW_INQUIRY"
  | "REQUIREMENT_GATHERING"
  | "QUOTATION_SENT"
  | "NEGOTIATION"
  | "WON"
  | "LOST";

export type ActivityType =
  | "NOTE"
  | "PHONE_CALL"
  | "WHATSAPP_MESSAGE"
  | "EMAIL"
  | "MEETING"
  | "SAMPLE_FABRIC_SENT";

export interface ActivityLog {
  id: string;
  leadId: string;
  authorName: string;
  type: ActivityType;
  description: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  title: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  estimatedValue: number;
  estimatedMeters: number;
  fabricInterest: string;
  stage: LeadStage;
  assignedSalesName: string;
  updatedAt: string;
  activities: ActivityLog[];
}

export interface InventoryRoll {
  id: string;
  rollBarcode: string;
  fabricName: string;
  gsm: number;
  initialMeters: number;
  currentMeters: number;
  warehouseLocation: string;
  batchLot: string;
  receivedDate: string;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  variantId: string;
  gsm: number;
  widthInch: number;
  lengthMeters: number;
  unitPrice: number;
  customDesignId?: string;
  customDesignTitle?: string;
  customDesignFile?: string;
}
