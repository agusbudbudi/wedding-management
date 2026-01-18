"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseGuestService } from "@/lib/services/guest-service";
import { GuestList } from "@/components/features/guest-list";
import { AddGuestDialog } from "@/components/features/add-guest-dialog";
import { ImportGuestDialog } from "@/components/features/import-guest-dialog";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { Loader2, RefreshCcw, Download } from "lucide-react";
import { exportService } from "@/lib/services/export-service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Guest, Event as WeddingEvent } from "@/lib/types";
import { ExportDropdown } from "@/components/features/export-dropdown";
import { supabaseEventService } from "@/lib/services/event-service";
import { supabaseNotificationService } from "@/lib/services/notification-service";
import { createClient } from "@/lib/supabase/client";
import {
  subscriptionService,
  UserSubscription,
} from "@/lib/services/subscription-service";
import { TriangleAlert, Info, Zap } from "lucide-react";
import { PermissionGuard } from "@/components/auth/permission-guard";

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [activeEvent, setActiveEvent] = useState<WeddingEvent | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(
    null,
  );
  const { hasPermission } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("active_event_id");
    setActiveEventId(stored);
    loadGuests(stored || undefined);
    loadSubscription();
  }, []);

  async function loadSubscription() {
    const supabase = createClient();
    const sub = await subscriptionService.getSubscription(supabase);
    setSubscription(sub);
  }

  async function loadGuests(eventId?: string, silent = false) {
    try {
      if (!silent) setLoading(true);
      const [guestsData, eventData] = await Promise.all([
        supabaseGuestService.getGuests(eventId),
        eventId
          ? supabaseEventService.getEventById(eventId)
          : Promise.resolve(null),
      ]);
      setGuests(guestsData as Guest[]);
      setActiveEvent(eventData);
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    if (!activeEventId) return;

    const supabase = createClient();
    const channel = supabase
      .channel("guests-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "guests",
          filter: `event_id=eq.${activeEventId}`,
        },
        () => {
          loadGuests(activeEventId, true);
        },
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
    const eventName = activeEvent?.name || "Wedding Guest List";
    exportService.exportGuestsToExcel(guests, eventName);
    toast.success("Exporting excel report...");

    // Add notification
    supabaseNotificationService.createNotification({
      title: "✅ Excel Report Downloaded",
      message: `Successfully exported guest list for "${eventName}".`,
      type: "info",
    });
  };

  const handleExportPdf = () => {
    if (!guests || guests.length === 0) {
      toast.error("No guests to export");
      return;
    }
    exportService.exportSummaryToPDF(guests, activeEvent);
    toast.success("Exporting PDF summary...");

    // Add notification
    supabaseNotificationService.createNotification({
      title: "✅ PDF Summary Downloaded",
      message: `Successfully exported visual summary for "${
        activeEvent?.name || "Wedding Event"
      }".`,
      type: "info",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const canAdd = hasPermission("guest_list", "add");
  const canImport = hasPermission("guest_list", "import");

  const guestLimit = subscription
    ? subscriptionService.getPlanLimits(subscription.plan_type).guests
    : 100;
  const isFreePlan = !subscription || subscription.plan_type === "free";
  const isLimitReached = guests.length >= guestLimit;
  const remainingGuests = Math.max(0, guestLimit - guests.length);

  return (
    <PermissionGuard
      resource="guest_list"
      action="view"
      redirectTo="/restricted"
    >
      <div className="space-y-6">
        {isFreePlan && activeEventId && (
          <div
            className={`border p-3 rounded-[1.5rem] flex items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-500 ${
              isLimitReached
                ? "bg-red-50 border-red-100"
                : "bg-blue-50 border-blue-100"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-2.5 rounded-xl ${
                  isLimitReached ? "bg-red-600" : "bg-blue-600"
                }`}
              >
                {isLimitReached ? (
                  <TriangleAlert className="w-5 h-5 text-white fill-white" />
                ) : (
                  <Zap className="w-5 h-5 text-white fill-white" />
                )}
              </div>
              <div>
                <h3
                  className={`font-bold ${
                    isLimitReached ? "text-red-900" : "text-blue-900"
                  }`}
                >
                  {isLimitReached ? "Guest Limit Reached" : "Free Plan Active"}
                </h3>
                <p
                  className={`text-sm font-medium ${
                    isLimitReached ? "text-red-700/80" : "text-blue-700/70"
                  }`}
                >
                  {isLimitReached ? (
                    <>
                      You have reached the limit of{" "}
                      <span
                        className={`font-bold ${
                          isLimitReached ? "text-red-800" : "text-blue-800"
                        }`}
                      >
                        {guestLimit} guests
                      </span>
                      . Upgrade to add more.
                    </>
                  ) : (
                    <>
                      You are currently using the Free Plan. You can add{" "}
                      <span className="font-bold text-blue-800">
                        {remainingGuests} more guest
                        {remainingGuests === 1 ? "" : "s"}
                      </span>{" "}
                      to this event.
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!isLimitReached && (
                <div className="text-right hidden sm:block">
                  <span className="text-sm font-black text-blue-900 block leading-none">
                    {guests.length}/{guestLimit}
                  </span>
                  <span className="text-[10px] font-bold text-blue-600/60 uppercase tracking-wider">
                    Used
                  </span>
                </div>
              )}
              <Button
                variant="outline"
                className={`bg-white font-bold rounded-xl ${
                  isLimitReached
                    ? "border-red-200 text-red-600 hover:bg-red-50"
                    : "border-blue-200 text-blue-600 hover:bg-blue-50"
                }`}
                onClick={() => router.push("/dashboard/subscription")}
              >
                {isLimitReached ? "Upgrade Now" : "Upgrade to Pro"}
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Guest List</h1>
            <p className="text-gray-500 hidden md:block">
              {activeEventId
                ? "Manage your invitations for this event"
                : "Please select an event first"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => loadGuests(activeEventId || undefined)}
                className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50 font-medium h-10 px-4"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Refresh data
              </Button>
              <ExportDropdown
                onExportExcel={handleExportExcel}
                onExportPdf={handleExportPdf}
              />
            </div>
            {canImport && (
              <ImportGuestDialog
                eventId={activeEventId || ""}
                onSuccess={() => loadGuests(activeEventId || undefined, true)}
                disabled={isLimitReached && isFreePlan}
              />
            )}
            {canAdd && (
              <AddGuestDialog
                eventId={activeEventId || ""}
                onSuccess={() => loadGuests(activeEventId || undefined, true)}
                disabled={isLimitReached && isFreePlan}
              />
            )}
          </div>
        </div>

        <GuestList
          initialGuests={guests}
          activeEvent={activeEvent}
          onRefresh={() => loadGuests(activeEventId || undefined)}
        />
      </div>
    </PermissionGuard>
  );
}
