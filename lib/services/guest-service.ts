import { createClient } from "@/lib/supabase/client";
import { Guest } from "@/lib/types";
import { logService } from "./log-service";

export interface GuestService {
  getGuests: (eventId?: string) => Promise<Guest[]>;
  getGuestBySlug: (slug: string) => Promise<Guest | null>;
  getGuestById: (id: string) => Promise<Guest | null>;
  createGuest: (
    guest: Omit<Guest, "id" | "status" | "created_at">,
    options?: { action?: string; description?: string }
  ) => Promise<Guest>;
  updateGuestStatus: (
    id: string,
    status: Guest["status"],
    wishes?: string,
    attendedPax?: number
  ) => Promise<void>;
  updateGuest: (
    id: string,
    data: Partial<Guest & { wishes?: string; updated_at?: string }>
  ) => Promise<void>;
  deleteGuest: (id: string) => Promise<void>;
}

export const supabaseGuestService: GuestService = {
  async getGuests(eventId) {
    const supabase = createClient() as any;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    // If eventId is provided, check if user has access to this event
    if (eventId) {
      // Check if user is owner or staff of this event
      const { data: eventAccess } = await supabase
        .from("events")
        .select("id")
        .eq("id", eventId)
        .eq("user_id", user.id)
        .limit(1);

      const isOwner = eventAccess && eventAccess.length > 0;

      if (!isOwner) {
        // Check if user is staff for this event
        const { data: staffAccess } = await supabase
          .from("event_staff")
          .select("id")
          .eq("event_id", eventId)
          .eq("user_id", user.id)
          .limit(1);

        const isStaff = staffAccess && staffAccess.length > 0;

        if (!isStaff) {
          // User has no access to this event
          return [];
        }
      }

      // User has access, fetch guests for this event
      const { data: guests, error } = await supabase
        .from("guests")
        .select("*")
        .eq("event_id", eventId)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error fetching guests:", error);
        return [];
      }

      // Try to fetch latest logs for all these guests
      const guestIds = guests.map((g: any) => g.id);
      if (guestIds.length > 0) {
        const { data: logs } = await supabase
          .from("guest_logs")
          .select("*")
          .in("guest_id", guestIds)
          .order("created_at", { ascending: false })
          .limit(2000);

        if (logs) {
          return guests.map((guest: any) => {
            const lastLog = logs.find((l: any) => l.guest_id === guest.id);
            return { ...guest, last_log: lastLog };
          }) as Guest[];
        }
      }

      return guests as Guest[];
    }

    // No eventId provided, fetch all guests user has access to (via RLS)
    const { data: guests, error } = await supabase
      .from("guests")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching guests:", error);
      return [];
    }

    // Try to fetch latest logs for all these guests
    const guestIds = guests.map((g: any) => g.id);
    if (guestIds.length > 0) {
      // Fetch more logs to ensure we don't miss the latest one for each guest
      const { data: logs } = await supabase
        .from("guest_logs")
        .select("*")
        .in("guest_id", guestIds)
        .order("created_at", { ascending: false })
        .limit(2000);

      if (logs) {
        return guests.map((guest: any) => {
          const lastLog = logs.find((l: any) => l.guest_id === guest.id);
          return { ...guest, last_log: lastLog };
        }) as Guest[];
      }
    }

    return guests as Guest[];
  },

  async getGuestBySlug(slug: string) {
    const supabase = createClient() as any;
    const { data, error } = await supabase
      .from("guests")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) return null;
    return data as Guest;
  },

  async getGuestById(id: string) {
    const supabase = createClient() as any;
    const { data, error } = await supabase
      .from("guests")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) return null;
    return data as Guest;
  },

  async createGuest(guest, options) {
    const supabase = createClient() as any;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("guests")
      .insert([
        {
          name: guest.name,
          slug: guest.slug,
          category: guest.category,
          pax_count: guest.pax_count,
          phone_number: guest.phone_number,
          event_id: guest.event_id,
          user_id: user?.id,
        } as any,
      ])
      .select()
      .maybeSingle();

    if (error) throw error;
    const result = data as Guest;

    // Record creation log
    if (result) {
      const isImport = options?.action === "import";
      await logService.recordLog({
        guestId: result.id,
        eventId: result.event_id || "",
        action: options?.action || "create",
        title: isImport ? "Guest Imported" : "Guest Created",
        description:
          options?.description ||
          (isImport
            ? `Guest imported to the list`
            : `Guest added to the list by [staff]`),
      });
    }

    return result;
  },

  async updateGuestStatus(id, status, wishes, attendedPax) {
    const supabase = createClient() as any;
    const updateData: any = { status };
    if (wishes !== undefined) updateData.wishes = wishes;
    if (attendedPax !== undefined) updateData.attended_pax = attendedPax;

    const { data: updatedGuest, error } = await supabase
      .from("guests")
      .update(updateData)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;

    // Fetch guest detail to get event_id and name
    if (updatedGuest) {
      let title = "Status Updated";
      let desc = `Status changed to ${status} by [staff]`;

      if (status === "attended") {
        title = "Guest Check-in";
        desc = `${updatedGuest.name} successfully checked in by [staff]`;
        if (attendedPax !== undefined) {
          desc += `. Attended pax: ${attendedPax}`;
        }
      } else if (status === "souvenir_delivered") {
        title = "Souvenir Redeemed";
        desc = `${updatedGuest.name} successfully redeemed souvenir by [staff]`;
      } else if (status === "confirmed" || status === "declined") {
        title = "RSVP Updated";
        desc = `Guest RSVP set to ${status} by ${updatedGuest.name}`;
      }

      await logService.recordLog({
        guestId: id,
        eventId: updatedGuest.event_id || "",
        action: status,
        title: title,
        description: desc,
      });
    }
  },

  async updateGuest(id, data) {
    const supabase = createClient() as any;
    const { data: updatedGuest, error } = await supabase
      .from("guests")
      .update(data)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) throw error;

    // Record update log
    if (updatedGuest) {
      await logService.recordLog({
        guestId: id,
        eventId: updatedGuest.event_id || "",
        action: "update",
        title: "Guest Updated",
        description: `Guest details updated by [staff]`,
      });
    }
  },

  async deleteGuest(id) {
    const supabase = createClient() as any;
    const { error } = await supabase.from("guests").delete().eq("id", id);
    if (error) throw error;
  },
};
