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
import { Check, Users, User, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface CheckInConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  guests: Guest[];
  onConfirm: (guestData: { guestId: string; attendedPax: number }[]) => void;
  isLoading?: boolean;
}

export function CheckInConfirmationDialog({
  isOpen,
  onOpenChange,
  guests,
  onConfirm,
  isLoading = false,
}: CheckInConfirmationDialogProps) {
  const [guestDetails, setGuestDetails] = useState<
    { guestId: string; attendedPax: number }[]
  >([]);

  useEffect(() => {
    if (isOpen && guests.length > 0) {
      // Initialize with existing attended_pax if available, otherwise use pax_count
      // Only set for guests that are NOT already checked in (to avoid overwriting data if opened for review - though this dialog is mainly for action)
      // Actually per logic, we should probably default to pax_count for new check-ins.
      setGuestDetails(
        guests.map((g) => ({
          guestId: g.id,
          attendedPax: g.pax_count || 1, // Default to invitation pax
        }))
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

  const handleConfirm = () => {
    onConfirm(guestDetails);
  };

  const getTotalConfirmation = () => {
    return guestDetails.reduce((acc, curr) => acc + curr.attendedPax, 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg h-[80vh] flex flex-col gap-4">
        <DialogHeader className="shrink-0 space-y-2 pb-2">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Check className="w-6 h-6 text-green-600" />
            Confirm Check-in
          </DialogTitle>
          <p className="text-muted-foreground">
            Verify and update actual attended guests count.
          </p>
        </DialogHeader>

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

        <ScrollArea className="flex-1 min-h-0 -mr-4 pr-4">
          <div className="space-y-3 pb-2">
            {guests.map((guest) => {
              const detail = guestDetails.find((d) => d.guestId === guest.id);
              const attendedPax = detail?.attendedPax ?? guest.pax_count;

              return (
                <div
                  key={guest.id}
                  className="p-3 rounded-xl border border-gray-100 bg-white hover:border-blue-200 hover:shadow-md hover:shadow-blue-500/5 transition-all duration-200 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                    <div className="p-2 rounded-full flex-shrink-0 bg-blue-50 group-hover:bg-blue-100 transition-colors">
                      <User className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="font-semibold text-sm truncate text-gray-900 leading-tight">
                        {guest.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-gray-400 capitalize tracking-tighter truncate max-w-[80px]">
                          {guest.category}
                        </span>
                        <span className="w-1 h-1 bg-gray-200 rounded-full flex-shrink-0" />
                        <span className="text-[10px] text-blue-500 font-medium">
                          Invited: {guest.pax_count} Pax
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 rounded-lg border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors"
                      onClick={() =>
                        updatePax(guest.id, Math.max(1, attendedPax - 1))
                      }
                    >
                      -
                    </Button>
                    <div className="w-12 px-1">
                      <Input
                        type="number"
                        value={attendedPax}
                        onChange={(e) =>
                          updatePax(guest.id, parseInt(e.target.value) || 0)
                        }
                        className="w-full text-center h-7 p-0 font-bold bg-white border border-gray-200 focus-visible:ring-1 focus-visible:ring-blue-500 rounded-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        min={1}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 rounded-lg border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors"
                      onClick={() => updatePax(guest.id, attendedPax + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <DialogFooter className="shrink-0 gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading
              ? "Processing..."
              : `Check-in ${guests.length} Guest${
                  guests.length > 1 ? "s" : ""
                }`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
