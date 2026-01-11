"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePermissions } from "@/lib/hooks/use-permissions";
import {
  LayoutDashboard,
  Users,
  Settings,
  QrCode,
  CalendarDays,
  ScanLine,
  Mail,
  UserCog,
  Sofa,
} from "lucide-react";

export function SidebarNav() {
  const pathname = usePathname();
  const { canAccess, loading } = usePermissions();

  const isActive = (path: string) => {
    if (path === "/dashboard" && pathname === "/dashboard") return true;
    if (path !== "/dashboard" && pathname.startsWith(path)) return true;
    return false;
  };

  const menuItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/events", icon: CalendarDays, label: "Events" },
    { href: "/dashboard/guests", icon: Users, label: "Guest List" },
    { href: "/dashboard/seating", icon: Sofa, label: "Seating" },
    { href: "/check-in", icon: ScanLine, label: "Check-in Tool" },
    { href: "/dashboard/invitations", icon: Mail, label: "Invitations" },
    { href: "/dashboard/staff", icon: UserCog, label: "Staff Event" },
  ];

  const filteredMenu = menuItems.filter((item) => canAccess(item.label));

  if (loading) {
    return (
      <nav className="flex-1 px-6 space-y-6">
        <div className="space-y-4">
          <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-gray-50 rounded-xl animate-pulse" />
          ))}
        </div>
      </nav>
    );
  }

  return (
    <nav className="flex-1 px-6 space-y-6 overflow-y-auto pt-4 scrollbar-hide">
      {/* Main Menu */}
      <div className="space-y-2">
        <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">
          Main Menu
        </p>
        {filteredMenu.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            active={isActive(item.href)}
          />
        ))}
      </div>

      {/* Account Settings (Always Visible) */}
      <div className="space-y-3">
        <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">
          Account
        </p>
        <NavItem
          href="/dashboard/settings"
          icon={Settings}
          label="Settings"
          active={isActive("/dashboard/settings")}
        />
      </div>
    </nav>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: any;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
        active
          ? "bg-primary text-white shadow-lg shadow-blue-500/30"
          : "text-gray-500 hover:bg-gray-50 hover:text-primary"
      }`}
    >
      <Icon
        className={`w-5 h-5 ${
          active ? "text-white" : "text-gray-400 group-hover:text-primary"
        }`}
      />
      <span className="font-medium text-sm">{label}</span>
      {active && (
        <div className="ml-auto w-1 h-1 bg-white rounded-full opacity-50" />
      )}
    </Link>
  );
}
