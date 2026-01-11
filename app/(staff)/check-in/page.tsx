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
  Check,
  Loader2,
  Lock,
  Gift,
} from "lucide-react";
import { QRScanner } from "@/components/features/qr-scanner";
import { supabaseGuestService } from "@/lib/services/guest-service";
import { Guest } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { usePermissions } from "@/lib/hooks/use-permissions";

export default function CheckInPage() {
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error" | "already_checked"
  >("idle");
  const [isScanning, setIsScanning] = useState(true);

  // Manual search & selection
  const [allGuests, setAllGuests] = useState<Guest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGuests, setSelectedGuests] = useState<Guest[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const { hasPermission, loading } = usePermissions();

  const canView = hasPermission("check_in", "view");
  const canScan = hasPermission("check_in", "scan");
  const canManual = hasPermission("check_in", "manual");

  useEffect(() => {
    loadGuests();

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
    const eventId = localStorage.getItem("active_event_id");
    const data = await supabaseGuestService.getGuests(eventId || undefined);
    setAllGuests(data);
  };

  const filteredGuests =
    searchQuery.trim() === ""
      ? []
      : allGuests
          .filter(
            (g) =>
              g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              g.slug.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 10);

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

    try {
      setStatus("loading");
      const promises = selectedGuests.map((g) => {
        // If guest is already attended, they are being selected for souvenir redemption
        const nextStatus =
          g.status === "attended" ? "souvenir_delivered" : "attended";
        return supabaseGuestService.updateGuestStatus(g.id, nextStatus);
      });
      await Promise.all(promises);

      const hasRedemption = selectedGuests.some((g) => g.status === "attended");
      const hasCheckIn = selectedGuests.some((g) => g.status !== "attended");
      let message = "Successfully processed guests";
      if (hasRedemption && !hasCheckIn)
        message = `Successfully redeemed ${selectedGuests.length} souvenirs`;
      if (!hasRedemption && hasCheckIn)
        message = `Successfully checked in ${selectedGuests.length} guests`;

      toast.success(message);
      setStatus("success");
      // Refresh local data
      loadGuests();
    } catch (e) {
      console.error(e);
      toast.error("Failed to process some guests");
      setStatus("error");
    }
  };

  const handleScan = async (decodedText: string) => {
    try {
      setStatus("loading");
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
        // Not JSON
      }

      await processCheckIn(slugOrId);
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  };

  const processCheckIn = async (slugOrId: string) => {
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        slugOrId
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
        if (["confirmed", "sent", "viewed"].includes(result.status)) {
          await supabaseGuestService.updateGuestStatus(result.id, "attended");
          const updated = await supabaseGuestService.getGuestById(result.id);
          if (updated) setGuest(updated);
          setStatus("success");
          toast.success("Guest Checked In Successfully");
        } else if (
          result.status === "attended" ||
          result.status === "souvenir_delivered"
        ) {
          setStatus("already_checked");
        } else {
          setStatus("error");
        }
      }
      // 2. Souvenir Scanning Logic (UUID/Voucher)
      else {
        if (result.status === "attended") {
          await supabaseGuestService.updateGuestStatus(
            result.id,
            "souvenir_delivered"
          );
          const updated = await supabaseGuestService.getGuestById(result.id);
          if (updated) setGuest(updated);
          setStatus("success");
          toast.success("Souvenir Redeemed Successfully");
        } else if (result.status === "souvenir_delivered") {
          setStatus("already_checked");
        } else {
          // e.g. Trying to redeem souvenir before check-in or declined status
          setStatus("error");
          if (["confirmed", "sent", "viewed"].includes(result.status)) {
            toast.error("Guest must check-in at the entrance first!");
          }
        }
      }
    } else {
      setStatus("error");
    }
  };

  const reset = () => {
    setScannedData(null);
    setGuest(null);
    setStatus("idle");
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
                                (sg) => sg.id === g.id
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
                            (g) => g.status === "attended"
                          );
                          const hasCheckIn = selectedGuests.some(
                            (g) => g.status !== "attended"
                          );
                          if (hasRedemption && hasCheckIn)
                            return "Check-in & Redeem Selected";
                          if (hasRedemption) return "Redeem Selected Souvenirs";
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
                        const hasRedemption = selectedGuests.some(
                          (g) => g.status === "attended"
                        );
                        const hasCheckIn = selectedGuests.some(
                          (g) => g.status !== "attended"
                        );
                        if (hasRedemption && hasCheckIn)
                          return "Check-in & Redemption Successful";
                        if (hasRedemption) return "Bulk Redemption Successful";
                        return "Bulk Check-in Successful";
                      })()
                  : /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
                      scannedData || ""
                    )
                  ? "Redeem Failed"
                  : "Check-in Failed"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pb-8 text-center px-8">
              {guest || selectedGuests.length > 0 ? (
                <div className="bg-white/60 rounded-xl p-6 backdrop-blur-sm space-y-4">
                  {guest ? (
                    <div className="space-y-2">
                      <p className="font-bold text-xl text-gray-900">
                        {guest.name}
                      </p>
                      <div className="flex justify-center gap-3 text-sm font-medium text-gray-600">
                        <span className="bg-white/80 px-3 py-1 rounded-full shadow-sm">
                          {guest.pax_count} Pax
                        </span>
                        <span className="bg-white/80 px-3 py-1 rounded-full shadow-sm uppercase">
                          {guest.category}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 text-left">
                      <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest text-center">
                        {(() => {
                          const hasRedemption = selectedGuests.some(
                            (g) => g.status === "attended"
                          );
                          const hasCheckIn = selectedGuests.some(
                            (g) => g.status !== "attended"
                          );
                          if (hasRedemption && hasCheckIn)
                            return "Processed Guests";
                          if (hasRedemption) return "Redeemed Guests";
                          return "Checked-in Guests";
                        })()}
                      </p>
                      <ScrollArea className="max-h-48">
                        <div className="flex flex-wrap gap-2 justify-center">
                          {selectedGuests.map((g) => (
                            <Badge
                              key={g.id}
                              variant="secondary"
                              className="bg-green-100 text-green-700 border-green-200"
                            >
                              {g.name}
                            </Badge>
                          ))}
                        </div>
                      </ScrollArea>
                      <p className="text-center text-sm font-bold text-green-600">
                        Total:{" "}
                        {selectedGuests.reduce(
                          (acc, g) => acc + (g.pax_count || 0),
                          0
                        )}{" "}
                        Pax
                      </p>
                    </div>
                  )}

                  {status === "already_checked" && (
                    <p className="text-red-500 text-sm font-medium pt-2">
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
    </div>
  );
}
