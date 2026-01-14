import { createClient } from "@/lib/supabase/client";
import { Guest, GuestLog } from "@/lib/types";
import { authService } from "./auth-service";
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
  searchGuests: (
    eventId: string,
    query: string,
    limit?: number
  ) => Promise<Guest[]>;
  getEventStats: (eventId: string) => Promise<{
    totalGuests: number;
    confirmedGuests: number;
    declinedGuests: number;
    attendedGuests: number;
    redeemedSouvenirs: number;
    pendingRSVP: number;
    totalPax: number;
    categoryBreakdown: { name: string; count: number; percentage: number }[];
    recentAttendedGuests: Guest[];
  }>;
}

export const supabaseGuestService: GuestService = {
  async getGuests(eventId) {
    const supabase = createClient() as any;
    const user = await authService.getUser();

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

      // Populate last_log for each guest
      return populateLastLogs(supabase, guests);
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

    return populateLastLogs(supabase, guests);
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

  async searchGuests(eventId, query, limit = 10) {
    const supabase = createClient() as any;

    let supabaseQuery = supabase
      .from("guests")
      .select("*")
      .eq("event_id", eventId)
      .or(`name.ilike.%${query}%,slug.ilike.%${query}%`)
      .order("name", { ascending: true })
      .limit(limit);

    const { data, error } = await supabaseQuery;

    if (error) {
      console.error("Error searching guests:", error);
      return [];
    }

    return populateLastLogs(supabase, data);
  },

  async getEventStats(eventId) {
    const supabase = createClient() as any;

    // Fetch all guests for this event
    // Note: We still fetch all guests but only necessary columns to keep it fast
    // and let the DB do the work if we were to use RPC, but for now we'll do it via query
    const { data: guests, error } = await supabase
      .from("guests")
      .select("status, category, pax_count, attended_pax, name, id")
      .eq("event_id", eventId);

    if (error) {
      console.error("Error fetching event stats:", error);
      throw error;
    }

    const totalGuests = guests.length;
    const confirmedGuests = guests.filter((g: any) =>
      ["confirmed", "attended", "souvenir_delivered"].includes(g.status)
    ).length;
    const declinedGuests = guests.filter(
      (g: any) => g.status === "declined"
    ).length;
    const attendedGuests = guests.filter((g: any) =>
      ["attended", "souvenir_delivered"].includes(g.status)
    ).length;

    // Calculate sum of units for redeemed souvenirs
    const redeemedSouvenirs = guests.reduce((sum: number, g: any) => {
      if (g.status === "souvenir_delivered") {
        return sum + (g.attended_pax || g.pax_count || 1);
      }
      return sum;
    }, 0);
    const pendingRSVP = guests.filter(
      (g: any) =>
        !["confirmed", "attended", "souvenir_delivered", "declined"].includes(
          g.status
        )
    ).length;
    const totalPax = guests.reduce(
      (sum: number, g: any) => sum + (g.pax_count || 0),
      0
    );

    // Category Breakdown
    const counts: Record<string, number> = {};
    guests.forEach((g: any) => {
      const cat = g.category || "other";
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const categoryBreakdown = Object.entries(counts)
      .map(([name, count]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        count,
        percentage:
          totalGuests > 0 ? Math.round((count / totalGuests) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Recent Attended (top 3)
    const recentAttendedGuests = guests
      .filter((g: any) => ["attended", "souvenir_delivered"].includes(g.status))
      .slice(0, 3);

    return {
      totalGuests,
      confirmedGuests,
      declinedGuests,
      attendedGuests,
      redeemedSouvenirs,
      pendingRSVP,
      totalPax,
      categoryBreakdown,
      recentAttendedGuests,
    };
  },
};

// Internal helper to fetch logs and profiles for guests
async function populateLastLogs(
  supabase: any,
  guests: any[]
): Promise<Guest[]> {
  if (!guests || guests.length === 0) return [];

  const guestIds = guests.map((g) => g.id);

  // 1. Fetch logs for these guests
  const { data: logs } = await supabase
    .from("guest_logs")
    .select("*")
    .in("guest_id", guestIds)
    .order("created_at", { ascending: false });

  if (!logs || logs.length === 0) return guests as Guest[];

  // 2. Fetch profiles for the staff in these logs
  const staffIds = Array.from(
    new Set(logs.map((l: any) => l.user_id).filter(Boolean))
  );
  let profiles: any[] = [];
  if (staffIds.length > 0) {
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", staffIds);
    profiles = profilesData || [];
  }

  // 3. Merge logs and profiles into guests
  return guests.map((guest: any) => {
    const guestLogs = logs.filter((l: any) => l.guest_id === guest.id);
    const lastLog = guestLogs[0];

    if (lastLog) {
      const profile = profiles.find((p) => p.id === lastLog.user_id);
      return {
        ...guest,
        last_log: {
          ...lastLog,
          profile: profile,
        },
      };
    }
    return guest;
  }) as Guest[];
}
