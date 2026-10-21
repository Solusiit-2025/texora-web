import {
  LayoutDashboard,
  MessagesSquare,
  MessageCircle,
  Mail,
  TrendingUp,
  Users,
  BarChart3,
  ClipboardList,
  FileCheck,
  FileText,
  Barcode,
  Scissors,
  Landmark,
  ShoppingCart,
  Sliders,
  LayoutTemplate,
  ShieldAlert,
  ShieldCheck,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { MenuIconName } from "@/config/portal-menu";

export const MENU_ICONS: Record<MenuIconName, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  "messages-square": MessagesSquare,
  "message-circle": MessageCircle,
  mail: Mail,
  "trending-up": TrendingUp,
  users: Users,
  "bar-chart-3": BarChart3,
  "clipboard-list": ClipboardList,
  "file-check": FileCheck,
  "file-text": FileText,
  barcode: Barcode,
  scissors: Scissors,
  landmark: Landmark,
  "shopping-cart": ShoppingCart,
  sliders: Sliders,
  "layout-template": LayoutTemplate,
  "shield-alert": ShieldAlert,
  "shield-check": ShieldCheck,
  settings: Settings,
};

export function getMenuIcon(icon: MenuIconName): LucideIcon {
  return MENU_ICONS[icon] ?? Settings;
}
