"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Guest } from "@/lib/types";
import { Check, Users, User, X, Gift } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Souvenir } from "@/lib/types/souvenir";
import { cn } from "@/lib/utils";
import {
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
} from "lucide-react";

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

interface CheckInConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  guests: Guest[];
  souvenirs?: Souvenir[];
  mode: "check-in" | "redemption" | "combined";
  onConfirm: (
    guestData: {
      guestId: string;
      attendedPax: number;
      souvenirId: string | null;
    }[]
  ) => void;
  isLoading?: boolean;
}

export function CheckInConfirmationDialog({
  isOpen,
  onOpenChange,
  guests,
  souvenirs = [],
  mode,
  onConfirm,
  isLoading = false,
}: CheckInConfirmationDialogProps) {
  const [guestDetails, setGuestDetails] = useState<
    { guestId: string; attendedPax: number; souvenirId: string | null }[]
  >([]);

  useEffect(() => {
    if (isOpen && guests.length > 0) {
      setGuestDetails(
        guests.map((g) => {
          return {
            guestId: g.id,
            attendedPax: g.attended_pax || g.pax_count || 1,
            souvenirId: null,
          };
        })
      );
    }
  }, [isOpen, guests]);

  const updatePax = (guestId: string, pax: number) => {
    setGuestDetails((prev) =>
      prev.map((item) =>
        item.guestId === guestId ? { ...item, attendedPax: pax } : item
      )
    );
  };

  const updateSouvenir = (guestId: string, souvenirId: string | "none") => {
    setGuestDetails((prev) =>
      prev.map((item) =>
        item.guestId === guestId
          ? { ...item, souvenirId: souvenirId === "none" ? null : souvenirId }
          : item
      )
    );
  };

  const handleConfirm = () => {
    onConfirm(guestDetails);
  };

  const getTotalConfirmation = () => {
    return guestDetails.reduce((acc, curr) => acc + curr.attendedPax, 0);
  };

  const checkInGuests = guests.filter(
    (g) => g.status !== "attended" && g.status !== "souvenir_delivered"
  );
  const redemptionGuests = guests.filter((g) => g.status === "attended");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-xl h-[80vh] flex flex-col gap-4">
        <DialogHeader className="shrink-0 space-y-2 pb-2">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            {mode === "check-in" ? (
              <Check className="w-6 h-6 text-green-600" />
            ) : mode === "redemption" ? (
              <Gift className="w-6 h-6 text-purple-600" />
            ) : (
              <Users className="w-6 h-6 text-blue-600" />
            )}
            {mode === "check-in"
              ? "Confirm Check-in"
              : mode === "redemption"
              ? "Redeem Souvenirs"
              : "Check-in & Redemption"}
          </DialogTitle>
          <p className="text-muted-foreground">
            {mode === "check-in"
              ? "Verify guest count for attendance."
              : mode === "redemption"
              ? "Select and assign souvenirs for guests."
              : "Process check-in and souvenir redemptions."}
          </p>
        </DialogHeader>

        {mode === "check-in" && (
          <div className="shrink-0">
            <div className="bg-blue-50/50 rounded-xl p-3 flex justify-between items-center border border-blue-100">
              <div className="flex items-center gap-2 text-blue-800">
                <Users className="w-4 h-4" />
                <span className="text-sm font-semibold">Total Attending</span>
              </div>
              <span className="text-xl font-bold text-blue-700">
                {getTotalConfirmation()} Pax
              </span>
            </div>
          </div>
        )}

        <ScrollArea className="flex-1 min-h-0 -mr-4 pr-4">
          <div className="space-y-6 pb-2">
            {/* Check-in Section */}
            {(mode === "check-in" || mode === "combined") &&
              checkInGuests.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <Check className="w-4 h-4 text-green-600" />
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                      Guests to Check-in ({checkInGuests.length})
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {checkInGuests.map((guest) => {
                      const detail = guestDetails.find(
                        (d) => d.guestId === guest.id
                      );
                      const attendedPax =
                        detail?.attendedPax ?? guest.pax_count;

                      return (
                        <div
                          key={guest.id}
                          className="p-4 rounded-xl border border-gray-100 bg-white flex flex-col gap-3 group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="p-2 rounded-full flex-shrink-0 bg-blue-50">
                                <User className="w-4 h-4 text-blue-500" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-sm truncate text-gray-900 leading-tight">
                                  {guest.name}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[10px] text-gray-400 capitalize tracking-tighter truncate max-w-[80px]">
                                    {guest.category}
                                  </span>
                                  <span className="w-1 h-1 bg-gray-200 rounded-full flex-shrink-0" />
                                  <span className="text-[10px] text-blue-500 font-medium whitespace-nowrap">
                                    Invited: {guest.pax_count} pax
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-lg"
                                onClick={() =>
                                  updatePax(
                                    guest.id,
                                    Math.max(1, attendedPax - 1)
                                  )
                                }
                              >
                                -
                              </Button>
                              <div className="w-12">
                                <Input
                                  type="number"
                                  value={attendedPax}
                                  onChange={(e) =>
                                    updatePax(
                                      guest.id,
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  className="w-full text-center h-8 font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  min={1}
                                />
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-lg"
                                onClick={() =>
                                  updatePax(guest.id, attendedPax + 1)
                                }
                              >
                                +
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* Redemption Section */}
            {(mode === "redemption" || mode === "combined") &&
              redemptionGuests.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <Gift className="w-4 h-4 text-purple-600" />
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                      Souvenir Redemption ({redemptionGuests.length})
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {redemptionGuests.map((guest) => {
                      const detail = guestDetails.find(
                        (d) => d.guestId === guest.id
                      );
                      const selectedSouvenirId = detail?.souvenirId;

                      const allowedSouvenirs = souvenirs.filter(
                        (s) =>
                          !s.category_restrictions ||
                          s.category_restrictions.length === 0 ||
                          (guest.category &&
                            s.category_restrictions.includes(guest.category))
                      );

                      return (
                        <div
                          key={guest.id}
                          className="p-4 rounded-xl border border-gray-100 bg-white flex flex-col gap-3 group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3 min-w-0 flex-1 text-left">
                              <div className="p-2 rounded-full flex-shrink-0 bg-purple-50">
                                <User className="w-4 h-4 text-purple-500" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-sm truncate text-gray-900 leading-tight">
                                  {guest.name}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[10px] text-gray-400 capitalize tracking-tighter truncate max-w-[80px]">
                                    {guest.category}
                                  </span>
                                  <span className="w-1 h-1 bg-gray-200 rounded-full flex-shrink-0" />
                                  <span className="text-[10px] text-green-600 font-bold whitespace-nowrap">
                                    Attended: {guest.attended_pax || 0} pax
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {allowedSouvenirs.length > 0 && (
                            <div className="pt-3 border-t border-gray-50 flex items-center gap-3">
                              <div className="p-1.5 rounded-full bg-orange-50 shrink-0">
                                <Gift className="w-3.5 h-3.5 text-orange-500" />
                              </div>
                              <Select
                                value={selectedSouvenirId || "none"}
                                onValueChange={(val) =>
                                  updateSouvenir(guest.id, val)
                                }
                              >
                                <SelectTrigger className="h-9 text-xs w-full bg-gray-50 border-gray-200">
                                  <SelectValue placeholder="Select souvenir..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">
                                    No Souvenir
                                  </SelectItem>
                                  {allowedSouvenirs.map((s) => (
                                    <SelectItem
                                      key={s.id}
                                      value={s.id}
                                      disabled={s.stock <= 0}
                                    >
                                      <div className="flex items-center justify-between w-full gap-4">
                                        <div className="flex items-center gap-2">
                                          <div
                                            className={cn(
                                              "p-1 rounded-md",
                                              s.color ||
                                                "bg-blue-50 text-blue-600"
                                            )}
                                          >
                                            {(() => {
                                              const IconComp =
                                                ICONS[s.icon] || Gift;
                                              return (
                                                <IconComp className="w-3 h-3" />
                                              );
                                            })()}
                                          </div>
                                          <span>{s.name}</span>
                                        </div>
                                        <Badge
                                          variant="secondary"
                                          className={`text-[9px] h-4 px-1.5 font-bold whitespace-nowrap ${
                                            s.stock <= 0
                                              ? "bg-red-50 text-red-600 border-red-100"
                                              : s.stock <= 10
                                              ? "bg-orange-50 text-orange-600 border-orange-100"
                                              : "bg-green-50 text-green-600 border-green-100"
                                          }`}
                                        >
                                          {s.stock <= 0
                                            ? "Out of Stock"
                                            : `${s.stock} Stock Left`}
                                        </Badge>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
          </div>
        </ScrollArea>

        <DialogFooter className="shrink-0 gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading
              ? "Processing..."
              : mode === "check-in"
              ? `Confirm & Check-in`
              : mode === "redemption"
              ? `Confirm & Redeem`
              : `Confirm Both`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
