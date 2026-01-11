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

export function WishesCarousel({
  initialWishes,
  eventId,
}: WishesCarouselProps) {
  const [wishes, setWishes] = useState<Wish[]>(initialWishes);
  const supabase = createClient();

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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
      <ScrollArea className="w-full whitespace-nowrap pb-4">
        <div className="flex w-max space-x-4 px-4 sm:px-8 mb-2">
          {wishes.map((wish, i) => (
            <div
              key={i}
              className="w-[280px] sm:w-[320px] bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative group whitespace-normal flex flex-col gap-4"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-gray-100 bg-gray-50">
                  <AvatarFallback className="text-primary font-bold text-xs">
                    {wish.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-bold text-gray-900 text-sm line-clamp-1">
                    {wish.name}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {wish.updated_at
                      ? formatDistanceToNow(new Date(wish.updated_at), {
                          addSuffix: true,
                          locale: id,
                        })
                      : "Baru saja"}
                  </span>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  {wish.status && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        wish.status === "confirmed" ||
                        wish.status === "attended"
                          ? "bg-green-50 text-green-600 border border-green-100"
                          : wish.status === "declined"
                          ? "bg-gray-50 text-gray-500 border border-gray-100"
                          : "bg-blue-50 text-blue-600 border border-blue-100"
                      }`}
                    >
                      {wish.status === "confirmed" || wish.status === "attended"
                        ? "Hadir"
                        : wish.status === "declined"
                        ? "Tidak Hadir"
                        : wish.status}
                    </span>
                  )}
                  <Quote className="w-5 h-5 text-primary/10" />
                </div>
              </div>

              <div className="flex-1">
                <p className="text-gray-600 text-xs leading-relaxed italic line-clamp-4">
                  "{wish.wishes}"
                </p>
              </div>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
