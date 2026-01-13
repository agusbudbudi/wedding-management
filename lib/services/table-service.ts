import { createClient } from "@/lib/supabase/client";
import { Table } from "@/lib/types";

export interface TableService {
  getTables: (eventId?: string) => Promise<Table[]>;
  createTable: (
    table: Omit<Table, "id" | "assigned_guest_ids"> & { event_id: string }
  ) => Promise<Table>;
  updateTable: (id: string, updates: Partial<Table>) => Promise<Table>;
  assignGuestToTable: (tableId: string, guestId: string) => Promise<boolean>;
  deleteTable: (id: string) => Promise<void>;
}

export const supabaseTableService: TableService = {
  async getTables(eventId) {
    const supabase = createClient() as any;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let query = supabase.from("tables").select("*");

    if (user) {
      query = query.eq("user_id", user.id);
    }

    if (eventId) {
      query = query.eq("event_id", eventId);
    }

    // Sort by updated_at desc, then created_at desc
    query = query
      .order("updated_at", { ascending: false })
      .order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching tables:", error);
      return [];
    }

    // Map Supabase 'rectangular' to mock-data 'rect' if necessary,
    // but the schema says 'round', 'rect'. The mock-data interface says 'rectangular'.
    // Let's stick to the schema values for consistency.
    return data as Table[];
  },

  async createTable(table) {
    const supabase = createClient() as any;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("tables")
      .insert([
        {
          ...table,
          user_id: user?.id,
          created_at: now,
          updated_at: now,
        },
      ])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as Table;
  },

  async updateTable(id, updates) {
    const supabase = createClient() as any;

    const { data, error } = await supabase
      .from("tables")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Table;
  },

  async assignGuestToTable(tableId, guestId) {
    const supabase = createClient() as any;

    // This is more complex because we need to remove guest from ALL tables first
    // In Supabase, we can't easily do "remove from all arrays" in one go safely without a function
    // For now, let's fetch all tables, update them locally, and save.
    // Better: use a Supabase function (RPC) for this atomic operation.

    try {
      const { data: allTables } = await supabase.from("tables").select("*");

      if (!allTables) return false;

      const updates = allTables.map((t: any) => {
        const newIds = t.assigned_guest_ids.filter(
          (id: string) => id !== guestId
        );
        if (t.id === tableId) {
          newIds.push(guestId);
        }
        return { ...t, assigned_guest_ids: newIds };
      });

      // Bulk update (Supabase allows this)
      const { error } = await supabase.from("tables").upsert(updates);

      return !error;
    } catch (err) {
      console.error("Failed to assign guest to table", err);
      return false;
    }
  },

  async deleteTable(id: string) {
    const supabase = createClient() as any;

    // 1. Fetch the table to check for assigned guests
    const { data: table, error: fetchError } = await supabase
      .from("tables")
      .select("assigned_guest_ids")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (table.assigned_guest_ids && table.assigned_guest_ids.length > 0) {
      throw new Error(
        "Cannot delete table: There are guests assigned to this table."
      );
    }

    // 2. Delete the table
    const { error: deleteError } = await supabase
      .from("tables")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;
  },
};
