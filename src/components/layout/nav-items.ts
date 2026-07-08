import {
  LayoutDashboard,
  ClipboardList,
  Building2,
  Users,
  UserRound,
  Handshake,
  FileBarChart,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Registrations", href: "/registrations", icon: ClipboardList },
  { title: "Properties", href: "/properties", icon: Building2 },
  { title: "Owners", href: "/owners", icon: Users },
  { title: "Tenants", href: "/tenants", icon: UserRound },
  { title: "Deals", href: "/deals", icon: Handshake },
  { title: "Report", href: "/report", icon: FileBarChart },
];
