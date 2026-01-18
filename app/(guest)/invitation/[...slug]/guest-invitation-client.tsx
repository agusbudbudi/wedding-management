"use client";

import { useRef } from "react";
import { RSVPForm } from "@/components/features/rsvp-form";
import { Separator } from "@/components/ui/separator";
import { Sparkles } from "lucide-react";
import { InvitationDisplay } from "@/components/features/invitation/invitation-display";

import { WishesCarousel } from "@/components/features/invitation/wishes-carousel";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import QRCode from "react-qr-code";
import { Gift, CheckCircle2, Download, Loader2 } from "lucide-react";
import { Guest } from "@/lib/types";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { PhotoUpload } from "@/components/features/invitation/photo-upload";

interface GuestInvitationClientProps {
  guest: any;
  invitation: any;
  wishes?: any[];
  table?: any;
}

export function GuestInvitationClient({
  guest,
  invitation,
  wishes = [],
  table,
}: GuestInvitationClientProps) {
  const rsvpRef = useRef<HTMLDivElement>(null);

  const scrollToRSVP = () => {
    rsvpRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const [currentGuest, setCurrentGuest] = useState<Guest>(guest);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`guest-${guest.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "guests",
          filter: `id=eq.${guest.id}`,
        },
        (payload: any) => {
          setCurrentGuest(payload.new as Guest);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [guest.id]);

  const voucherRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadVoucher = useCallback(async () => {
    if (!voucherRef.current) return;

    try {
      setIsDownloading(true);
      const dataUrl = await toPng(voucherRef.current, {
        cacheBust: true,
        backgroundColor: "#fff",
        pixelRatio: 2, // Higher quality
      });

      const link = document.createElement("a");
      link.download = `voucher-souvenir-${currentGuest.name
        .toLowerCase()
        .replace(/\s+/g, "-")}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download voucher:", err);
    } finally {
      setIsDownloading(false);
    }
  }, [currentGuest.name]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Dynamic Invitation Section */}
      <InvitationDisplay
        title={invitation.title}
        content={invitation.content}
        templateType={invitation.template_type}
        metadata={invitation.metadata}
        guestName={guest.name}
        onRsvpClick={scrollToRSVP}
      />

      {/* Guest Info & RSVP Section (Below the fold) */}
      <div ref={rsvpRef} className="px-8 pb-12 space-y-8 flex-1 mt-8">
        {(invitation.metadata as any)?.rsvp?.is_active !== false && (
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em]">
                {(invitation.metadata as any)?.rsvp?.guest_name_label ||
                  "Tamu Undangan"}
              </p>
              <div className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 p-10 rounded-[2.5rem] border-2 border-white shadow-[0_15px_50px_rgba(0,0,0,0.03)] relative overflow-hidden group transition-all duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-48 h-48 bg-blue-100/20 rounded-full blur-3xl opacity-50 transition-transform duration-1000 group-hover:scale-125" />
                <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-48 h-48 bg-purple-100/20 rounded-full blur-3xl opacity-50 transition-transform duration-1000 group-hover:scale-125" />

                {/* Light Sweep Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                  <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-[1500ms] ease-in-out bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-20deg]" />
                </div>

                <div className="relative z-10">
                  <h3 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 italic tracking-tight">
                    {guest.name}
                  </h3>
                  <div className="w-12 h-0.5 bg-blue-200/50 my-4 rounded-full" />
                  <p className="text-gray-500 text-sm leading-relaxed max-w-[280px] mx-auto sm:max-w-none">
                    {(invitation.metadata as any)?.rsvp?.description ||
                      "Merupakan suatu kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir pada acara kami."}
                  </p>
                </div>
                {/* Subtle decorative icons */}
                <div className="absolute -right-2 -bottom-2 text-blue-200/20 group-hover:text-blue-200/40 transition-all duration-700 group-hover:scale-110 group-hover:-rotate-12">
                  <Sparkles className="w-20 h-20" />
                </div>
              </div>
            </div>

            <Separator className="bg-gray-100" />

            {/* RSVP Section */}
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="text-center space-y-2">
                <h4 className="text-xl font-bold text-gray-900 tracking-tight italic font-serif">
                  {(invitation.metadata as any)?.rsvp?.title}
                </h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  {(invitation.metadata as any)?.rsvp?.subtitle}
                </p>
              </div>
              <RSVPForm
                guest={guest}
                isQRActive={
                  (invitation.metadata as any)?.qr_invitation?.is_active !==
                    false &&
                  (invitation.metadata as any)?.rsvp?.is_active !== false
                }
                yesOptionLabel={
                  (invitation.metadata as any)?.rsvp?.yes_option_label
                }
                yesResponseMessage={
                  (invitation.metadata as any)?.rsvp?.yes_response_message
                }
                noOptionLabel={
                  (invitation.metadata as any)?.rsvp?.no_option_label
                }
                noResponseMessage={
                  (invitation.metadata as any)?.rsvp?.no_response_message
                }
                showWishesInput={
                  (invitation.metadata as any)?.rsvp?.show_wishes_input !==
                  false
                }
                wishesInputTitle={
                  (invitation.metadata as any)?.rsvp?.wishes_input_title
                }
              />
            </div>
          </div>
        )}

        {/* Seating Information Section */}
        {(invitation.metadata as any)?.rsvp?.is_active !== false &&
          (invitation.metadata as any)?.seating_info?.is_active === true &&
          table && (
            <>
              <Separator className="bg-gray-100" />
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center space-y-2">
                  <h4 className="text-xl font-bold text-gray-900 tracking-tight italic font-serif">
                    {(invitation.metadata as any)?.seating_info?.title ||
                      "Informasi Tempat Duduk"}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    {(invitation.metadata as any)?.seating_info?.subtitle ||
                      "Silakan menempati meja yang telah disediakan"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center space-y-1">
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">
                      {(invitation.metadata as any)?.seating_info
                        ?.table_name_label || "Nama Meja"}
                    </p>
                    <p className="text-lg font-serif font-black text-emerald-900 italic">
                      {table.name}
                    </p>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center space-y-1">
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">
                      {(invitation.metadata as any)?.seating_info
                        ?.table_shape_label || "Bentuk Meja"}
                    </p>
                    <p className="text-lg font-serif font-black text-emerald-900 italic capitalize">
                      {table.shape}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

        {/* Wishes Carousel Section */}
        {(invitation.metadata as any)?.rsvp?.is_active !== false &&
          (invitation.metadata as any)?.wishes_section?.is_active !== false && (
            <>
              <Separator className="bg-gray-100" />
              <div className="space-y-6">
                <div className="text-center space-y-2 mb-4">
                  <h4 className="text-xl font-bold text-gray-900 tracking-tight italic font-serif">
                    {(invitation.metadata as any)?.wishes_section?.title ||
                      "Ucapan & Doa"}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    {(invitation.metadata as any)?.wishes_section?.subtitle ||
                      "Kiriman hangat dari para sahabat"}
                  </p>
                </div>
                <WishesCarousel
                  initialWishes={wishes}
                  eventId={guest.event_id}
                />
              </div>
            </>
          )}

        {/* Guest Book Photo Section */}
        {currentGuest.status === "attended" &&
          (invitation.metadata as any)?.guest_book?.is_active !== false && (
            <>
              <Separator className="bg-gray-100" />
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="text-center space-y-2">
                  <h4 className="text-xl font-bold text-gray-900 tracking-tight italic font-serif">
                    {(invitation.metadata as any)?.guest_book?.title ||
                      "Guest Book Photo"}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    {(invitation.metadata as any)?.guest_book?.subtitle ||
                      "Unggah momen manismu di acara ini"}
                  </p>
                </div>

                <PhotoUpload
                  guestId={currentGuest.id}
                  guestName={currentGuest.name}
                  initialPhotoUrl={currentGuest.photo_url}
                  onUploadSuccess={(url) => {
                    setCurrentGuest((prev) => ({ ...prev, photo_url: url }));
                  }}
                />
              </div>
            </>
          )}

        {/* Souvenir Redemption Section */}
        {(invitation.metadata as any)?.qr_invitation?.is_active !== false &&
          (invitation.metadata as any)?.rsvp?.is_active !== false &&
          (invitation.metadata as any)?.redeem_souvenir?.is_active !== false &&
          (currentGuest.status === "attended" ||
            currentGuest.status === "souvenir_delivered") && (
            <>
              <Separator className="bg-gray-100" />
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center space-y-2">
                  <h4 className="text-xl font-bold text-gray-900 tracking-tight italic font-serif">
                    {(invitation.metadata as any)?.redeem_souvenir?.title ||
                      "Pengambilan Souvenir"}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    {(invitation.metadata as any)?.redeem_souvenir?.subtitle ||
                      "Scan QR code ini di meja souvenir"}
                  </p>
                </div>

                <div className="relative w-full max-w-sm mx-auto">
                  {/* Main Ticket Container */}
                  <div
                    ref={voucherRef}
                    className="relative bg-white rounded-3xl border border-blue-100/50"
                  >
                    {/* Top Section: QR Code */}
                    <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50/50 p-8 text-center rounded-t-[1.4rem]">
                      {/* Left and Right "Notches" for Ticket Effect */}
                      <div className="absolute -left-[1px] top-full -translate-y-1/2 w-3 h-6 bg-white rounded-r-full border-t border-r border-b border-blue-100/50 z-10" />
                      <div className="absolute -right-[1px] top-full -translate-y-1/2 w-3 h-6 bg-white rounded-l-full border-t border-l border-b border-blue-100/50 z-10" />

                      <div className="inline-block p-4 bg-white rounded-2xl shadow-sm border border-gray-100 relative">
                        {currentGuest.status === "souvenir_delivered" && (
                          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-[1px] rounded-2xl">
                            <div className="border-4 border-green-600 rounded-lg px-4 py-2 transform -rotate-12 opacity-80 shadow-sm bg-white/40">
                              <p className="text-green-700 font-black text-xl uppercase tracking-widest">
                                Redeemed
                              </p>
                            </div>
                          </div>
                        )}

                        <QRCode
                          value={currentGuest.id}
                          size={160}
                          className="h-auto w-full max-w-[160px]"
                          viewBox={`0 0 256 256`}
                        />
                      </div>
                    </div>

                    {/* Bottom Section: Details */}
                    <div className="bg-white p-6 relative rounded-b-[1.4rem]">
                      <div className="space-y-4 text-center">
                        <div className="space-y-1">
                          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">
                            Souvenir Voucher
                          </h3>
                          <p className="text-lg font-serif italic text-gray-900 font-bold">
                            Valid for One Guest
                          </p>
                        </div>

                        {currentGuest.status === "attended" ? (
                          <div className="bg-purple-50 rounded-xl p-3 flex items-center justify-center gap-2 text-purple-700 border border-purple-100">
                            <Gift className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">
                              {currentGuest.name}
                            </span>
                          </div>
                        ) : (
                          <div className="bg-green-50 rounded-xl p-3 flex items-center justify-center gap-2 text-green-700 border border-green-100">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">
                              Souvenir Redeemed
                            </span>
                          </div>
                        )}

                        <p className="text-[10px] text-gray-400">
                          Show this voucher to our staff at the souvenir
                          counter.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Download Button */}
                <div className="mt-6 flex justify-center">
                  <Button
                    onClick={downloadVoucher}
                    disabled={isDownloading}
                    variant="outline"
                    className="rounded-full px-6 py-6 border-2 border-primary/20 hover:border-primary/50 text-primary font-bold shadow-lg shadow-primary/10 transition-all hover:scale-105"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Image...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download Voucher
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
      </div>
    </div>
  );
}
