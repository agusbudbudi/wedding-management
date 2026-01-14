import { createClient } from "@/lib/supabase/client";
import {
  Souvenir,
  CreateSouvenirParams,
  UpdateSouvenirParams,
} from "@/lib/types/souvenir";

export const souvenirService = {
  /**
   * Get all souvenirs for an event
   */
  async getSouvenirs(eventId: string): Promise<Souvenir[]> {
    const supabase = createClient() as any;
    const { data, error } = await supabase
      .from("souvenirs")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Create a new souvenir
   */
  async createSouvenir(params: CreateSouvenirParams): Promise<Souvenir> {
    const supabase = createClient() as any;
    const { data, error } = await supabase
      .from("souvenirs")
      .insert(params)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a souvenir
   */
  async updateSouvenir(
    id: string,
    params: UpdateSouvenirParams
  ): Promise<Souvenir> {
    const supabase = createClient() as any;
    const { data, error } = await supabase
      .from("souvenirs")
      .update(params)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a souvenir
   */
  async deleteSouvenir(id: string): Promise<void> {
    const supabase = createClient() as any;
    const { error } = await supabase.from("souvenirs").delete().eq("id", id);
    if (error) throw error;
  },

  /**
   * Redeem a souvenir for a guest
   * Uses the Postgres function 'redeem_souvenir' which handles stock deduction logic
   */
  async redeemSouvenir(guestId: string, souvenirId: string): Promise<void> {
    const supabase = createClient() as any;
    const { error } = await supabase.rpc("redeem_souvenir", {
      p_guest_id: guestId,
      p_souvenir_id: souvenirId,
    });

    if (error) throw error;
  },

  /**
   * Get redemption counts for all souvenirs in an event
   */
  async getSouvenirRedemptionCounts(
    eventId: string
  ): Promise<Record<string, number>> {
    const supabase = createClient() as any;
    // We only need the souvenir_id from guests who have redeemed one
    const { data, error } = await supabase
      .from("guests")
      .select("souvenir_id, attended_pax, pax_count")
      .eq("event_id", eventId)
      .not("souvenir_id", "is", null);

    if (error) throw error;

    // Aggregate counts (total units given out)
    const counts: Record<string, number> = {};
    data?.forEach((guest: any) => {
      if (guest.souvenir_id) {
        const units = guest.attended_pax || guest.pax_count || 1;
        counts[guest.souvenir_id] = (counts[guest.souvenir_id] || 0) + units;
      }
    });

    return counts;
  },

  /**
   * Get all guests who have redeemed souvenirs for an event
   */
  async getRedeemedGuests(eventId: string): Promise<any[]> {
    const supabase = createClient() as any;

    // 1. Fetch guests who have redeemed souvenirs
    const { data: guests, error } = await supabase
      .from("guests")
      .select(
        `
        id,
        name,
        category,
        souvenir_id,
        souvenir_redeemed_at,
        souvenir_redeemed_quantity,
        status,
        souvenirs:souvenir_id (
          name,
          icon,
          color
        )
      `
      )
      .eq("event_id", eventId)
      .eq("status", "souvenir_delivered")
      .order("souvenir_redeemed_at", { ascending: false });

    if (error) throw error;
    if (!guests || guests.length === 0) return [];

    // 2. Fetch redemption logs ('souvenir_delivered' or containing 'souvenir')
    const guestIds = guests.map((g: any) => g.id);
    const { data: logs, error: logsError } = await supabase
      .from("guest_logs")
      .select("guest_id, description, created_at, user_id, action")
      .in("guest_id", guestIds)
      .or("action.eq.souvenir_delivered,title.ilike.%souvenir%")
      .order("created_at", { ascending: false });

    if (logsError) {
      console.error("Redemption logs error:", logsError.message || logsError);
    }

    // 3. Fetch profiles for staff names if logs present
    let profiles: any[] = [];
    if (logs && logs.length > 0) {
      const staffIds = Array.from(
        new Set(logs.map((l: any) => l.user_id).filter(Boolean))
      );
      if (staffIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", staffIds);
        profiles = profilesData || [];
      }
    }

    // 4. Map logs and profiles to guests (take the most recent log for each guest)
    return guests.map((guest: any) => {
      const redemptionLog = logs?.find((l: any) => l.guest_id === guest.id);
      const profile = profiles.find((p) => p.id === redemptionLog?.user_id);

      // Extract staff name
      let redeemedBy = profile?.full_name || "System";

      if (!profile?.full_name && redemptionLog) {
        // Fallback parsing from description "... successfully redeemed souvenir by Staff Name"
        const desc = redemptionLog.description || "";
        if (desc.includes(" by ")) {
          const parts = desc.split(" by ");
          let namePart = parts[parts.length - 1];
          // Clean up if there is an email in parens
          if (namePart.includes(" (")) {
            namePart = namePart.split(" (")[0];
          }
          namePart = namePart.trim();

          // Only use if it's not a placeholder
          if (
            namePart &&
            namePart !== "[staff]" &&
            namePart !== "[staff name]"
          ) {
            redeemedBy = namePart;
          }
        }
      }

      return {
        ...guest,
        souvenir_name: guest.souvenirs?.name || "Unknown Souvenir",
        souvenir_icon: guest.souvenirs?.icon || "Gift",
        souvenir_color: guest.souvenirs?.color || "text-purple-500",
        redeemed_by_name: redeemedBy,
        redemption_log: redemptionLog,
      };
    });
  },
};
