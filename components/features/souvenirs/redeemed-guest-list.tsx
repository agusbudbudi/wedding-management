"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { RedeemedGuest } from "@/lib/types/souvenir";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Gift,
  Clock,
  CheckCircle2,
  Package,
  Star,
  Heart,
  Crown,
  Sparkles,
  Trophy,
  Medal,
  Gem,
  Hexagon,
  Award,
  CircleDot,
  Boxes,
  Coins,
  Flower2,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const ICONS: Record<string, any> = {
  Gift,
  Package,
  Star,
  Heart,
  Crown,
  Sparkles,
  Trophy,
  Medal,
  Gem,
  Hexagon,
  Award,
  CircleDot,
  Boxes,
  Coins,
  Flower2,
};

interface RedeemedGuestListProps {
  guests: RedeemedGuest[];
}

export function RedeemedGuestList({ guests }: RedeemedGuestListProps) {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Reset to page 1 when guests change
  useEffect(() => {
    setCurrentPage(1);
  }, [guests.length]);

  if (guests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-gray-100 animate-in fade-in zoom-in duration-700">
        <div className="bg-blue-50 p-6 rounded-full mb-6">
          <Gift className="w-12 h-12 text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          No Redemptions Yet
        </h2>
        <p className="text-gray-500 mb-8 text-center max-w-sm">
          Guests who have redeemed souvenirs will appear here.
        </p>
      </div>
    );
  }

  const totalItems = guests.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedGuests = guests.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToPage = (page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-[2rem] shadow-[0_2px_40px_-12px_rgba(0,0,0,0.08)] overflow-hidden border border-gray-100/50">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50 border-gray-100 hover:bg-gray-50/50">
              <TableHead className="w-[250px] text-xs font-medium uppercase tracking-wider text-gray-400 pl-6 py-4">
                Guest Name
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Category
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Souvenir Name
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Quantity
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Redeemed At
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-gray-400 pr-6">
                Redeemed By
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedGuests.map((guest) => (
              <TableRow
                key={guest.id}
                className="group border-gray-50 hover:bg-blue-50/30 transition-colors"
              >
                <TableCell className="font-medium pl-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 flex items-center justify-center text-xs font-medium">
                      {guest.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 leading-tight">
                        {guest.name}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className="bg-gray-100 text-gray-600 hover:bg-gray-200 capitalize font-medium text-[10px] px-2.5 py-1 rounded-lg border-none"
                  >
                    {guest.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const IconComp =
                        (guest.souvenir_icon && ICONS[guest.souvenir_icon]) ||
                        Gift;
                      const colorClass =
                        guest.souvenir_color?.split(" ")?.[1] ||
                        "text-purple-500";
                      return <IconComp className={cn("w-3 h-3", colorClass)} />;
                    })()}
                    <span className="text-xs font-medium text-gray-600">
                      {guest.souvenir_name}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs font-medium text-gray-900 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                    {guest.souvenir_redeemed_quantity}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <div className="text-xs font-medium text-gray-900">
                      {format(
                        new Date(guest.souvenir_redeemed_at),
                        "dd MMM yyyy"
                      )}
                    </div>
                    <div className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {format(new Date(guest.souvenir_redeemed_at), "HH:mm")}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="pr-6">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center border border-green-100">
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                    </div>
                    <div className="text-xs font-medium text-gray-600">
                      {guest.redeemed_by_name}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-gray-500 font-medium">
            Showing{" "}
            <span className="font-semibold text-gray-900">
              {startIndex + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-gray-900">
              {Math.min(startIndex + ITEMS_PER_PAGE, totalItems)}
            </span>{" "}
            of <span className="font-semibold text-gray-900">{totalItems}</span>{" "}
            redemptions
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-9 w-9 p-0 rounded-xl"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => {
                  if (
                    totalPages > 7 &&
                    page !== 1 &&
                    page !== totalPages &&
                    Math.abs(page - currentPage) > 1
                  ) {
                    if (Math.abs(page - currentPage) === 2) {
                      return (
                        <MoreHorizontal
                          key={page}
                          className="h-4 w-4 text-gray-400 mx-1"
                        />
                      );
                    }
                    return null;
                  }

                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(page)}
                      className={cn(
                        "h-9 w-9 p-0 rounded-xl transition-all duration-200 font-medium",
                        currentPage === page
                          ? "shadow-lg shadow-blue-500/30"
                          : "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100"
                      )}
                    >
                      {page}
                    </Button>
                  );
                }
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-9 w-9 p-0 rounded-xl"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
