"use client";

import { useState, useEffect } from "react";
import {
  supabaseEventService,
  EventWithRole,
} from "@/lib/services/event-service";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ArrowRight,
  Trash2,
  Shield,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { AddEventDialog } from "@/components/features/add-event-dialog";
import { createClient } from "@/lib/supabase/client";
import {
  subscriptionService,
  UserSubscription,
} from "@/lib/services/subscription-service";

export default function EventsPage() {
  const [events, setEvents] = useState<EventWithRole[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadData();
    const stored = localStorage.getItem("active_event_id");
    if (stored) setActiveEventId(stored);
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [eventsData, subData] = await Promise.all([
        supabaseEventService.getEvents(),
        subscriptionService.getSubscription(supabase),
      ]);

      setEvents(eventsData);
      setSubscription(subData);

      if (eventsData.length > 0 && !localStorage.getItem("active_event_id")) {
        handleSetActive(eventsData[0].id);
      }
    } catch (error) {
      console.error("Error loading events data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadEvents() {
    try {
      const data = await supabaseEventService.getEvents();
      setEvents(data);
    } catch (error) {
      console.error("Error loading events:", error);
    }
  }

  async function handleDelete(id: string) {
    try {
      setIsDeleting(true);
      setDeleteError(null);
      await supabaseEventService.deleteEvent(id);
      toast.success("Event deleted successfully");
      loadEvents();
      if (activeEventId === id) {
        localStorage.removeItem("active_event_id");
        setActiveEventId(null);
        window.dispatchEvent(new Event("active-event-changed"));
      }
      setDeleteConfirmId(null);
    } catch (error: any) {
      setDeleteError(error.message || "Failed to delete event");
    } finally {
      setIsDeleting(false);
    }
  }

  function handleSetActive(id: string) {
    setActiveEventId(id);
    localStorage.setItem("active_event_id", id);
    // Dispatch custom event to notify usePermissions hook in other components
    window.dispatchEvent(new Event("active-event-changed"));
    router.refresh();
  }

  const ownedEventsCount = events.filter((e) => e.role === "owner").length;
  const eventLimit = subscription?.event_limit || 1;
  const isFreePlan = (subscription?.plan_type || "free") === "free";
  const isLimitReached = ownedEventsCount >= eventLimit;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Events Management
            </h1>
            <p className="text-gray-500 mt-1">
              Select or create an event to manage. Role-based access will apply
              automatically.
            </p>
          </div>
          <AddEventDialog
            onSuccess={loadData}
            disabled={isLimitReached}
            disabledMessage={`Your ${
              subscription?.plan_type || "free"
            } plan is limited to owning ${eventLimit} event(s). Upgrade to create more.`}
          />
        </div>

        {isFreePlan && (
          <div className="bg-blue-50 border border-blue-100 p-3 rounded-[1.5rem] flex items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-500">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 p-2.5 rounded-xl">
                <Zap className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <h3 className="font-bold text-blue-900">Free Plan Active</h3>
                <p className="text-blue-700/70 text-sm font-medium">
                  You are currently using the Free Plan. You can{" "}
                  <span className="font-bold text-blue-800">own 1 event</span>.
                  Joining events as staff is unlimited.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="bg-white border-blue-200 text-blue-600 hover:bg-blue-50 font-bold rounded-xl"
              onClick={() => router.push("/dashboard/subscription")}
            >
              Upgrade to Pro
            </Button>
          </div>
        )}

        {!isFreePlan && (
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-[1.5rem] flex items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-500">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-600 p-2.5 rounded-xl">
                <Shield className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <h3 className="font-bold text-emerald-900">
                  {subscription?.plan_type?.toUpperCase()} Plan Active
                </h3>
                <p className="text-emerald-700/70 text-sm font-medium">
                  You have access to{" "}
                  <span className="font-bold text-emerald-800">
                    {eventLimit} events
                  </span>
                  . Currently using {ownedEventsCount} of {eventLimit}.
                </p>
              </div>
            </div>
            {subscription?.plan_type === "pro" && (
              <Button
                variant="outline"
                className="bg-white border-emerald-200 text-emerald-600 hover:bg-emerald-50 font-bold rounded-xl"
                onClick={() => router.push("/dashboard/subscription")}
              >
                View Plans
              </Button>
            )}
          </div>
        )}
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-gray-100 animate-in fade-in zoom-in duration-700">
          <div className="bg-blue-50 p-6 rounded-full mb-6">
            <Calendar className="w-12 h-12 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Events Found
          </h2>
          <p className="text-gray-500 mb-8 text-center max-w-sm">
            You don't have any events yet. Start by creating your first wedding
            or event, or wait to be added as a staff member.
          </p>
          <AddEventDialog
            onSuccess={loadData}
            disabled={isLimitReached}
            disabledMessage={`Your ${
              subscription?.plan_type || "free"
            } plan is limited to owning ${eventLimit} event(s). Upgrade to create more.`}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card
              key={event.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-xl rounded-[1.5rem] border-2 group overflow-hidden ${
                activeEventId === event.id
                  ? "border-primary shadow-lg ring-4 ring-blue-50"
                  : "border-gray-100 hover:border-blue-200"
              }`}
              onClick={() => handleSetActive(event.id)}
            >
              <CardHeader className="space-y-1 pb-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-bold truncate max-w-[150px]">
                      {event.name}
                    </CardTitle>
                  </div>
                  {activeEventId === event.id && (
                    <div className="bg-green-50 text-green-600 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Active
                    </div>
                  )}
                </div>
                <CardDescription className="flex items-center justify-between gap-2 text-xs">
                  <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                    {event.slug}
                  </span>
                  {event.role === "owner" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmId(event.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4 text-primary/60" />
                    {new Date(event.date).toLocaleDateString("en-US", {
                      dateStyle: "full",
                    })}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="w-4 h-4 text-primary/60" />
                    <span className="truncate">
                      {event.location || "No location set"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-primary/60" />
                    <span
                      className={`font-semibold ${
                        event.role === "owner"
                          ? "text-blue-600"
                          : "text-purple-600"
                      }`}
                    >
                      {event.role === "owner"
                        ? "Owner"
                        : event.roleName || "Staff"}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant={activeEventId === event.id ? "default" : "outline"}
                    className="w-full rounded-xl gap-2 font-bold transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetActive(event.id);
                      router.push("/dashboard");
                    }}
                  >
                    Manage Event
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteConfirmId(null);
            setDeleteError(null);
          }
        }}
      >
        <DialogContent className="max-w-md rounded-[2rem] border-none shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Delete Event?
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-gray-500">
              Are you sure you want to delete this event? This action cannot be
              undone and all associated data will be permanently removed.
            </p>

            {deleteError && (
              <div className="flex gap-2 p-3 rounded-2xl bg-red-50 border border-red-100 text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold leading-relaxed">
                  {deleteError}
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteConfirmId(null);
                setDeleteError(null);
              }}
              className="rounded-xl font-bold"
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="rounded-xl font-bold shadow-lg shadow-red-100"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Event"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
