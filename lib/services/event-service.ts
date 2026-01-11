import { createClient } from "@/lib/supabase/client";
import { Event, StaffRole } from "@/lib/types";
import { subscriptionService } from "./subscription-service";
import { supabaseNotificationService } from "./notification-service";

export interface EventWithRole extends Event {
  role: StaffRole | string; // Can be StaffRole or dynamic role name
  roleName?: string; // Dynamic role name from database
}

export interface EventService {
  getEvents: () => Promise<EventWithRole[]>;
  getEventById: (id: string) => Promise<Event | null>;
  getEventBySlug: (slug: string) => Promise<Event | null>;
  createEvent: (event: Omit<Event, "id" | "created_at">) => Promise<Event>;
  deleteEvent: (id: string) => Promise<void>;
}

export const supabaseEventService: EventService = {
  async getEvents() {
    const supabase = createClient() as any;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    // 1. Fetch owned events
    const { data: ownedEvents, error: ownedError } = await supabase
      .from("events")
      .select("*")
      .eq("user_id", user.id);

    if (ownedError) {
      console.error("Error fetching owned events:", ownedError);
    }

    const ownedWithRole = (ownedEvents || []).map((e: Event) => ({
      ...e,
      role: "owner" as StaffRole,
    }));

    // 2. Fetch staff events with role information
    const { data: staffAssignments, error: staffError } = await supabase
      .from("event_staff")
      .select("event_id, role, role_id, assigned_role:roles(id, name)")
      .eq("user_id", user.id);

    if (staffError) {
      console.error("Error fetching staff event roles:", staffError);
    }

    let staffEvents: EventWithRole[] = [];
    if (staffAssignments && staffAssignments.length > 0) {
      const eventIds = staffAssignments.map((s: any) => s.event_id);
      const { data: fetchStaffEvents, error: fetchError } = await supabase
        .from("events")
        .select("*")
        .in("id", eventIds);

      if (fetchError) {
        console.error("Error fetching staff events details:", fetchError);
      } else {
        staffEvents = (fetchStaffEvents || []).map((e: Event) => {
          const assignment = staffAssignments.find(
            (s: any) => s.event_id === e.id
          );
          return {
            ...e,
            role:
              assignment?.assigned_role?.name || assignment?.role || "staff",
            roleName: assignment?.assigned_role?.name,
          };
        });
      }
    }

    // 3. Merge and deduplicate
    const combined = [...ownedWithRole, ...staffEvents];
    const eventMap = new Map<string, EventWithRole>();

    combined.forEach((e: EventWithRole) => {
      const existing = eventMap.get(e.id);
      if (!existing || e.role === "owner") {
        eventMap.set(e.id, e);
      }
    });

    const uniqueEvents = Array.from(eventMap.values());

    // 4. Sort by date
    return uniqueEvents.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  },

  async getEventById(id: string) {
    const supabase = createClient() as any;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const query = supabase.from("events").select("*").eq("id", id);

    // Filter by user_id is removed to allow staff access (handled by RLS policies)

    const { data, error } = await query.maybeSingle();

    if (error) return null;
    return data as Event;
  },

  async getEventBySlug(slug: string) {
    const supabase = createClient() as any;
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) return null;
    return data as Event;
  },

  async createEvent(event) {
    const supabase = createClient() as any;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated");

    // Check subscription limits
    const { count: currentOwnedEvents, error: countError } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (countError) throw countError;

    // Get subscription details to know the limit
    // Get subscription details to know the plan type
    const { data: subscription } = await supabase
      .from("user_subscriptions")
      .select("plan_type")
      .eq("user_id", user.id)
      .single();

    // Default limit based on plan or free fallback
    const planType = subscription?.plan_type || "free";
    const limit = subscriptionService.getPlanLimits(planType as any).events;

    if ((currentOwnedEvents || 0) >= limit) {
      throw new Error(
        `You have reached your limit of ${limit} event(s). Please upgrade your plan to create more.`
      );
    }

    const { data, error } = await supabase
      .from("events")
      .insert([
        {
          ...event,
          user_id: user?.id,
        },
      ])
      .select()
      .maybeSingle();

    if (error) throw error;

    // Create notification
    if (data) {
      await supabaseNotificationService.createNotification({
        title: "Event Created! 🎉",
        message: `Your event "${data.name}" has been successfully created. You can now start adding guests and managing details.`,
        type: "info",
        link: "/dashboard",
      });
    }

    return data as Event;
  },

  async deleteEvent(id: string) {
    const supabase = createClient() as any;

    // 1. Check for guests
    const { count: guestCount, error: guestError } = await supabase
      .from("guests")
      .select("*", { count: "exact", head: true })
      .eq("event_id", id);

    if (guestError) throw guestError;
    if (guestCount && guestCount > 0) {
      throw new Error(
        "Cannot delete event: There are guests assigned to this event."
      );
    }

    // 2. Check for tables
    const { count: tableCount, error: tableError } = await supabase
      .from("tables")
      .select("*", { count: "exact", head: true })
      .eq("event_id", id);

    if (tableError) throw tableError;
    if (tableCount && tableCount > 0) {
      throw new Error(
        "Cannot delete event: There are tables assigned to this event."
      );
    }

    // 3. Delete event
    const { error: deleteError } = await supabase
      .from("events")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;
  },
};
