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
  Image as ImageIcon,
  Gift,
} from "lucide-react";

export function SidebarNav({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname();
  const { canAccess, loading } = usePermissions();

  const isActive = (path: string) => {
    if (path === "/dashboard" && pathname === "/dashboard") return true;
    if (path !== "/dashboard" && pathname.startsWith(path)) return true;
    return false;
  };

  const menuGroups = [
    {
      title: "OVERVIEW",
      items: [
        { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/dashboard/events", icon: CalendarDays, label: "Events" },
      ],
    },
    {
      title: "EVENT DAY",
      items: [
        { href: "/dashboard/guests", icon: Users, label: "Guest List" },
        { href: "/dashboard/seating", icon: Sofa, label: "Seating" },
        { href: "/check-in", icon: ScanLine, label: "Check-in Tool" },
        { href: "/dashboard/souvenirs", icon: Gift, label: "Souvenirs" },
      ],
    },
    {
      title: "EVENT SETUP",
      items: [
        { href: "/dashboard/invitations", icon: Mail, label: "Invitations" },
        { href: "/dashboard/staff", icon: UserCog, label: "Staff Event" },
      ],
    },
    {
      title: "POST EVENT",
      items: [
        { href: "/dashboard/guest-book", icon: ImageIcon, label: "Guest Book" },
      ],
    },
    {
      title: "ACCOUNT",
      items: [
        { href: "/dashboard/settings", icon: Settings, label: "Settings" },
      ],
    },
  ];

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
    <nav className="flex-1 px-6 space-y-4 overflow-y-auto pt-4 scrollbar-hide pb-6">
      {menuGroups.map((group) => {
        const filteredItems = group.items.filter((item) =>
          canAccess(item.label)
        );

        if (filteredItems.length === 0) return null;

        return (
          <div key={group.title} className="space-y-1">
            <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">
              {group.title}
            </p>
            {filteredItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                active={isActive(item.href)}
                onClick={onItemClick}
              />
            ))}
          </div>
        );
      })}
    </nav>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
  active,
  onClick,
}: {
  href: string;
  icon: any;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
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
