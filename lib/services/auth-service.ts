import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

let userPromise: Promise<{ data: { user: User | null } }> | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 5000; // Cache for 5 seconds

export const authService = {
  /**
   * Returns the current user, sharing a single promise for simultaneous calls.
   * Uses a short-lived cache to prevent excessive network requests during page load.
   */
  async getUser(): Promise<User | null> {
    const now = Date.now();

    // If we have a pending promise or a fresh cached result, return it
    if (userPromise && now - lastFetchTime < CACHE_DURATION) {
      const result = await userPromise;
      return result.data.user;
    }

    // Otherwise, create a new promise and fetch
    const supabase = createClient();
    userPromise = supabase.auth.getUser();
    lastFetchTime = now;

    try {
      const result = await userPromise;
      return result.data.user;
    } catch (error) {
      userPromise = null;
      lastFetchTime = 0;
      throw error;
    }
  },

  /**
   * Clears the cached user promise (e.g., on logout)
   */
  clearCache() {
    userPromise = null;
    lastFetchTime = 0;
  },
};
