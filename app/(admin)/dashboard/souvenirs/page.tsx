"use client";

export const runtime = "edge";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Gift, Loader2, Package, Trophy, Lock } from "lucide-react";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { souvenirService } from "@/lib/services/souvenir-service";
import { Souvenir } from "@/lib/types/souvenir";
import { SouvenirCard } from "@/components/features/souvenirs/souvenir-card";
import { SouvenirForm } from "@/components/features/souvenirs/souvenir-form";
import { toast } from "sonner";
import { exportService } from "@/lib/services/export-service";
import { ExportDropdown } from "@/components/features/export-dropdown";
import { supabaseEventService } from "@/lib/services/event-service";
import { Event } from "@/lib/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RedeemedGuestList } from "@/components/features/souvenirs/redeemed-guest-list";
import { PermissionGuard } from "@/components/auth/permission-guard";

export default function SouvenirsPage() {
  const [souvenirs, setSouvenirs] = useState<Souvenir[]>([]);
  const [redeemedGuests, setRedeemedGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventId, setEventId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Souvenir | undefined>(undefined);
  const [itemToDelete, setItemToDelete] = useState<Souvenir | null>(null);
  const [activeTab, setActiveTab] = useState("manage");
  const [activeEvent, setActiveEvent] = useState<Event | null>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const { hasPermission } = usePermissions();

  const [redemptionCounts, setRedemptionCounts] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    setHasMounted(true);
    const id = localStorage.getItem("active_event_id");
    if (id) {
      setEventId(id);
      loadSouvenirs(id);
      loadRedeemedGuests(id);
      loadEvent(id);
    } else {
      setLoading(false);
    }
  }, []);

  async function loadEvent(id: string) {
    try {
      const event = await supabaseEventService.getEventById(id);
      setActiveEvent(event);
    } catch (error) {
      console.error("Failed to load event", error);
    }
  }

  async function loadSouvenirs(id: string) {
    try {
      setLoading(true);
      const [items, redemptions] = await Promise.all([
        souvenirService.getSouvenirs(id),
        souvenirService.getSouvenirRedemptionCounts(id),
      ]);
      setSouvenirs(items);
      setRedemptionCounts(redemptions);
    } catch (error) {
      toast.error("Failed to load souvenirs");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function loadRedeemedGuests(id: string) {
    try {
      const data = await souvenirService.getRedeemedGuests(id);
      setRedeemedGuests(data);
    } catch (error) {
      console.error("Error loading redeemed guests:", error);
    }
  }

  const handleEdit = (souvenir: Souvenir) => {
    setItemToEdit(souvenir);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await souvenirService.deleteSouvenir(itemToDelete.id);
      toast.success("Souvenir deleted");
      if (eventId) {
        loadSouvenirs(eventId);
        loadRedeemedGuests(eventId);
      }
    } catch (error) {
      toast.error("Failed to delete souvenir");
    } finally {
      setItemToDelete(null);
    }
  };

  const handleFormSuccess = () => {
    if (eventId) {
      loadSouvenirs(eventId);
      loadRedeemedGuests(eventId);
    }
  };

  const handleExportRedeemedExcel = () => {
    if (redeemedGuests.length === 0) {
      toast.error("No redemption data to export");
      return;
    }
    const eventName = activeEvent?.name || "Wedding Event";
    exportService.exportRedeemedGuestsToExcel(redeemedGuests, eventName);
    toast.success("Exporting redemption Excel...");
  };

  const handleExportRedeemedPdf = () => {
    if (redeemedGuests.length === 0) {
      toast.error("No redemption data to export");
      return;
    }
    exportService.exportRedeemedGuestsToPDF(redeemedGuests, activeEvent);
    toast.success("Exporting redemption PDF...");
  };

  if (!hasMounted || loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!eventId) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <Gift className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900">No Event Selected</h2>
        <p className="text-gray-500">
          Please select an event from the dashboard.
        </p>
      </div>
    );
  }

  const totalStock = souvenirs.reduce((sum, item) => sum + item.stock, 0);
  const totalRedeemed = Object.values(redemptionCounts).reduce(
    (sum, count) => sum + count,
    0,
  );

  return (
    <PermissionGuard
      resource="souvenirs"
      action="view"
      redirectTo="/restricted"
    >
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Souvenirs</h1>
            <p className="text-gray-500 hidden md:block">
              {eventId
                ? "Manage your souvenir inventory and categories"
                : "Please select an event first"}
            </p>
          </div>
        </div>

        <Tabs
          defaultValue="manage"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <TabsList className="grid w-sm max-w-md grid-cols-2 bg-white border border-gray-100 p-1.5 rounded-xl h-auto">
              <TabsTrigger
                value="manage"
                className="rounded-lg py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 transition-all duration-300 text-gray-500 font-medium"
              >
                Manage Souvenirs
              </TabsTrigger>
              {(() => {
                const canViewRedeemed = hasPermission(
                  "souvenirs",
                  "view_redeemed",
                );
                return (
                  <TabsTrigger
                    value="redeemed"
                    disabled={!canViewRedeemed}
                    className="rounded-lg py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 transition-all duration-300 text-gray-500 font-medium group"
                  >
                    <span>Redeemed Guest</span>
                    {!canViewRedeemed && (
                      <Lock className="w-3 h-3 ml-2 inline-block text-gray-400 group-disabled:opacity-50" />
                    )}
                  </TabsTrigger>
                );
              })()}
            </TabsList>

            {activeTab === "manage" ? (
              <PermissionGuard resource="souvenirs" action="create">
                <Button
                  onClick={() => {
                    setItemToEdit(undefined);
                    setShowForm(true);
                  }}
                  className="bg-primary shadow-lg shadow-blue-500/30 hover:bg-blue-600 rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Souvenir
                </Button>
              </PermissionGuard>
            ) : (
              <PermissionGuard resource="souvenirs" action="export_report">
                <ExportDropdown
                  onExportExcel={handleExportRedeemedExcel}
                  onExportPdf={handleExportRedeemedPdf}
                />
              </PermissionGuard>
            )}
          </div>

          <TabsContent value="manage" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white border-none rounded-[2rem] shadow-[0_2px_40px_-12px_rgba(0,0,0,0.08)] relative overflow-hidden group hover:shadow-xl transition-all duration-300 col-span-1 md:col-span-2">
                <div className="absolute right-0 top-0 w-32 h-32 bg-blue-50/50 rounded-bl-[6rem] transition-transform group-hover:scale-110" />
                <CardContent className="p-6 pt-0 pb-0 relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">
                        Inventory Status
                      </h3>
                      <p className="text-xs text-gray-500">
                        Track available and redeemed items
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <p className="text-blue-600 font-bold text-[10px] uppercase tracking-wider mb-1">
                        Total Items
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {souvenirs.length}
                        </span>
                        <span className="text-sm text-gray-500 font-medium">
                          types
                        </span>
                      </div>
                    </div>

                    <div className="border-l border-gray-100 pl-6">
                      <p className="text-orange-600 font-bold text-[10px] uppercase tracking-wider mb-1">
                        Initial Stock
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {totalStock + totalRedeemed}
                        </span>
                        <span className="text-sm text-gray-500 font-medium">
                          units
                        </span>
                      </div>
                    </div>

                    <div className="border-l border-gray-100 pl-6">
                      <p className="text-purple-600 font-bold text-[10px] uppercase tracking-wider mb-1">
                        Total Redeemed
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {totalRedeemed}
                        </span>
                        <span className="text-sm text-gray-500 font-medium">
                          units
                        </span>
                      </div>
                    </div>

                    <div className="border-l border-gray-100 pl-6">
                      <p className="text-green-600 font-bold text-[10px] uppercase tracking-wider mb-1">
                        Total Remaining
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {totalStock}
                        </span>
                        <span className="text-sm text-gray-500 font-medium">
                          units
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Souvenir Performance Card */}
              <Card className="bg-white border-none rounded-[2rem] shadow-[0_2px_40px_-12px_rgba(0,0,0,0.08)] relative overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col">
                <CardHeader className="pb-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">
                        Redemption Progress
                      </h3>
                      <p className="text-xs text-gray-500">
                        Monitor distribution across items
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto max-h-[140px] p-6 pt-1 space-y-3">
                  {souvenirs.map((item) => {
                    const redeemed = redemptionCounts[item.id] || 0;
                    const initialStock = item.stock + redeemed;
                    const percentage =
                      initialStock > 0
                        ? Math.round((item.stock / initialStock) * 100)
                        : 0;

                    return (
                      <div key={item.id} className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-medium text-gray-700">
                            {item.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {item.stock} left ({percentage}%)
                          </span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              percentage < 20
                                ? "bg-red-500"
                                : percentage < 50
                                  ? "bg-amber-500"
                                  : "bg-green-500"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-400">
                          <span>{redeemed} redeemed</span>
                          <span>{initialStock} initial</span>
                        </div>
                      </div>
                    );
                  })}
                  {souvenirs.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">
                      No data available
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Souvenir Grid */}
            {souvenirs.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <Gift className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    No souvenirs yet
                  </h3>
                  <p className="text-gray-500 mb-6 text-center max-w-sm">
                    Start by adding your first souvenir item. You can track
                    stock and restrict by category.
                  </p>
                  <Button
                    onClick={() => {
                      setItemToEdit(undefined);
                      setShowForm(true);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Souvenir
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {souvenirs.map((souvenir) => (
                  <SouvenirCard
                    key={souvenir.id}
                    souvenir={souvenir}
                    onEdit={handleEdit}
                    onDelete={setItemToDelete}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <PermissionGuard resource="souvenirs" action="view_redeemed">
            <TabsContent value="redeemed" className="space-y-6">
              <RedeemedGuestList guests={redeemedGuests} />
            </TabsContent>
          </PermissionGuard>
        </Tabs>

        {/* Form Dialog */}
        <SouvenirForm
          open={showForm}
          onOpenChange={setShowForm}
          eventId={eventId}
          souvenirToEdit={itemToEdit}
          onSuccess={handleFormSuccess}
        />

        <AlertDialog
          open={!!itemToDelete}
          onOpenChange={(open) => !open && setItemToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                souvenir "{itemToDelete?.name}" and remove it from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600"
                onClick={handleDelete}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PermissionGuard>
  );
}
