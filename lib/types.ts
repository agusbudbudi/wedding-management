export type GuestStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "confirmed"
  | "declined"
  | "attended"
  | "souvenir_delivered";
export type GuestCategory = "vip" | "family" | "colleague" | "friend" | "other";

export interface Guest {
  id: string;
  name: string;
  category: GuestCategory;
  slug: string;
  pax_count: number;
  phone_number?: string;
  status: GuestStatus;
  created_at?: string;
  updated_at?: string;
  wishes?: string;
  photo_url?: string;
  event_id?: string;
  user_id?: string;
  attended_pax?: number;
  last_log?: GuestLog;
}

export interface Event {
  id: string;
  name: string;
  type: string;
  date: string;
  location?: string;
  slug: string;
  created_at?: string;
  user_id?: string;
}

export interface Table {
  id: string;
  name: string;
  capacity: number;
  shape: string;
  assigned_guest_ids: string[];
  event_id?: string;
  user_id?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RSVP {
  id: string;
  guest_id: string;
  attending: boolean;
  pax_confirmed: number;
  wishes?: string;
  created_at?: string;
}

export interface CheckIn {
  id: string;
  guest_id: string;
  checkin_time: string;
  souvenir_taken: boolean;
}

export type InvitationTemplateType =
  | "wedding"
  | "corporate"
  | "khitanan"
  | "workshop";

export interface GiftInfoItem {
  id: string;
  type: "bank" | "ewallet";
  name: string;
  number: string;
  owner_name: string;
}

export interface WeddingMetadata {
  groom_name?: string;
  bride_name?: string;
  wedding_date?: string;
  wedding_location?: string;
  reception_date?: string;
  reception_location?: string;
  dress_code?: string;
  gift_info?: GiftInfoItem[];
  rsvp?: {
    is_active: boolean;
    guest_name_label: string;
    title: string;
    description: string;
    yes_option_label: string;
    yes_response_message: string;
    no_option_label: string;
    no_response_message: string;
    subtitle?: string;
    show_wishes_input?: boolean;
    wishes_input_title?: string;
  };
  seating_info?: {
    is_active: boolean;
    title: string;
    subtitle?: string;
    table_name_label?: string;
    table_shape_label?: string;
  };
  qr_invitation?: {
    is_active: boolean;
  };
  wishes_section?: {
    is_active: boolean;
    title: string;
    subtitle?: string;
  };
}

export type InvitationMetadata = WeddingMetadata | Record<string, any>;

export interface Invitation {
  id: string;
  event_id: string;
  user_id: string;
  template_type: InvitationTemplateType;
  title: string;
  content: string;
  metadata: InvitationMetadata;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}
export type StaffRole = "owner" | "check_in" | "seating";

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  updated_at?: string;
}

export interface EventStaff {
  id: string;
  event_id: string;
  user_id: string;
  role: StaffRole;
  role_id?: string; // New: reference to dynamic role
  assigned_role?: Role; // New: populated role object
  created_at?: string;
  profile?: Profile;
}

// RBAC Types
export interface Role {
  id: string;
  event_id: string;
  name: string;
  description?: string;
  is_system_role: boolean;
  created_by?: string;
  creator_profile?: Profile;
  created_at?: string;
  updated_at?: string;
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  display_name: string;
  description?: string;
  created_at?: string;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  created_at?: string;
}

export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

export interface GuestLog {
  id: string;
  guest_id: string;
  event_id: string;
  user_id: string | null;
  action: string;
  title: string;
  description: string;
  metadata?: any;
  created_at: string;
  // Optional: populated information
  profile?: Profile;
  guest?: Guest;
}

export type NotificationType = "info" | "promo" | "transaction";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  link?: string;
  metadata?: any;
  created_at: string;
}
