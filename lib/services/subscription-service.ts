import { SupabaseClient } from "@supabase/supabase-js";

export type PlanType = "free" | "pro" | "enterprise";

export interface UserSubscription {
  user_id: string;
  plan_type: PlanType;
  status: string;
  event_limit: number;
  events_used: number;
  current_period_start: string;
  current_period_end: string | null;
}

export const subscriptionService = {
  async getSubscription(
    supabase: SupabaseClient
  ): Promise<UserSubscription | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching subscription:", error);
      return null;
    }

    return data as UserSubscription;
  },

  async canCreateEvent(supabase: SupabaseClient): Promise<boolean> {
    const sub = await this.getSubscription(supabase);
    if (!sub) return false;
    return sub.events_used < sub.event_limit;
  },

  getPlanLimits(plan: PlanType) {
    const limits = {
      free: { events: 2, guests: 30 },
      pro: { events: 3, guests: 500 },
      enterprise: { events: 9999, guests: 9999 },
    };
    return limits[plan as keyof typeof limits] || limits.free;
  },
};
