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
          attended_pax: number | null;
          status:
            | "draft"
            | "sent"
            | "viewed"
            | "confirmed"
            | "declined"
            | "attended"
            | "souvenir_delivered";
          phone_number: string | null;
          created_at: string;
          souvenir_id: string | null;
          souvenir_redeemed_at: string | null;
          event_id: string | null;
          user_id: string | null;
          wishes: string | null;
          photo_url: string | null;
          table_id: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          category: string;
          pax_count: number;
          attended_pax?: number | null;
          status?:
            | "draft"
            | "sent"
            | "viewed"
            | "confirmed"
            | "declined"
            | "attended"
            | "souvenir_delivered";
          phone_number?: string | null;
          created_at?: string;
          souvenir_id?: string | null;
          souvenir_redeemed_at?: string | null;
          event_id?: string | null;
          user_id?: string | null;
          wishes?: string | null;
          photo_url?: string | null;
          table_id?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          category?: string;
          pax_count?: number;
          attended_pax?: number | null;
          status?:
            | "draft"
            | "sent"
            | "viewed"
            | "confirmed"
            | "declined"
            | "attended"
            | "souvenir_delivered";
          phone_number?: string | null;
          created_at?: string;
          souvenir_id?: string | null;
          souvenir_redeemed_at?: string | null;
          event_id?: string | null;
          user_id?: string | null;
          wishes?: string | null;
          photo_url?: string | null;
          table_id?: string | null;
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
      souvenirs: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          description: string | null;
          stock: number;
          icon: string;
          color: string;
          category_restrictions: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          description?: string | null;
          stock: number;
          icon: string;
          color: string;
          category_restrictions?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          name?: string;
          description?: string | null;
          stock?: number;
          icon?: string;
          color?: string;
          category_restrictions?: string[] | null;
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
    Views: {
      [_ in never]: never;
    };
    Functions: {
      redeem_souvenir: {
        Args: {
          p_guest_id: string;
          p_souvenir_id: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
