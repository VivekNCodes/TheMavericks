import {
  LayoutDashboard,
  Sprout,
  TrendingUp,
  Droplets,
  Store,
  Settings,
  HelpCircle,
  CalendarRange,
  Bot,
} from "lucide-react";
import type { NavItem } from "@/types/navigation";

/**
 * Main application navigation tabs.
 * 'My Crops', 'Advisories', and 'Community' are removed from main sidebar tabs
 * and embedded as specialized interactive sections directly on the Dashboard.
 */
export const primaryNavItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    id: "assistant",
    label: "AI Assistant",
    href: "/assistant",
    icon: Bot,
  },
  {
    id: "crop-planner",
    label: "Crop Planner",
    href: "/crop-planner",
    icon: CalendarRange,
  },
  {
    id: "crop-health",
    label: "Crop Health",
    href: "/crop-disease",
    icon: Sprout,
  },
  {
    id: "mandi-prices",
    label: "Mandi Prices",
    href: "/mandi-prices",
    icon: TrendingUp,
  },
  {
    id: "irrigation",
    label: "Irrigation Advisor",
    href: "/irrigation",
    icon: Droplets,
  },
  {
    id: "marketplace",
    label: "Marketplace",
    href: "/marketplace",
    icon: Store,
  },
];

export const secondaryNavItems: NavItem[] = [
  {
    id: "settings",
    label: "Settings",
    href: "/#settings",
    icon: Settings,
  },
  {
    id: "help-support",
    label: "Help & Support",
    href: "/#support",
    icon: HelpCircle,
  },
];
