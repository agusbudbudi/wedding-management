import { createClient } from "@/lib/supabase/client";
import { GuestLog } from "@/lib/types";

export const logService = {
  async recordLog(params: {
    guestId: string;
    eventId: string;
    action: string;
    title: string;
    description: string;
    metadata?: any;
  }) {
    const supabase = createClient() as any;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let staffIdentifier = user?.email || "System";

    if (user) {
      // 1. Try metadata first (fastest)
      const meta = user.user_metadata || {};
      const nameFromMeta = meta.full_name || meta.name || meta.display_name;
      const userEmail = user.email;

      if (nameFromMeta) {
        staffIdentifier = userEmail
          ? `${nameFromMeta} (${userEmail})`
          : (nameFromMeta as string);
      } else {
        // 2. Try profiles table
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", user.id)
          .maybeSingle();

        const name = profile?.full_name;
        const email = profile?.email || userEmail;

        if (name) {
          staffIdentifier = email ? `${name} (${email})` : name;
        } else if (email) {
          staffIdentifier = email;
        }
      }
    }

    // Safety: ensure staffIdentifier doesn't contain placeholders themselves
    if (!staffIdentifier || staffIdentifier.includes("[staff]")) {
      staffIdentifier = user?.email || "System";
    }

    // Use replaceAll to be safe and handle both [staff] and [staff name]
    let description = params.description.replaceAll("[staff]", staffIdentifier);
    description = description.replaceAll("[staff name]", staffIdentifier);

    const { error } = await supabase.from("guest_logs").insert([
      {
        guest_id: params.guestId,
        event_id: params.eventId,
        user_id: user?.id,
        action: params.action,
        title: params.title,
        description: description,
        metadata: params.metadata || {},
      },
    ]);

    if (error) {
      console.error("Error recording log:", error.message, error);
    }
  },

  async getLogsByEventId(
    eventId: string,
    limit: number = 10
  ): Promise<GuestLog[]> {
    const supabase = createClient() as any;

    // 1. Fetch logs
    const { data: logs, error: logsError } = await supabase
      .from("guest_logs")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (logsError) {
      console.error("Error fetching event logs:", logsError.message);
      return [];
    }

    if (!logs || logs.length === 0) return [];

    // 2. Fetch profiles and guests for these logs
    const userIds = Array.from(
      new Set(logs.map((l: any) => l.user_id).filter(Boolean))
    );
    const guestIds = Array.from(
      new Set(logs.map((l: any) => l.guest_id).filter(Boolean))
    );

    let profiles: any[] = [];
    let guests: any[] = [];

    const fetchPromises = [];

    if (userIds.length > 0) {
      fetchPromises.push(
        supabase
          .from("profiles")
          .select("*")
          .in("id", userIds)
          .then(({ data }: any) => (profiles = data || []))
      );
    }

    if (guestIds.length > 0) {
      fetchPromises.push(
        supabase
          .from("guests")
          .select("*")
          .in("id", guestIds)
          .then(({ data }: any) => (guests = data || []))
      );
    }

    await Promise.all(fetchPromises);

    // 3. Manually join
    return logs.map((log: any) => ({
      ...log,
      profile: profiles.find((p) => p.id === log.user_id),
      guest: guests.find((g) => g.id === log.guest_id),
    })) as GuestLog[];
  },

  async getLogsByGuestId(guestId: string): Promise<GuestLog[]> {
    const supabase = createClient() as any;

    const { data, error } = await supabase
      .from("guest_logs")
      .select("*")
      .eq("guest_id", guestId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(
        "Error fetching guest logs:",
        error.message,
        error.details,
        error.hint
      );
      return [];
    }

    return data as GuestLog[];
  },
};
