export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      guests: {
        Row: {
          id: string;
          name: string;
          slug: string;
          category: string;
          pax_count: number;
          status: "draft" | "sent" | "viewed" | "confirmed" | "declined";
          phone_number: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          category: string;
          pax_count: number;
          status?: "draft" | "sent" | "viewed" | "confirmed" | "declined";
          phone_number?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          category?: string;
          pax_count?: number;
          status?: "draft" | "sent" | "viewed" | "confirmed" | "declined";
          phone_number?: string | null;
          created_at?: string;
        };
      };
      tables: {
        Row: {
          id: string;
          name: string;
          shape: "round" | "rect";
          capacity: number;
          section: string;
          assigned_guest_ids: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          shape: "round" | "rect";
          capacity: number;
          section: string;
          assigned_guest_ids?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          shape?: "round" | "rect";
          capacity?: number;
          section?: string;
          assigned_guest_ids?: string[];
          created_at?: string;
        };
      };
      user_subscriptions: {
        Row: {
          user_id: string;
          plan_type: string;
          status: string;
          event_limit: number;
          events_used: number;
          current_period_start: string;
          current_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          plan_type?: string;
          status?: string;
          event_limit?: number;
          events_used?: number;
          current_period_start?: string;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          plan_type?: string;
          status?: string;
          event_limit?: number;
          events_used?: number;
          current_period_start?: string;
          current_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      payment_records: {
        Row: {
          id: string;
          user_id: string | null;
          external_id: string | null;
          amount: number;
          currency: string;
          status: string;
          plan_type: string | null;
          payment_method: string | null;
          checkout_link: string | null;
          failure_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          external_id?: string | null;
          amount: number;
          currency?: string;
          status?: string;
          plan_type?: string | null;
          payment_method?: string | null;
          checkout_link?: string | null;
          failure_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          external_id?: string | null;
          amount?: number;
          currency?: string;
          status?: string;
          plan_type?: string | null;
          payment_method?: string | null;
          checkout_link?: string | null;
          failure_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
