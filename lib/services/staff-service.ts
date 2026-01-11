import { createClient } from "@/lib/supabase/client";
import { EventStaff, StaffRole, Profile } from "@/lib/types";

export interface StaffService {
  getEventStaff: (eventId: string) => Promise<EventStaff[]>;
  addStaffByEmail: (
    eventId: string,
    email: string,
    role: StaffRole
  ) => Promise<EventStaff>;
  addStaffByRoleId: (
    eventId: string,
    email: string,
    roleId: string
  ) => Promise<EventStaff>;
  removeStaff: (staffId: string) => Promise<void>;
  getCurrentUserRole: (eventId: string) => Promise<StaffRole | null>;
}

export const supabaseStaffService: StaffService = {
  async getEventStaff(eventId) {
    const supabase = createClient() as any;
    const { data, error } = await supabase
      .from("event_staff")
      .select("*, profile:profiles(*), assigned_role:roles(*)")
      .eq("event_id", eventId);

    if (error) {
      console.error("Error fetching event staff:", error);
      return [];
    }
    return data as EventStaff[];
  },

  async addStaffByEmail(eventId, email, role) {
    const supabase = createClient() as any;

    // 1. Find profile by email
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email.toLowerCase())
      .limit(1);

    if (profileError) {
      console.error("Profile lookup error:", profileError);
      throw profileError;
    }

    const profile = profiles && profiles.length > 0 ? profiles[0] : null;

    if (!profile) {
      throw new Error(
        "No registered user found with this email. Please ensure the user has signed up for an account first."
      );
    }

    // 2. Check if user is the event owner
    const { data: eventData } = await supabase
      .from("events")
      .select("user_id")
      .eq("id", eventId)
      .limit(1);

    const event = eventData && eventData.length > 0 ? eventData[0] : null;

    if (event && event.user_id === profile.id) {
      throw new Error(
        "Cannot add the event owner as staff. The owner already has full access to this event."
      );
    }

    // 3. Add to event_staff
    const { data: insertedData, error: insertError } = await supabase
      .from("event_staff")
      .insert([
        {
          event_id: eventId,
          user_id: profile.id,
          role,
        },
      ])
      .select("*, profile:profiles(*)");

    if (insertError) {
      if (insertError.code === "23505") {
        throw new Error("This user is already a staff member for this event.");
      }
      console.error("Staff insert error:", insertError);
      throw insertError;
    }

    if (!insertedData || insertedData.length === 0) {
      throw new Error(
        "The staff member was added, but we couldn't retrieve their details. Please refresh the page to see them in the list."
      );
    }

    return insertedData[0] as EventStaff;
  },

  async addStaffByRoleId(eventId, email, roleId) {
    const supabase = createClient() as any;

    // 1. Find profile by email
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email.toLowerCase())
      .limit(1);

    if (profileError) {
      console.error("Profile lookup error:", profileError);
      throw profileError;
    }

    const profile = profiles && profiles.length > 0 ? profiles[0] : null;

    if (!profile) {
      throw new Error(
        "No registered user found with this email. Please ensure the user has signed up for an account first."
      );
    }

    // 2. Check if user is the event owner
    const { data: eventData } = await supabase
      .from("events")
      .select("user_id")
      .eq("id", eventId)
      .limit(1);

    const event = eventData && eventData.length > 0 ? eventData[0] : null;

    if (event && event.user_id === profile.id) {
      throw new Error(
        "Cannot add the event owner as staff. The owner already has full access to this event."
      );
    }

    // 3. Add to event_staff with role_id
    const { data: insertedData, error: insertError } = await supabase
      .from("event_staff")
      .insert([
        {
          event_id: eventId,
          user_id: profile.id,
          role_id: roleId,
        },
      ])
      .select("*, profile:profiles(*)");

    if (insertError) {
      if (insertError.code === "23505") {
        throw new Error("This user is already a staff member for this event.");
      }
      console.error("Staff insert error:", insertError);
      throw insertError;
    }

    if (!insertedData || insertedData.length === 0) {
      throw new Error(
        "The staff member was added, but we couldn't retrieve their details. Please refresh the page to see them in the list."
      );
    }

    return insertedData[0] as EventStaff;
  },

  async removeStaff(staffId) {
    const supabase = createClient() as any;
    const { error } = await supabase
      .from("event_staff")
      .delete()
      .eq("id", staffId);

    if (error) throw error;
  },

  async getCurrentUserRole(eventId) {
    const supabase = createClient() as any;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    // First check if owner
    const { data: events } = await supabase
      .from("events")
      .select("user_id")
      .eq("id", eventId)
      .limit(1);

    const event = events && events.length > 0 ? events[0] : null;
    if (event?.user_id === user.id) return "owner";

    // Then check staff table
    const { data: staffList } = await supabase
      .from("event_staff")
      .select("role")
      .eq("event_id", eventId)
      .eq("user_id", user.id)
      .limit(1);

    const staff = staffList && staffList.length > 0 ? staffList[0] : null;
    return staff?.role || null;
  },
};
