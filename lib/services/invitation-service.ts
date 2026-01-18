import { createClient } from "@/lib/supabase/client";
import { Invitation, InvitationTemplateType } from "@/lib/types";

export interface InvitationService {
  getInvitationByEventId: (
    eventId: string,
    supabaseClient?: any,
  ) => Promise<Invitation | null>;
  upsertInvitation: (
    invitation: Omit<Invitation, "id" | "created_at" | "updated_at">,
    supabaseClient?: any,
  ) => Promise<Invitation>;
  getTemplates: () => Record<
    InvitationTemplateType,
    { title: string; content: string; metadata: any }
  >;
}

export const supabaseInvitationService: InvitationService = {
  async getInvitationByEventId(eventId: string, supabaseClient?: any) {
    const supabase = supabaseClient || (createClient() as any);
    const { data, error } = await supabase
      .from("invitations")
      .select("*")
      .eq("event_id", eventId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching invitation:", error);
      return null;
    }
    return data as Invitation;
  },

  async upsertInvitation(
    invitation: Omit<Invitation, "id" | "created_at" | "updated_at">,
    supabaseClient?: any,
  ) {
    const supabase = supabaseClient || (createClient() as any);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("invitations")
      .upsert(
        {
          ...invitation,
          user_id: user?.id,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "event_id",
        },
      )
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as Invitation;
  },

  getTemplates() {
    return {
      wedding: {
        title: "The Wedding of [Groom] & [Bride]",
        content:
          "With joyful hearts, we request the honor of your presence at the wedding ceremony and celebration of our love.",
        metadata: {
          groom_name: "",
          bride_name: "",
          wedding_date: "",
          wedding_location: "",
          reception_date: "",
          reception_location: "",
          dress_code: "Formal / Batik",
          gift_info: [],
          rsvp: {
            is_active: true,
            guest_name_label: "Tamu Undangan",
            title: "Konfirmasi Kehadiran",
            description:
              "Merupakan suatu kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir pada acara kami.",
            yes_option_label: "Ya, saya akan hadir",
            yes_response_message: "Sudah tidak sabar!",
            no_option_label: "Maaf, saya tidak bisa hadir",
            no_response_message: "Doa terbaik untuk mempelai",
            subtitle: "Mohon konfirmasi kehadiran Anda di bawah ini",
            wishes_input_title: "Ucapan & Doa",
          },
          seating_info: {
            is_active: false,
            title: "Informasi Tempat Duduk",
            subtitle: "Silakan menempati meja yang telah disediakan",
            table_name_label: "Nama Meja",
            table_shape_label: "Bentuk Meja",
          },
          qr_invitation: {
            is_active: true,
          },
          wishes_section: {
            is_active: true,
            title: "Ucapan & Doa",
            subtitle: "Kiriman hangat dari para sahabat",
          },
        },
      },
      corporate: {
        title: "Annual Corporate Gathering",
        content:
          "Join us for our annual corporate gathering at [Location] on [Date]. Let's celebrate our achievements and look forward to a successful year ahead.",
        metadata: {
          rsvp: {
            is_active: true,
            guest_name_label: "Guest Name",
            title: "RSVP Confirmation",
            description:
              "We would be honored to have your presence at our event.",
            yes_option_label: "Yes, I will attend",
            yes_response_message: "See you there!",
            no_option_label: "No, I cannot attend",
            no_response_message: "Thank you for letting us know",
            subtitle: "Please confirm your attendance below",
            show_wishes_input: false,
            wishes_input_title: "Wishes & Messages",
          },
          qr_invitation: { is_active: true },
          wishes_section: {
            is_active: false,
            title: "Wishes",
            subtitle: "Warm messages from everyone",
          },
        },
      },
      khitanan: {
        title: "Khitanan Celebration",
        content:
          "Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara khitanan putra kami yang akan dilaksanakan pada [Tanggal] di [Lokasi].",
        metadata: {
          rsvp: {
            is_active: true,
            guest_name_label: "Tamu Undangan",
            title: "Konfirmasi Kehadiran",
            description: "Kehadiran Anda adalah doa restu bagi kami.",
            yes_option_label: "Ya, saya akan hadir",
            yes_response_message: "Alhamdulillah!",
            no_option_label: "Maaf, saya tidak bisa hadir",
            no_response_message: "Mohon doa restunya",
            subtitle: "Mohon konfirmasi kehadiran Anda",
            show_wishes_input: true,
            wishes_input_title: "Doa Restu",
          },
          qr_invitation: { is_active: true },
          wishes_section: {
            is_active: true,
            title: "Doa Restu",
            subtitle: "Kiriman hangat untuk keluarga",
          },
        },
      },
      workshop: {
        title: "Skill Up Workshop",
        content:
          "Elevate your expertise! Join our upcoming workshop on [Topic] at [Location] on [Date]. Gain valuable insights and network with industry professionals.",
        metadata: {
          rsvp: {
            is_active: true,
            guest_name_label: "Participant",
            title: "Registration Confirmation",
            description: "Please confirm your attendance to secure your spot.",
            yes_option_label: "Yes, I'm joining",
            yes_response_message: "Great! Your spot is secured.",
            no_option_label: "No, maybe next time",
            no_response_message: "Hope to see you in future events",
            subtitle: "Please confirm your attendance",
            show_wishes_input: false,
            wishes_input_title: "Questions & Feedbacks",
          },
          qr_invitation: { is_active: true },
          wishes_section: {
            is_active: false,
            title: "Questions",
            subtitle: "Ask us anything",
          },
        },
      },
    };
  },
};
