"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Quote } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { createClient } from "@/lib/supabase/client";

interface Wish {
  name: string;
  wishes: string;
  updated_at?: string;
  category: string;
  status?: string;
}

interface WishesCarouselProps {
  initialWishes: Wish[];
  eventId: string;
}

const cardColors = [
  "bg-blue-50/70 border-blue-100/50",
  "bg-purple-50/70 border-purple-100/50",
  "bg-rose-50/70 border-rose-100/50",
  "bg-cyan-50/70 border-cyan-100/50",
  "bg-amber-50/70 border-amber-100/50",
];

export function WishesCarousel({
  initialWishes,
  eventId,
}: WishesCarouselProps) {
  const [wishes, setWishes] = useState<Wish[]>(initialWishes);
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(
    new Set()
  );
  const supabase = createClient();

  const toggleExpand = (index: number) => {
    const newSet = new Set(expandedIndices);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setExpandedIndices(newSet);
  };

  useEffect(() => {
    // Refresh wishes function
    const fetchWishes = async () => {
      const { data } = await supabase
        .from("guests")
        .select("name, wishes, updated_at, category, status")
        .eq("event_id", eventId)
        .not("wishes", "is", null)
        .neq("wishes", "")
        .order("updated_at", { ascending: false })
        .limit(20);

      if (data) {
        setWishes(data as Wish[]);
      }
    };

    // Subscribe to changes
    const channel = supabase
      .channel("wishes-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "guests",
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          fetchWishes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, supabase]);

  if (!wishes || wishes.length === 0) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
      <ScrollArea className="w-full whitespace-nowrap pb-6">
        <div className="flex w-max space-x-6 px-4 sm:px-8">
          {wishes.map((wish, i) => {
            const isExpanded = expandedIndices.has(i);
            const bgColorClass = cardColors[i % cardColors.length];

            return (
              <div
                key={i}
                className={`w-[280px] sm:w-[340px] rounded-[2rem] p-5 border ${bgColorClass} transition-all duration-500 relative group whitespace-normal flex flex-col gap-2 overflow-hidden`}
              >
                {/* Artistic Background Quote */}
                <Quote className="absolute -right-4 -bottom-4 w-24 h-24 text-gray-900/[0.03] rotate-12 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700" />

                <div className="flex items-center gap-4 relative z-10">
                  <div className="relative">
                    <Avatar className="h-9 w-9 border-2 border-white bg-white/50 ring-1 ring-black/5">
                      <AvatarFallback className="text-gray-600 font-bold text-[10px]">
                        {wish.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-serif italic font-bold text-gray-900 text-[13.5px] line-clamp-1">
                      {wish.name}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                      {wish.updated_at
                        ? formatDistanceToNow(new Date(wish.updated_at), {
                            addSuffix: true,
                            locale: id,
                          })
                        : "Baru saja"}
                    </span>
                  </div>
                </div>

                <div className="relative z-10">
                  <p
                    className={`text-gray-700 text-[13px] leading-[1.8] italic font-medium transition-all duration-300 ${
                      !isExpanded ? "line-clamp-2" : ""
                    }`}
                  >
                    "{wish.wishes}"
                  </p>
                  {wish.wishes.length > 70 && (
                    <button
                      onClick={() => toggleExpand(i)}
                      className="text-[10px] font-bold text-blue-600/70 hover:text-blue-600 mt-2 uppercase tracking-widest transition-colors flex items-center gap-1"
                    >
                      {isExpanded ? "Sembunyikan" : "Selengkapnya"}
                    </button>
                  )}
                </div>

                <div className="mt-auto flex items-center justify-between pt-2 relative z-10">
                  {wish.status && (
                    <span
                      className={`text-[9px] px-3 py-1 rounded-full font-bold uppercase tracking-[0.1em] bg-white/50 border border-black/5 text-gray-500`}
                    >
                      {wish.status === "confirmed" || wish.status === "attended"
                        ? "Hadir di sini"
                        : wish.status === "declined"
                        ? "Mendoakan"
                        : wish.status}
                    </span>
                  )}
                  <div className="flex gap-1 opacity-20">
                    <div className="w-1 h-1 bg-gray-900 rounded-full" />
                    <div className="w-1 h-1 bg-gray-900 rounded-full" />
                    <div className="w-1 h-1 bg-gray-900 rounded-full" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="h-1.5" />
      </ScrollArea>
    </div>
  );
}
