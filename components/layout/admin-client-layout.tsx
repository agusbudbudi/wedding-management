"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { signOut } from "@/lib/services/auth-actions";
import {
  Search,
  Menu,
  LogOut,
  Users,
  CalendarDays,
  Bell,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { supabaseEventService } from "@/lib/services/event-service";
import { Event } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarNav } from "./sidebar-nav";
import { NotificationTray } from "../features/notification-tray";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminClientLayoutProps {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export function AdminClientLayout({ children, user }: AdminClientLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get("q") || "");
  const [isPending, startTransition] = useTransition();
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);

  useEffect(() => {
    const loadActiveEvent = async () => {
      const eventId = localStorage.getItem("active_event_id");
      if (eventId) {
        try {
          const event = await supabaseEventService.getEventById(eventId);
          setActiveEvent(event);
        } catch (error) {
          console.error("Failed to load active event", error);
        }
      } else {
        setActiveEvent(null);
      }
    };

    loadActiveEvent();

    window.addEventListener("active-event-changed", loadActiveEvent);
    return () => {
      window.removeEventListener("active-event-changed", loadActiveEvent);
    };
  }, []);

  const isGuestListPage = pathname === "/dashboard/guests";

  useEffect(() => {
    setSearchValue(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);

    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("active_event_id");
    startTransition(async () => {
      await signOut();
    });
  };

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex h-screen bg-[#F8F9FD]">
      {/* Sidebar */}
      <aside className="w-64 bg-white hidden md:flex flex-col border-r border-gray-100/50 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
        <div className="px-8 py-6">
          <div className="flex items-center gap-3 text-primary">
            <div className="bg-primary/10 p-2 rounded-xl">
              <div className="w-6 h-6 bg-primary rounded-md transform rotate-45" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              Marinikah
            </h1>
          </div>
        </div>

        <SidebarNav />

        <div className="p-4">
          <div className="relative mt-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-20" />
            <div className="relative bg-gradient-to-br from-blue-600 to-cyan-500 p-4 rounded-2xl text-white overflow-hidden group">
              {/* Decorative elements */}
              <div className="absolute top-2 right-2 p-3 opacity-10 transform translate-x-1/3 -translate-y-1/3">
                <Sparkles className="w-20 h-20 fill-current" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-white/20 p-1 rounded-lg backdrop-blur-sm size-6">
                    <Zap className="w-4 h-4 text-white fill-white" />
                  </div>
                  <h3 className="font-bold text-lg leading-tight">
                    Upgrade to Pro
                  </h3>
                </div>
                <p className="text-blue-50 text-xs mb-2 leading-relaxed opacity-90">
                  Unlock premium features to elevate your wedding.
                </p>

                <Link href="/dashboard/subscription">
                  <Button
                    size="sm"
                    className="w-full bg-white text-blue-600 hover:bg-blue-50 border-0 shadow-lg shadow-black/5 font-bold h-9 rounded-xl"
                  >
                    Upgrade Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-sm px-8 py-1 flex items-center justify-between border-b border-gray-100 sticky top-0 z-20">
          <div className="flex items-center gap-4 flex-1">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
            {isGuestListPage && (
              <div className="relative max-w-sm w-full hidden md:block animate-in fade-in slide-in-from-left-4 duration-300">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search guests..."
                  value={searchValue}
                  onChange={handleSearch}
                  className="pl-10 bg-gray-50/50 border-gray-100 focus:bg-white transition-all rounded-xl"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {activeEvent && (
              <Link
                href="/dashboard/events"
                className="hidden lg:flex items-center gap-3 px-3.5 py-1.5 bg-gray-50 hover:bg-white hover:border-blue-300 hover:shadow-md hover:shadow-blue-500/5 transition-all rounded-lg border border-gray-100 group"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                    <p className="text-xs font-bold text-gray-900 leading-none truncate max-w-[120px]">
                      {activeEvent.name}
                    </p>
                  </div>
                  <p className="text-[10px] text-gray-500 ml-3.5 mt-1 opacity-80 tracking-tight">
                    {new Date(activeEvent.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </Link>
            )}
            <div className="flex items-center gap-2">
              <NotificationTray />
            </div>
            <div className="h-8 w-[1px] bg-gray-200 mx-2" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-gray-900 leading-none mb-1">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 leading-none">
                      {user.email}
                    </p>
                  </div>
                  <Avatar className="w-10 h-10 border-2 border-white shadow-sm ring-1 ring-gray-100">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 p-2 rounded-2xl shadow-xl shadow-gray-200/50 border-gray-100"
              >
                <div className="p-2 mb-2 bg-gray-50/50 rounded-xl">
                  <p className="font-semibold text-sm text-gray-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>

                <div className="px-2 py-1.5 mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      Current Plan
                    </p>
                    <Link
                      href="/dashboard/subscription"
                      className="text-[10px] font-bold text-primary hover:underline"
                    >
                      Upgrade
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                    <div className="bg-blue-100 p-1 rounded-md">
                      <Zap className="w-3 h-3 text-blue-600 fill-blue-600" />
                    </div>
                    <span className="text-xs font-bold text-blue-700">
                      Free Plan
                    </span>
                  </div>
                </div>
                {/* <DropdownMenuSeparator /> */}
                {/* <DropdownMenuItem className="rounded-xl cursor-pointer">
                  <UserCog className="w-4 h-4 mr-2 text-gray-400" />
                  Account Settings
                </DropdownMenuItem> */}
                <DropdownMenuSeparator className="bg-gray-100 my-1" />
                <DropdownMenuItem
                  className="rounded-xl cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                  onClick={handleLogout}
                  disabled={isPending}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {isPending ? "Logging out..." : "Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
