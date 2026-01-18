"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Search,
  RotateCcw,
  CheckCircle2,
  XCircle,
  QrCode,
  Users,
  User,
  Check,
  Loader2,
  Lock,
  Gift,
} from "lucide-react";
import dynamic from "next/dynamic";

const QRScanner = dynamic(
  () => import("@/components/features/qr-scanner").then((mod) => mod.QRScanner),
  { ssr: false },
);
const CheckInConfirmationDialog = dynamic(
  () =>
    import("@/components/features/check-in/check-in-confirmation-dialog").then(
      (mod) => mod.CheckInConfirmationDialog,
    ),
  { ssr: false },
);

import { supabaseGuestService } from "@/lib/services/guest-service";
import { Guest } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { Souvenir } from "@/lib/types/souvenir";
import { souvenirService } from "@/lib/services/souvenir-service";
import { PermissionGuard } from "@/components/auth/permission-guard";

export function CheckInClientPage() {
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error" | "already_checked"
  >("idle");
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  // Manual search & selection
  const [allGuests, setAllGuests] = useState<Guest[]>([]);
  const [souvenirs, setSouvenirs] = useState<Souvenir[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGuests, setSelectedGuests] = useState<Guest[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const { hasPermission, loading } = usePermissions();

  // Confirmation Dialog
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [confirmationMode, setConfirmationMode] = useState<
    "check-in" | "redemption" | "combined"
  >("check-in");
  const [pendingGuests, setPendingGuests] = useState<Guest[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const canView = hasPermission("check_in", "view");
  const canScan = hasPermission("check_in", "scan");
  const canManual = hasPermission("check_in", "manual");

  useEffect(() => {
    // loadGuests(); // Removed full load

    // Initial load for souvenirs only
    const eventId = localStorage.getItem("active_event_id");
    if (eventId) {
      souvenirService.getSouvenirs(eventId).then(setSouvenirs);
    }

    // Close results when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadGuests = async () => {
    // Only refresh if we have an active search or selected guests
    const eventId = localStorage.getItem("active_event_id");
    if (eventId) {
      if (searchQuery.trim() !== "") {
        const results = await supabaseGuestService.searchGuests(
          eventId,
          searchQuery,
        );
        setAllGuests(results);
      }
      const sData = await souvenirService.getSouvenirs(eventId);
      setSouvenirs(sData);
    }
  };

  // Debounced search logic
  useEffect(() => {
    const eventId = localStorage.getItem("active_event_id");
    if (!eventId || searchQuery.trim() === "") {
      setAllGuests([]);
      return;
    }

    const timer = setTimeout(async () => {
      const results = await supabaseGuestService.searchGuests(
        eventId,
        searchQuery,
      );
      setAllGuests(results);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredGuests = allGuests; // No longer needs client-side filter

  const toggleGuestSelect = (guest: Guest) => {
    setSelectedGuests((prev) => {
      const isSelected = prev.some((g) => g.id === guest.id);
      if (isSelected) {
        return prev.filter((g) => g.id !== guest.id);
      } else {
        return [...prev, guest];
      }
    });
  };

  const handleBulkCheckIn = async () => {
    if (selectedGuests.length === 0) return;

    // Filter guests that need check-in (not attended yet)
    const guestsToCheckIn = selectedGuests.filter(
      (g) => g.status !== "attended" && g.status !== "souvenir_delivered",
    );
    const needsCheckIn = selectedGuests.filter(
      (g) => g.status !== "attended" && g.status !== "souvenir_delivered",
    );
    const needsRedemption = selectedGuests.filter(
      (g) => g.status === "attended",
    );

    if (needsCheckIn.length > 0 && needsRedemption.length > 0) {
      setConfirmationMode("combined");
    } else if (needsRedemption.length > 0) {
      setConfirmationMode("redemption");
    } else {
      setConfirmationMode("check-in");
    }

    setPendingGuests(selectedGuests);
    setIsConfirmationOpen(true);
  };

  const handleConfirmCheckIn = async (
    confirmedData: {
      guestId: string;
      attendedPax: number;
      souvenirId: string | null;
    }[],
  ) => {
    try {
      setIsProcessing(true);

      if (selectedGuests.length > 0) {
        // Bulk Flow
        await processGuests(selectedGuests, confirmedData);
      } else {
        // Single Scan Flow
        await processGuests(pendingGuests, confirmedData);
      }

      setIsConfirmationOpen(false);

      setStatus("success");

      // Update local guest objects with confirmed status/pax for display
      const updatedConfirmedGuests = confirmedData
        .map((c) => {
          const originalGuest = [...pendingGuests, ...selectedGuests].find(
            (g) => g.id === c.guestId,
          );
          if (originalGuest) {
            let nextStatus = originalGuest.status;
            if (
              originalGuest.status !== "attended" &&
              originalGuest.status !== "souvenir_delivered"
            ) {
              nextStatus = "attended";
            } else if (originalGuest.status === "attended") {
              nextStatus = "souvenir_delivered";
            }

            return {
              ...originalGuest,
              attended_pax: c.attendedPax,
              status: nextStatus as any,
            } as Guest;
          }
          return null;
        })
        .filter(Boolean) as Guest[];

      if (pendingGuests.length === 1 && selectedGuests.length === 0) {
        // Single Scan Flow
        const updatedGuest = updatedConfirmedGuests.find(
          (g) => g.id === pendingGuests[0].id,
        );
        if (updatedGuest) setGuest(updatedGuest);
      } else if (selectedGuests.length > 0) {
        // Bulk Flow: Update selectedGuests to reflect new states
        setSelectedGuests((current) =>
          current.map((g) => {
            const confirmed = updatedConfirmedGuests.find((c) => c.id === g.id);
            if (confirmed) {
              return confirmed;
            }
            return g;
          }),
        );
      }

      setPendingGuests([]);
      setErrorDetail(null);
      loadGuests(); // Refresh list in background
    } catch (e: any) {
      console.error(e);
      setErrorDetail(e.message || "An unexpected error occurred");
      setStatus("error");
    } finally {
      setIsProcessing(false);
    }
  };

  const processGuests = async (
    guests: Guest[],
    confirmationData: {
      guestId: string;
      attendedPax: number;
      souvenirId: string | null;
    }[],
  ) => {
    try {
      setStatus("loading");

      // Check for insufficient stock before processing redemptions
      const redemptions = confirmationData.filter((conf) => {
        return conf.souvenirId;
      });

      if (redemptions.length > 0) {
        // Group by souvenirId to check total needed vs available
        const neededBySouvenir: Record<string, number> = {};
        redemptions.forEach((conf) => {
          neededBySouvenir[conf.souvenirId!] =
            (neededBySouvenir[conf.souvenirId!] || 0) + conf.attendedPax;
        });

        for (const [sId, needed] of Object.entries(neededBySouvenir)) {
          const souvenir = souvenirs.find((s) => s.id === sId);
          if (souvenir && souvenir.stock < needed) {
            throw new Error(
              `Insufficient souvenir stock for "${souvenir.name}". Need ${needed}, have ${souvenir.stock}`,
            );
          }
        }
      }

      // Determine action for each guest
      const promises = confirmationData.map((confirmation) => {
        const guest = guests.find((g) => g.id === confirmation.guestId);
        if (!guest) return Promise.resolve();

        // Determine action based on guest current status, not confirmationMode
        if (
          guest.status !== "attended" &&
          guest.status !== "souvenir_delivered"
        ) {
          // Perform Check-in
          return supabaseGuestService.updateGuestStatus(
            guest.id,
            "attended",
            undefined,
            confirmation.attendedPax,
          );
        } else if (guest.status === "attended") {
          // Perform Redemption
          if (confirmation.souvenirId) {
            return souvenirService
              .redeemSouvenir(guest.id, confirmation.souvenirId)
              .then(() =>
                supabaseGuestService.updateGuestStatus(
                  guest.id,
                  "souvenir_delivered",
                ),
              );
          } else {
            return supabaseGuestService.updateGuestStatus(
              guest.id,
              "souvenir_delivered",
            );
          }
        }
        return Promise.resolve();
      });

      await Promise.all(promises);

      // Determine successful message
      const checkedInCount = confirmationData.length;
      const redeemedCount = guests.length - checkedInCount; // Approximate

      let message = "Successfully processed guests";
      message = `Successfully processed ${guests.length} guests`;

      toast.success(message);
      setStatus("success");
      setErrorDetail(null);
      loadGuests();
    } catch (e: any) {
      console.error(e);
      setErrorDetail(e.message || "Failed to process some guests");
      toast.error(e.message || "Failed to process some guests");
      setStatus("error");
      throw e;
    }
  };

  const handleScan = async (decodedText: string) => {
    try {
      setStatus("loading");
      setErrorDetail(null);
      setScannedData(decodedText);

      let slugOrId = decodedText;

      // Handle URL if scanned (extract slug)
      if (decodedText.includes("/invitation/")) {
        slugOrId =
          decodedText.split("/invitation/").pop()?.split("?")[0] || decodedText;
      }

      // Try to parse as JSON first (original format)
      try {
        const payload = JSON.parse(decodedText);
        slugOrId = payload.slug || payload.id || slugOrId;
      } catch (e) {
        // Not JSON, slugOrId remains decodedText
      }

      await processCheckIn(slugOrId);
    } catch (e: any) {
      console.error(e);
      setErrorDetail(e.message || "Invalid QR Code");
      setStatus("error");
    } finally {
      setIsScanning(false);
    }
  };

  const processCheckIn = async (slugOrId: string) => {
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        slugOrId,
      );

    let result;
    if (isUUID) {
      result = await supabaseGuestService.getGuestById(slugOrId);
    } else {
      result = await supabaseGuestService.getGuestBySlug(slugOrId);
    }

    if (result) {
      setGuest(result);

      // 1. Attendance Scanning Logic (Slug/Link)
      if (!isUUID) {
        if (
          result.status !== "attended" &&
          result.status !== "souvenir_delivered"
        ) {
          // Open Confirmation Dialog for CHECK-IN
          setPendingGuests([result]);
          setConfirmationMode("check-in");
          setIsConfirmationOpen(true);
        } else if (
          result.status === "attended" ||
          result.status === "souvenir_delivered"
        ) {
          setErrorDetail(null);
          setStatus("already_checked");
        } else {
          setErrorDetail("Invalid guest status for check-in");
          setStatus("error");
        }
      }
      // 2. Souvenir Scanning Logic (UUID/Voucher)
      else {
        if (result.status === "attended") {
          // Open Confirmation Dialog for REDEMPTION
          setPendingGuests([result]);
          setConfirmationMode("redemption");
          setIsConfirmationOpen(true);
        } else if (result.status === "souvenir_delivered") {
          setErrorDetail(null);
          setStatus("already_checked");
        } else {
          // e.g. Trying to redeem souvenir before check-in or declined status
          setErrorDetail("Guest must check-in at the entrance first!");
          setStatus("error");
          toast.error("Guest must check-in at the entrance first!");
        }
      }
    } else {
      setErrorDetail("Guest not found or inactive");
      setStatus("error");
    }
  };

  const reset = () => {
    setScannedData(null);
    setGuest(null);
    setStatus("idle");
    setErrorDetail(null);
    setIsScanning(true);
    setSearchQuery("");
    setSelectedGuests([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!canView && !canScan && !canManual) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-500">
            You don't have permission to perform check-in actions. Please
            contact the event owner.
          </p>
          <Button
            onClick={() => (window.location.href = "/dashboard/events")}
            className="w-full"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard resource="check_in" action="view" redirectTo="/restricted">
      <div className="min-h-screen bg-gray-50/50 flex flex-col items-center py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-2">
              <QrCode className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Staff Check-in & Redemption
            </h1>
            <p className="text-gray-500">
              Scan guest QR code for check-in or souvenir redemption
            </p>
          </div>

          {status === "idle" || status === "loading" ? (
            <div className="bg-white p-6 rounded-[2rem] shadow-[0_2px_40px_-12px_rgba(0,0,0,0.08)] space-y-6">
              {canScan ? (
                <div className="overflow-hidden rounded-3xl border border-gray-100 shadow-inner bg-black">
                  <QRScanner
                    onScan={handleScan}
                    isScanning={isScanning}
                    setIsScanning={setIsScanning}
                  />
                </div>
              ) : (
                <div className="bg-gray-50 rounded-2xl p-8 text-center border-2 border-dashed border-gray-200">
                  <QrCode className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-400">
                    QR Scanning disabled
                  </p>
                </div>
              )}

              {canManual && (
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-100" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase tracking-wider">
                      <span className="bg-white px-2 text-gray-400 font-semibold">
                        Or search manually
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4" ref={searchContainerRef}>
                    <div className="relative">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search name or code..."
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowResults(true);
                          }}
                          onFocus={() => setShowResults(true)}
                          className="pl-9 rounded-2xl bg-gray-50 border-gray-200 focus:bg-white transition-all h-12"
                        />
                      </div>

                      {showResults && filteredGuests.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                          <ScrollArea className="max-h-64">
                            <div className="p-2 space-y-1">
                              {filteredGuests.map((g) => {
                                const isSelected = selectedGuests.some(
                                  (sg) => sg.id === g.id,
                                );
                                const isAlreadyRedeemed =
                                  g.status === "souvenir_delivered";

                                return (
                                  <div
                                    key={g.id}
                                    onClick={() =>
                                      !isAlreadyRedeemed && toggleGuestSelect(g)
                                    }
                                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                                      isSelected
                                        ? "bg-blue-50 text-blue-700"
                                        : isAlreadyRedeemed
                                          ? "opacity-50 cursor-not-allowed bg-gray-50"
                                          : "hover:bg-gray-50"
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                          isSelected
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-100 text-gray-500"
                                        }`}
                                      >
                                        {isSelected ? (
                                          <Check className="w-4 h-4" />
                                        ) : (
                                          g.name.charAt(0)
                                        )}
                                      </div>
                                      <div>
                                        <p className="font-semibold text-sm">
                                          {g.name}
                                        </p>
                                        <p className="text-[10px] opacity-70">
                                          {g.pax_count} Pax • {g.category}
                                        </p>
                                      </div>
                                    </div>
                                    {(g.status === "attended" ||
                                      g.status === "souvenir_delivered" ||
                                      g.status === "declined") && (
                                      <Badge
                                        variant="outline"
                                        className={`text-[10px] ${
                                          g.status === "souvenir_delivered"
                                            ? "bg-purple-50 text-purple-700 border-purple-100"
                                            : g.status === "attended"
                                              ? "bg-green-50 text-green-700 border-green-100"
                                              : "bg-red-50 text-red-700 border-red-100"
                                        }`}
                                      >
                                        {g.status === "souvenir_delivered"
                                          ? "Souvenir Redeemed"
                                          : g.status === "attended"
                                            ? "Attended"
                                            : "Declined"}
                                      </Badge>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </ScrollArea>
                        </div>
                      )}
                    </div>

                    {selectedGuests.length > 0 && (
                      <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                            Selected ({selectedGuests.length})
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedGuests([])}
                            className="h-7 text-[10px] text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                          >
                            Clear All
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedGuests.map((g) => (
                            <Badge
                              key={g.id}
                              className="bg-white text-blue-700 border-blue-200 hover:bg-blue-50 cursor-pointer"
                              onClick={() => toggleGuestSelect(g)}
                            >
                              {g.name}
                              <XCircle className="w-3 h-3 ml-1" />
                            </Badge>
                          ))}
                        </div>
                        <Button
                          onClick={handleBulkCheckIn}
                          className="w-full mt-4 h-11 bg-primary hover:bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                        >
                          {status === "loading" ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                          {(() => {
                            const hasRedemption = selectedGuests.some(
                              (g) => g.status === "attended",
                            );
                            const hasCheckIn = selectedGuests.some(
                              (g) => g.status !== "attended",
                            );
                            if (hasRedemption && hasCheckIn)
                              return "Check-in & Redeem Selected";
                            if (hasRedemption)
                              return "Redeem Selected Souvenirs";
                            return "Check-in Selected Guests";
                          })()}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Card
              className={`border-2 ${
                status === "success"
                  ? "bg-green-50 border-green-100"
                  : "bg-red-50 border-red-100"
              } shadow-none rounded-[2rem] overflow-hidden`}
            >
              <CardHeader className="text-center pb-2 pt-8">
                <div className="mx-auto mb-4">
                  {status === "success" ? (
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-in zoom-in duration-300">
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto animate-in zoom-in duration-300">
                      <XCircle className="w-8 h-8 text-red-600" />
                    </div>
                  )}
                </div>
                <CardTitle
                  className={`text-2xl font-bold ${
                    status === "success" ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {status === "success"
                    ? guest
                      ? guest.status === "souvenir_delivered"
                        ? "Souvenir Redeemed"
                        : "Check-in Successful"
                      : (() => {
                          if (confirmationMode === "combined")
                            return "Check-in & Redemption Successful";
                          if (confirmationMode === "redemption")
                            return "Bulk Redemption Successful";
                          return "Bulk Check-in Successful";
                        })()
                    : (() => {
                        if (confirmationMode === "combined")
                          return "Process Failed";
                        if (confirmationMode === "redemption")
                          return "Redemption Failed";
                        return "Check-in Failed";
                      })()}
                </CardTitle>
                {status === "error" && errorDetail && (
                  <p className="text-red-500 text-sm font-medium mt-1 animate-in fade-in slide-in-from-top-1 duration-300">
                    {errorDetail}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-6 pb-8 text-center px-8">
                {guest || selectedGuests.length > 0 ? (
                  <div className="bg-white/60 rounded-2xl p-3 backdrop-blur-sm space-y-4">
                    {(() => {
                      const guestsToShow = guest
                        ? [guest]
                        : [...selectedGuests].sort((a, b) =>
                            a.name.localeCompare(b.name),
                          );

                      const GuestCard = ({ g }: { g: Guest }) => (
                        <div
                          key={g.id}
                          className="bg-white/80 rounded-xl p-4 border border-gray-100 flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="p-2 rounded-full flex-shrink-0 bg-blue-50">
                              <User className="w-4 h-4 text-blue-500" />
                            </div>
                            <div className="min-w-0 flex-1 text-left">
                              <p className="font-semibold text-sm truncate text-gray-900 leading-tight">
                                {g.name}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                <span className="text-[10px] text-gray-400 capitalize truncate max-w-[80px]">
                                  {g.category}
                                </span>
                                <span className="w-1 h-1 bg-gray-200 rounded-full flex-shrink-0" />
                                <span className="text-[10px] text-blue-500 font-medium whitespace-nowrap">
                                  Invited: {g.pax_count} pax
                                </span>
                                <span className="w-1 h-1 bg-gray-200 rounded-full flex-shrink-0" />
                                <span className="text-[10px] text-green-600 font-bold whitespace-nowrap">
                                  Attended: {g.attended_pax || 0} pax
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-[9px] font-bold uppercase tracking-tighter h-5 px-1.5 border-green-200 bg-green-50 text-green-600 ml-2 shadow-sm whitespace-nowrap"
                          >
                            {g.status === "souvenir_delivered"
                              ? "Redeemed"
                              : "Checked-in"}
                          </Badge>
                        </div>
                      );

                      return (
                        <div className="space-y-4">
                          {!guest && (
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                              Processed Guests ({selectedGuests.length})
                            </p>
                          )}

                          <ScrollArea className="max-h-[340px]">
                            <div className="space-y-3">
                              {guestsToShow.map((g) => (
                                <GuestCard key={g.id} g={g} />
                              ))}
                            </div>
                          </ScrollArea>

                          {!guest && (
                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200/50">
                              <div className="text-center">
                                <p className="text-[10px] font-bold text-gray-400 uppercase">
                                  Total Attended
                                </p>
                                <p className="text-lg font-black text-green-700">
                                  {selectedGuests
                                    .filter((g) => g.status === "attended")
                                    .reduce(
                                      (acc, g) => acc + (g.attended_pax || 0),
                                      0,
                                    )}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-[10px] font-bold text-gray-400 uppercase">
                                  Total Redeemed
                                </p>
                                <p className="text-lg font-black text-purple-700">
                                  {selectedGuests
                                    .filter(
                                      (g) => g.status === "souvenir_delivered",
                                    )
                                    .reduce(
                                      (acc, g) => acc + (g.attended_pax || 0),
                                      0,
                                    )}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {status === "already_checked" && (
                      <p className="text-red-500 text-sm font-medium pt-2 text-center">
                        {guest?.status === "souvenir_delivered"
                          ? "Warning: Souvenir already redeemed!"
                          : "Warning: Guest already checked in/not confirmed!"}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-red-600 font-medium">
                    Guest not found in database.
                  </p>
                )}

                <Button
                  className={`w-full h-12 rounded-xl text-lg shadow-lg ${
                    status === "success"
                      ? "bg-green-600 hover:bg-green-700 shadow-green-600/20"
                      : "bg-red-600 hover:bg-red-700 shadow-red-600/20"
                  }`}
                  onClick={reset}
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Scan Next Guest
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <CheckInConfirmationDialog
          isOpen={isConfirmationOpen}
          onOpenChange={setIsConfirmationOpen}
          guests={pendingGuests}
          souvenirs={souvenirs}
          mode={confirmationMode}
          onConfirm={handleConfirmCheckIn}
          isLoading={isProcessing}
        />
      </div>
    </PermissionGuard>
  );
}
