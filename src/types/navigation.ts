import type { LucideIcon } from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: "green" | "amber" | "blue";
  exact?: boolean;
}

export interface NavigationSection {
  title?: string;
  items: NavItem[];
}
