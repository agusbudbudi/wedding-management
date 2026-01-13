"use client";

import { useState, useEffect, useMemo } from "react";
import { supabaseGuestService } from "@/lib/services/guest-service";
import { supabaseEventService } from "@/lib/services/event-service";
import { logService } from "@/lib/services/log-service";
import { Event, GuestLog } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  CheckCircle2,
  QrCode,
  ArrowUpRight,
  Clock,
  MapPin,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  UserCheck,
  Loader2,
  CalendarDays,
  Gift,
  RefreshCcw,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { exportService } from "@/lib/services/export-service";
import { ExportDropdown } from "@/components/features/export-dropdown";
import { DashboardAnalytics } from "@/components/features/dashboard-analytics";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

export default function DashboardPage() {
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDateEvents, setSelectedDateEvents] = useState<Event[]>([]);
  const [showTray, setShowTray] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [logs, setLogs] = useState<GuestLog[]>([]);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const stored = localStorage.getItem("active_event_id");
    setActiveEventId(stored);
    loadData(stored || undefined);
    loadAllEvents();
  }, []);

  async function loadAllEvents() {
    try {
      const events = await supabaseEventService.getEvents();
      setAllEvents(events as any);
    } catch (error) {
      console.error("Failed to load all events", error);
    }
  }

  async function loadData(eventId?: string) {
    try {
      const [guestsData, eventData, logsData] = await Promise.all([
        supabaseGuestService.getGuests(eventId),
        eventId
          ? supabaseEventService.getEventById(eventId)
          : Promise.resolve(null),
        eventId ? logService.getLogsByEventId(eventId, 5) : Promise.resolve([]),
      ]);
      setGuests(guestsData);
      setActiveEvent(eventData);
      setLogs(logsData);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!activeEventId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`dashboard-realtime-${activeEventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "guests",
          filter: `event_id=eq.${activeEventId}`,
        },
        () => {
          loadData(activeEventId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeEventId]);

  const handleExportExcel = () => {
    if (!guests || guests.length === 0) {
      toast.error("No guests to export");
      return;
    }
    exportService.exportGuestsToExcel(guests, activeEvent?.name || "Event");
    toast.success("Exporting excel report...");
  };

  const handleExportPdf = () => {
    if (!guests || guests.length === 0) {
      toast.error("No guests to export");
      return;
    }
    exportService.exportSummaryToPDF(guests, activeEvent);
    toast.success("Exporting PDF summary...");
  };

  const totalGuests = guests.length;
  const confirmedGuests = guests.filter(
    (g) =>
      g.status === "confirmed" ||
      g.status === "attended" ||
      g.status === "souvenir_delivered"
  ).length;
  const declinedGuests = guests.filter((g) => g.status === "declined").length;
  const attendedGuests = guests.filter(
    (g) => g.status === "attended" || g.status === "souvenir_delivered"
  ).length;
  const redeemedSouvenirs = guests.filter(
    (g) => g.status === "souvenir_delivered"
  ).length;
  const pendingRSVP = guests.filter(
    (g) =>
      !["confirmed", "attended", "souvenir_delivered", "declined"].includes(
        g.status
      )
  ).length;
  const totalPax = guests.reduce((sum, g) => sum + (g.pax_count || 0), 0);

  const rsvpPieData = [
    { name: "Confirmed", value: confirmedGuests, color: "#10b981" },
    { name: "Declined", value: declinedGuests, color: "#ef4444" },
    { name: "Pending", value: pendingRSVP, color: "#f59e0b" },
  ];

  const categoryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    guests.forEach((g) => {
      const cat = g.category || "other";
      counts[cat] = (counts[cat] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        count,
        percentage:
          totalGuests > 0 ? Math.round((count / totalGuests) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [guests, totalGuests]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!activeEventId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-gray-100 animate-in fade-in zoom-in duration-700">
        <div className="bg-blue-50 p-6 rounded-full mb-6">
          <CalendarDays className="w-12 h-12 text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          No Active Event Selected
        </h2>
        <p className="text-gray-500 mb-8 text-center max-w-sm">
          You need to select or create an event to see the Dashboard.
        </p>
        <Button
          onClick={() => (window.location.href = "/dashboard/events")}
          className="bg-primary shadow-lg shadow-blue-500/30 hover:bg-blue-600"
        >
          Manage Events
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Event Dashboard
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-gray-500">
              {activeEvent
                ? new Date(activeEvent.date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "No event selected"}
            </p>
            {activeEvent && (
              <>
                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                <div className="bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1.5 border border-blue-100 animate-in fade-in zoom-in duration-500">
                  {(() => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const eventDate = new Date(activeEvent.date);
                    eventDate.setHours(0, 0, 0, 0);
                    const diffTime = eventDate.getTime() - today.getTime();
                    const diffDays = Math.ceil(
                      diffTime / (1000 * 60 * 60 * 24)
                    );

                    if (diffDays > 0)
                      return `${diffDays} days remaining until the event`;
                    if (diffDays === 0) return "Today is the event day!";
                    return "Event has passed";
                  })()}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="bg-white"
            onClick={() => window.location.reload()}
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Refresh data
          </Button>
          <ExportDropdown
            onExportExcel={handleExportExcel}
            onExportPdf={handleExportPdf}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Stats */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Hero Card */}
            <div className="md:col-span-2 bg-white rounded-[2rem] p-8 shadow-[0_2px_40px_-12px_rgba(0,0,0,0.08)] relative overflow-hidden">
              <div className="relative z-10 flex justify-between items-start">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Event Name
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    {activeEvent?.name || "No Event Selected"}
                  </h2>
                  <div className="flex items-center gap-4 text-gray-500 text-sm whitespace-nowrap">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> 09:00 AM - 02:00 PM
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />{" "}
                      {activeEvent?.location || "No Location Set"}
                    </span>
                  </div>
                </div>
                <div className="hidden sm:flex -space-x-2">
                  {guests
                    .filter(
                      (g) =>
                        g.status === "attended" ||
                        g.status === "souvenir_delivered"
                    )
                    .slice(0, 3)
                    .map((guest, i) => (
                      <div
                        key={guest.id}
                        className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-black shadow-xs text-white ${
                          ["bg-blue-500", "bg-indigo-500", "bg-purple-500"][
                            i % 3
                          ]
                        }`}
                        title={guest.name}
                      >
                        {guest.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                    ))}
                  {attendedGuests > 3 && (
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-50 flex items-center justify-center text-[9px] font-black text-blue-600 shadow-xs ">
                      +{attendedGuests - 3}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <StatCard
              title="Est. Total Pax"
              value={totalPax.toString()}
              trend="Prediction"
              icon={Users}
              color="indigo"
              variant="filled"
              className="md:col-span-1"
            />
          </div>

          {/* RSVP Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Guests"
              value={totalGuests.toString()}
              trend="Total"
              icon={Users}
              color="blue"
              className="md:col-span-1"
            >
              <div className="pt-2 mt-2 border-t border-gray-100 space-y-2">
                {categoryBreakdown.slice(0, 3).map((cat: any) => (
                  <div
                    key={cat.name}
                    className="flex items-center justify-between group"
                  >
                    <span className="text-[11px] font-medium text-gray-500 group-hover:text-blue-600 transition-colors">
                      {cat.name}{" "}
                      <span className="text-gray-900 font-bold ml-1">
                        {cat.count}
                      </span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[9px] font-black border border-blue-100 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
                      {cat.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </StatCard>
            <div className="md:col-span-2 py-6 px-6 rounded-[1.5rem] bg-white shadow-[0_2px_40px_-12px_rgba(0,0,0,0.08)] transition-all hover:-translate-y-1 duration-300">
              <div className="flex justify-between items-start mb-1">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-500">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                  RSVP Status
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="grid grid-cols-2 gap-4 flex-1">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                      <ThumbsUp className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-xs font-medium">Yes</span>
                    </div>
                    <h3 className="text-3xl font-bold tracking-tight text-gray-900">
                      {confirmedGuests}
                    </h3>
                    <p className="text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full inline-block">
                      Confirmed
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                      <ThumbsDown className="w-3.5 h-3.5 text-red-500" />
                      <span className="text-xs font-medium">No</span>
                    </div>
                    <h3 className="text-3xl font-bold tracking-tight text-gray-900">
                      {declinedGuests}
                    </h3>
                    <p className="text-[10px] font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full inline-block">
                      Declined
                    </p>
                  </div>
                </div>

                <div className="h-32 w-48 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={rsvpPieData}
                        cx="42%"
                        cy="50%"
                        innerRadius={28}
                        outerRadius={42}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {rsvpPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend
                        verticalAlign="middle"
                        align="right"
                        layout="vertical"
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{
                          fontSize: "10px",
                          paddingLeft: "10px",
                          lineHeight: "18px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance & Capacity Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard
              title="Attended"
              value={attendedGuests.toString()}
              subValue={
                confirmedGuests > 0
                  ? `${Math.round((attendedGuests / confirmedGuests) * 100)}%`
                  : undefined
              }
              trend="Check-in"
              icon={UserCheck}
              color="purple"
            />
            <StatCard
              title="Souvenirs"
              value={redeemedSouvenirs.toString()}
              subValue={
                attendedGuests > 0
                  ? `${Math.round((redeemedSouvenirs / attendedGuests) * 100)}%`
                  : undefined
              }
              trend="Redeemed"
              icon={Gift}
              color="emerald"
            />
          </div>

          {/* Analytics Charts */}
          <DashboardAnalytics guests={guests} logs={logs} />
        </div>

        {/* Right Sidebar Mock */}
        <div className="space-y-8">
          {/* Calendar Widget */}
          <div className="bg-white p-6 rounded-[2rem] shadow-[0_2px_40px_-12px_rgba(0,0,0,0.08)] relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">
                {viewDate.toLocaleDateString("en-GB", {
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => {
                    const d = new Date(viewDate);
                    d.setMonth(d.getMonth() - 1);
                    setViewDate(d);
                  }}
                >
                  <ArrowUpRight className="w-4 h-4 rotate-[225deg]" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => {
                    const d = new Date(viewDate);
                    d.setMonth(d.getMonth() + 1);
                    setViewDate(d);
                  }}
                >
                  <ArrowUpRight className="w-4 h-4 rotate-45" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] mb-2">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <span
                  key={`${d}-${i}`}
                  className="text-gray-400 font-bold uppercase"
                >
                  {d}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium">
              {(() => {
                const year = viewDate.getFullYear();
                const month = viewDate.getMonth();
                const firstDay = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const days = [];
                // Add padding from previous month
                for (let i = 0; i < firstDay; i++) {
                  days.push(<div key={`pad-${i}`} className="h-8 w-8" />);
                }

                // Add real days
                for (let d = 1; d <= daysInMonth; d++) {
                  const currentDay = new Date(year, month, d);
                  currentDay.setHours(0, 0, 0, 0);

                  const isToday = currentDay.getTime() === today.getTime();
                  const eventsForDay = allEvents.filter((e) => {
                    const eventDate = new Date(e.date);
                    eventDate.setHours(0, 0, 0, 0);
                    return eventDate.getTime() === currentDay.getTime();
                  });

                  const hasEvent = eventsForDay.length > 0;
                  const isActive =
                    activeEvent &&
                    currentDay.getTime() ===
                      new Date(activeEvent.date).setHours(0, 0, 0, 0);

                  days.push(
                    <button
                      key={d}
                      onClick={() => {
                        if (hasEvent) {
                          setSelectedDate(currentDay);
                          setSelectedDateEvents(eventsForDay);
                          setShowTray(true);
                        }
                      }}
                      className={`h-8 w-8 flex flex-col items-center justify-center rounded-full transition-all relative ${
                        isToday
                          ? "bg-blue-50 text-blue-600 ring-1 ring-blue-100 font-bold"
                          : ""
                      } ${
                        isActive
                          ? "ring-2 ring-primary ring-offset-2"
                          : "hover:bg-gray-50 text-gray-700"
                      } ${!hasEvent ? "cursor-default" : "cursor-pointer"}`}
                    >
                      {d}
                      {hasEvent && (
                        <span className="absolute bottom-1 w-1 h-1 bg-primary rounded-full" />
                      )}
                    </button>
                  );
                }
                return days;
              })()}
            </div>

            {/* Event Tray Overlay */}
            {showTray && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 animate-in slide-in-from-bottom-full duration-300 p-6 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-900">Events</h4>
                      <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {selectedDateEvents.length}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-medium">
                      {selectedDate?.toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => setShowTray(false)}
                  >
                    <ArrowUpRight className="w-4 h-4 rotate-[225deg]" />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3">
                  {selectedDateEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => {
                        if (activeEventId === event.id) return;
                        localStorage.setItem("active_event_id", event.id);
                        setActiveEventId(event.id);
                        loadData(event.id);
                        setShowTray(false);
                        toast.success(`Switched to ${event.name}`);
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        activeEventId === event.id
                          ? "bg-blue-50/50 border-blue-100"
                          : "bg-gray-50/50 border-gray-100 hover:border-blue-200 hover:bg-blue-50/30"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                          {event.type}
                        </span>
                        {activeEventId === event.id && (
                          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <h5 className="font-bold text-sm text-gray-900 truncate">
                        {event.name}
                      </h5>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Activity Feed */}
          <div className="bg-white p-6 rounded-[2rem] shadow-[0_2px_40px_-12px_rgba(0,0,0,0.08)]">
            <h3 className="font-bold mb-6">Latest Updates</h3>
            <div className="relative border-l-2 border-dashed border-gray-100 ml-3 space-y-8 pb-4">
              {logs.length === 0 ? (
                <div className="pl-6 text-sm text-gray-400">
                  No recent activity
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="pl-6 relative">
                    <span className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white" />
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {hasMounted ? (
                          (() => {
                            const isGuestAction =
                              log.action === "confirmed" ||
                              log.action === "declined";
                            const isSystemAction = log.action === "import";
                            const isStaffAction = [
                              "create",
                              "update",
                              "attended",
                              "souvenir_delivered",
                            ].includes(log.action);

                            let title = "System";
                            if (isGuestAction) {
                              title = log.guest?.name || "Guest";
                            } else if (isStaffAction) {
                              // Try to get from profile
                              title =
                                log.profile?.full_name ||
                                log.profile?.email ||
                                "Staff";

                              // If it's still "Staff" or an email, try to extract from description
                              // (e.g. "... by Agus Budiman (email@example.com)")
                              if (
                                (title === "Staff" || title.includes("@")) &&
                                log.description.includes("by ")
                              ) {
                                const parts = log.description.split("by ");
                                let potentialName = parts[parts.length - 1];

                                if (potentialName) {
                                  // Strip email part if present (e.g. "Agus Budiman (agus@yopmail.com)")
                                  if (potentialName.includes(" (")) {
                                    potentialName =
                                      potentialName.split(" (")[0];
                                  }
                                  title = potentialName;
                                }
                              }
                            } else if (isSystemAction) {
                              title = "System";
                            } else if (log.user_id) {
                              title =
                                log.profile?.full_name ||
                                log.profile?.email ||
                                "Staff";
                            }

                            const initial = title.charAt(0).toUpperCase();

                            return (
                              <>
                                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-[10px] font-bold text-blue-600">
                                  {initial}
                                </div>
                                <span className="font-bold text-sm">
                                  {title}
                                </span>
                              </>
                            );
                          })()
                        ) : (
                          <>
                            <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-400">
                              -
                            </div>
                            <span className="font-bold text-sm text-gray-400 font-mono">
                              Loading...
                            </span>
                          </>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400">
                        {hasMounted &&
                          (() => {
                            const now = new Date();
                            const created = new Date(log.created_at);
                            const diff = Math.floor(
                              (now.getTime() - created.getTime()) / 1000
                            );
                            if (diff < 60) return "Just now";
                            if (diff < 3600)
                              return `${Math.floor(diff / 60)}m ago`;
                            if (diff < 86400)
                              return `${Math.floor(diff / 3600)}h ago`;
                            return `${Math.floor(diff / 86400)}d ago`;
                          })()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg rounded-tl-none line-clamp-4">
                      {log.description}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subValue,
  trend,
  icon: Icon,
  color,
  variant,
  className,
  children,
}: any) {
  const isFilled = variant === "filled";

  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-500",
    green: "bg-green-50 text-green-500",
    red: "bg-red-50 text-red-500",
    purple: "bg-purple-50 text-purple-500",
    indigo: "bg-indigo-50 text-indigo-500",
    emerald: "bg-emerald-50 text-emerald-500",
  };

  const trendColorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  const bgIconClass = isFilled
    ? "bg-white/20"
    : colorMap[color]?.split(" ")[0] || "bg-gray-50";
  const textIconClass = isFilled
    ? "text-white"
    : colorMap[color]?.split(" ")[1] || "text-gray-500";
  const trendClass = isFilled
    ? "bg-white/20 text-white"
    : trendColorMap[color] || "bg-gray-50 text-gray-600";

  return (
    <div
      className={`p-6 rounded-[1.5rem] relative overflow-hidden transition-all hover:-translate-y-1 duration-300 ${
        isFilled
          ? "bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-xl shadow-blue-500/30"
          : "bg-white shadow-[0_2px_40px_-12px_rgba(0,0,0,0.08)]"
      } ${className}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl ${bgIconClass}`}>
          <Icon className={`w-5 h-5 ${textIconClass}`} />
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${trendClass}`}
          >
            {trend}
          </span>
        </div>
      </div>
      <div className="space-y-3">
        <div className="space-y-1">
          <p
            className={`text-sm ${
              isFilled ? "text-blue-100" : "text-gray-500"
            }`}
          >
            {title}
          </p>
          <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
        </div>

        {subValue && (
          <div className="space-y-1.5">
            <div className="flex justify-end">
              <div
                className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                  isFilled
                    ? "bg-white/10 border-white/20 text-white"
                    : "bg-gray-50 border-gray-100 text-gray-500"
                }`}
              >
                {subValue}
              </div>
            </div>
            <div
              className={`h-1.5 w-full rounded-full overflow-hidden ${
                isFilled ? "bg-white/20" : "bg-gray-100"
              }`}
            >
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${getProgressColor(
                  subValue,
                  isFilled,
                  colorMap,
                  color
                )}`}
                style={{ width: subValue }}
              />
            </div>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

function getProgressColor(
  subValue: string | undefined,
  isFilled: boolean,
  colorMap: Record<string, string>,
  color: string
) {
  if (!subValue)
    return isFilled
      ? "bg-white"
      : colorMap[color]?.split(" ")[1].replace("text-", "bg-") || "bg-primary";

  const percentage = parseInt(subValue);
  if (isNaN(percentage))
    return isFilled
      ? "bg-white"
      : colorMap[color]?.split(" ")[1].replace("text-", "bg-") || "bg-primary";

  if (isFilled) return "bg-white";

  if (percentage <= 39) return "bg-blue-500";
  if (percentage <= 74) return "bg-orange-500";
  return "bg-green-500";
}
