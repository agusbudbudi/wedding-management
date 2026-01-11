import { ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { supabaseInvitationService } from "@/lib/services/invitation-service";
import { GuestInvitationClient } from "./guest-invitation-client";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function InvitationPage(props: PageProps) {
  const params = await props.params;
  const supabase = await createClient();

  // 1. Fetch Guest by decoding the full path from catch-all route
  const slugArray = (await props.params).slug;
  if (!slugArray || slugArray.length === 0) notFound();

  // Reconstruct the full slug (e.g. "wedding-event/guest-name")
  // Using decodeURIComponent to handle UI encoding of slashes if needed, though Next.js usually passes them raw in array
  const fullSlug = slugArray.map((s) => decodeURIComponent(s)).join("/");

  const { data: guestData } = await supabase
    .from("guests")
    .select("*")
    .eq("slug", fullSlug)
    .maybeSingle();

  const guest = guestData as any;

  if (!guest) {
    notFound();
  }

  // 2. Fetch Invitation
  const invitation = await supabaseInvitationService.getInvitationByEventId(
    guest.event_id,
    supabase
  );

  // 3. Get Template Defaults if none exists
  const defaultTemplates = supabaseInvitationService.getTemplates();
  const activeInvitation = invitation || {
    title: defaultTemplates.wedding.title,
    content: defaultTemplates.wedding.content,
    template_type: "wedding",
    metadata: defaultTemplates.wedding.metadata,
  };

  // 4. Fetch Wishes (Guests with non-null wishes for this event)
  const { data: wishesData } = await supabase
    .from("guests")
    .select("name, wishes, updated_at, category, status")
    .eq("event_id", guest.event_id)
    .not("wishes", "is", null)
    .neq("wishes", "") // Ensure empty string wishes are excluded if any
    .order("updated_at", { ascending: false })
    .limit(20);

  // 5. Check if Invitation is active (only if it exists in DB)
  if (invitation && !invitation.is_active) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-12 text-center relative overflow-hidden ring-1 ring-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
          {/* Decorative background elements */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-50" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-50 rounded-full blur-3xl opacity-50" />

          <div className="relative z-10 space-y-8">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto ring-8 ring-gray-50/50">
              <ShieldAlert className="w-12 h-12 text-gray-300" />
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-serif font-bold text-gray-900 italic tracking-tight">
                Undangan Tidak Aktif
              </h1>
              <div className="h-1 w-12 bg-blue-100 mx-auto rounded-full" />
              <p className="text-gray-500 text-sm leading-relaxed px-4">
                Mohon maaf, saat ini undangan sedang dalam tahap pemeliharaan
                atau telah dinonaktifkan oleh penyelenggara.
              </p>
            </div>

            <div className="pt-4">
              <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em]">
                Terima Kasih Atas Pengertiannya
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <GuestInvitationClient
      guest={guest}
      invitation={activeInvitation}
      wishes={wishesData || []}
    />
  );
}
