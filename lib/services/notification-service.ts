import { createClient } from "@/lib/supabase/client";
import { Notification } from "@/lib/types";

export interface NotificationService {
  getNotifications: () => Promise<Notification[]>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  createNotification: (
    data: Omit<Notification, "id" | "is_read" | "created_at" | "user_id">
  ) => Promise<Notification | null>;
  deleteNotification: (id: string) => Promise<void>;
}

export const supabaseNotificationService: NotificationService = {
  async getNotifications() {
    const supabase = createClient() as any;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }

    return data as Notification[];
  },

  async markAsRead(id) {
    const supabase = createClient() as any;
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (error) throw error;
  },

  async markAllAsRead() {
    const supabase = createClient() as any;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error) throw error;
  },

  async createNotification(data) {
    const supabase = createClient() as any;

    // Use getSession for faster check first
    const {
      data: { session },
    } = await supabase.auth.getSession();
    let userId = session?.user?.id;

    if (!userId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id;
    }

    if (!userId) {
      console.error("No authenticated user found for notification creation");
      return null;
    }

    const { data: result, error } = await supabase
      .from("notifications")
      .insert([
        {
          ...data,
          user_id: userId,
          is_read: false,
        },
      ])
      .select()
      .maybeSingle();

    if (error) {
      console.error("Supabase error creating notification:", error);
      throw error;
    }

    return result as Notification;
  },

  async deleteNotification(id) {
    const supabase = createClient() as any;
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};
