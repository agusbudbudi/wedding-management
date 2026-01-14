"use client";

import { cn } from "@/lib/utils";
import {
  UserCog,
  Mail,
  Trash2,
  ShieldCheck,
  UserCheck,
  CalendarDays,
} from "lucide-react";
import { useState, useEffect } from "react";
import { EventStaff } from "@/lib/types";
import { supabaseStaffService } from "@/lib/services/staff-service";
import { AddStaffDialog } from "@/components/features/staff/add-staff-dialog";
import { RolesPermissionsTab } from "@/components/features/staff/roles-permissions-tab";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { redirect } from "next/navigation";

export default function StaffPage() {
  const [staff, setStaff] = useState<EventStaff[]>([]);
  const [staffToDelete, setStaffToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const activeEventId =
    typeof window !== "undefined"
      ? localStorage.getItem("active_event_id")
      : null;
  const { role, loading: permissionsLoading } = usePermissions();

  useEffect(() => {
    if (activeEventId) {
      fetchStaff();
    }
  }, [activeEventId]);

  const fetchStaff = async () => {
    if (!activeEventId) return;
    try {
      const data = await supabaseStaffService.getEventStaff(activeEventId);
      setStaff(data);
    } catch (error) {
      console.error("Error fetching staff:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (staffId: string) => {
    setStaffToDelete(staffId);
  };

  const confirmRemove = async () => {
    if (!staffToDelete) return;

    try {
      await supabaseStaffService.removeStaff(staffToDelete);
      toast.success("Staff removed successfully");
      setStaffToDelete(null);
      fetchStaff();
    } catch (error) {
      toast.error("Failed to remove staff");
    }
  };

  // Check permissions - only owners can access this management page
  if (!permissionsLoading && role !== "owner") {
    redirect("/dashboard");
  }

  if (loading || permissionsLoading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-gray-100 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-50 rounded-[2rem]" />
          ))}
        </div>
      </div>
    );
  }

  if (!activeEventId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="p-4 bg-blue-50 rounded-full">
          <CalendarDays className="w-8 h-8 text-blue-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">No Active Event</h2>
        <p className="text-gray-500 max-w-sm text-center">
          Please select or create an event first to manage its staff.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Staff Management
          </h1>
          <p className="text-gray-500 mt-1">
            Manage team members, roles, and permissions for your event.
          </p>
        </div>
      </div>

      <Tabs defaultValue="staff" className="space-y-4">
        <TabsList className="grid w-sm max-w-md grid-cols-2 bg-white border border-gray-100 p-1.5 rounded-xl h-auto">
          <TabsTrigger
            value="staff"
            className="rounded-lg py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 transition-all duration-300 text-gray-500 font-medium"
          >
            Staff Members
          </TabsTrigger>
          <TabsTrigger
            value="roles"
            className="rounded-lg py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 transition-all duration-300 text-gray-500 font-medium"
          >
            Roles & Permissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="staff" className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-500">
              Assign team members to help manage your event.
            </p>
            <AddStaffDialog eventId={activeEventId} onSuccess={fetchStaff} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staff.length > 0 ? (
              staff.map((member) => (
                <Card
                  key={member.id}
                  className="group relative overflow-hidden rounded-[2rem] border-none shadow-[0_2px_40px_-12px_rgba(0,0,0,0.08)] hover:shadow-xl transition-all duration-300 bg-white"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <ShieldCheck className="w-24 h-24" />
                  </div>
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className="p-3 bg-blue-50 rounded-2xl group-hover:bg-blue-600 transition-colors duration-300">
                        <UserCheck className="w-6 h-6 text-blue-600 group-hover:text-white" />
                      </div>
                      <Badge
                        className={cn(
                          "rounded-full px-4 py-1 font-bold text-[10px] uppercase tracking-wider",
                          member.assigned_role
                            ? "bg-blue-50 text-blue-700"
                            : member.role === "check_in"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-purple-50 text-purple-700"
                        )}
                      >
                        {member.assigned_role?.name ||
                          (member.role === "check_in"
                            ? "Check-In Staff"
                            : "Seating Coordinator")}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900 truncate">
                        {member.profile?.full_name || "New Staff Member"}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1 text-gray-400 font-medium">
                        <Mail className="w-3.5 h-3.5" />
                        {member.profile?.email}
                      </CardDescription>
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-gray-50">
                      <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                        Joined{" "}
                        {new Date(member.created_at!).toLocaleDateString()}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(member.id)}
                        className="h-9 w-9 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-gray-100 animate-in fade-in zoom-in duration-700">
                <div className="bg-blue-50 p-6 rounded-full mb-6">
                  <UserCog className="w-12 h-12 text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  No Staff Assigned Yet
                </h2>
                <p className="text-gray-500 mb-8 text-center max-w-sm">
                  Get started by inviting team members to help manage your
                  event.
                </p>
                <AddStaffDialog
                  eventId={activeEventId}
                  onSuccess={fetchStaff}
                />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="roles">
          <RolesPermissionsTab eventId={activeEventId} />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!staffToDelete}
        onOpenChange={(open) => !open && setStaffToDelete(null)}
      >
        <DialogContent className="max-w-md rounded-[2rem] border-none shadow-2xl p-6 text-left">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Remove Staff Member?
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-gray-500">
              Are you sure you want to remove this staff member? They will lose
              access to this event.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setStaffToDelete(null)}
              className="rounded-xl font-bold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmRemove}
              className="rounded-xl font-bold shadow-lg shadow-red-100 cursor-pointer"
            >
              Remove Staff
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
