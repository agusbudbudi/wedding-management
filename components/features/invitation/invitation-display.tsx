"use client";

import {
  Calendar,
  MapPin,
  Heart,
  Building2,
  Users,
  GraduationCap,
  Sparkles,
  Gift,
} from "lucide-react";
import { InvitationTemplateType, InvitationMetadata } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface InvitationDisplayProps {
  title: string;
  content: string;
  templateType: InvitationTemplateType;
  metadata: InvitationMetadata;
  guestName?: string;
  onRsvpClick?: () => void;
}

export function InvitationDisplay({
  title,
  content,
  templateType,
  metadata,
  guestName = "Honored Guest",
  onRsvpClick,
}: InvitationDisplayProps) {
  const getIcon = () => {
    switch (templateType) {
      case "wedding":
        return <Heart className="w-8 h-8 text-rose-500 fill-rose-500/20" />;
      case "corporate":
        return <Building2 className="w-8 h-8 text-blue-500" />;
      case "khitanan":
        return <Users className="w-8 h-8 text-emerald-500" />;
      case "workshop":
        return <GraduationCap className="w-8 h-8 text-amber-500" />;
      default:
        return null;
    }
  };

  const getBgStyle = () => {
    switch (templateType) {
      case "wedding":
        return "from-rose-50 to-pink-50";
      case "corporate":
        return "from-blue-50 to-indigo-50";
      case "khitanan":
        return "from-emerald-50 to-teal-50";
      case "workshop":
        return "from-amber-50 to-orange-50";
      default:
        return "from-gray-50 to-slate-50";
    }
  };

  const wMeta = metadata as any;

  const replaceVars = (text: string) => {
    return text
      .replace(/\[Groom\]/g, wMeta?.groom_name || "Groom")
      .replace(/\[Bride\]/g, wMeta?.bride_name || "Bride")
      .replace(/\[Date\]/g, wMeta?.wedding_date || "Event Date")
      .replace(/\[Location\]/g, wMeta?.wedding_location || "Event Location")
      .replace(/\[Topic\]/g, "Event Topic")
      .replace(/\[Name\]/g, guestName)
      .replace(/\[Title\]/g, title || "Event Title")
      .replace(/\[ReceptionDate\]/g, wMeta?.reception_date || "Reception Date")
      .replace(
        /\[ReceptionLocation\]/g,
        wMeta?.reception_location || "Reception Location"
      )
      .replace(/\[WeddingDate\]/g, wMeta?.wedding_date || "Event Date")
      .replace(
        /\[WeddingLocation\]/g,
        wMeta?.wedding_location || "Event Location"
      )
      .replace(/\[EventDate\]/g, wMeta?.wedding_date || "Event Date")
      .replace(
        /\[EventLocation\]/g,
        wMeta?.wedding_location || "Event Location"
      )
      .replace(/\[DressCode\]/g, wMeta?.dress_code || "Dress Code");
  };

  const processedTitle = replaceVars(title);
  const processedContent = replaceVars(content);

  return (
    <div
      className={`w-full bg-gradient-to-br ${getBgStyle()} relative overflow-hidden flex flex-col items-center p-8 text-center rounded-b-[2.5rem]`}
    >
      {/* Decorative Background shapes */}
      <div className="absolute -left-20 -top-20 w-64 h-64 bg-white/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Content Container */}
      <div className="w-full space-y-10 relative z-10">
        {/* Icon & Label */}
        <div className="flex flex-col items-center">
          <div className="p-4 bg-white/50 rounded-full backdrop-blur-sm shadow-sm animate-in zoom-in duration-700">
            {getIcon()}
          </div>
          <p className="mt-4 text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase">
            {templateType === "wedding"
              ? "The Wedding of"
              : "Special Invitation"}
          </p>
        </div>

        {/* Names / Title */}
        {templateType === "wedding" &&
        (wMeta?.groom_name || wMeta?.bride_name) ? (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-700">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-tight italic">
              {wMeta?.groom_name || "Groom"}
            </h2>
            <div className="text-2xl font-serif text-rose-400">&</div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-tight italic">
              {wMeta?.bride_name || "Bride"}
            </h2>
          </div>
        ) : (
          <h1 className="text-3xl font-serif font-bold text-gray-900 leading-tight">
            {processedTitle || "Welcome to our Event"}
          </h1>
        )}

        {/* Separator */}
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-auto" />

        {/* Content Body */}
        <div className="space-y-4">
          <p className="text-gray-600 leading-relaxed italic text-lg px-2 max-w-lg mx-auto">
            "{processedContent || "Your invitation message will appear here..."}
            "
          </p>
        </div>

        {/* Event Details Section */}
        <div className="grid grid-cols-1 gap-4 text-left max-w-md mx-auto w-full">
          {/* Main Detail */}
          <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-6 border border-white/60 space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-100 rounded-xl">
                <Sparkles className="w-4 h-4 text-rose-500" />
              </div>
              <h4 className="font-bold text-gray-900">
                {templateType === "wedding"
                  ? "Holy Matrimony"
                  : "Event Schedule"}
              </h4>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-primary shrink-0" />
                <span>{wMeta?.wedding_date || "Event Date"}</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span>{wMeta?.wedding_location || "Event Location"}</span>
              </div>
            </div>
          </div>

          {/* Reception Detail if it exists */}
          {wMeta?.reception_date && (
            <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-6 border border-white/60 space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Heart className="w-4 h-4 text-blue-500" />
                </div>
                <h4 className="font-bold text-gray-900">Wedding Reception</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <span>{wMeta?.reception_date}</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span>
                    {wMeta?.reception_location || wMeta?.wedding_location}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Dress Code Section */}
          {wMeta?.dress_code && (
            <div className="bg-white/40 backdrop-blur-sm rounded-3xl p-6 border border-white/60 space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-xl">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </div>
                <h4 className="font-bold text-gray-900">Dress Code</h4>
              </div>
              <p className="text-gray-600 text-sm italic font-medium">
                {wMeta.dress_code}
              </p>
            </div>
          )}

          {/* Gift Info Section */}
          {/* Gift Info Section */}
          {wMeta?.gift_info &&
            Array.isArray(wMeta.gift_info) &&
            wMeta.gift_info.length > 0 && (
              <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-rose-100/50 space-y-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-xl">
                    <Gift className="w-4 h-4 text-amber-500" />
                  </div>
                  <h4 className="font-bold text-gray-900">Wedding Gift</h4>
                </div>
                <div className="space-y-4">
                  {wMeta.gift_info.map((item: any) => (
                    <div
                      key={item.id}
                      className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 group"
                    >
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                        {item.type === "bank" ? item.name : item.name}
                      </p>
                      <p className="font-mono text-gray-900 font-bold ">
                        {item.number}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        a/n {item.owner_name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        {onRsvpClick && (
          <div className="pt-4 max-w-md mx-auto w-full">
            <Button
              onClick={onRsvpClick}
              className="w-full bg-primary hover:bg-blue-600 shadow-xl shadow-blue-500/20 rounded-[1.5rem] h-14 font-bold text-lg"
            >
              Confirm RSVP
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
