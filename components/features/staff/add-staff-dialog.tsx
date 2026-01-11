"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Loader2 } from "lucide-react";
import { Role } from "@/lib/types";
import { supabaseStaffService } from "@/lib/services/staff-service";
import { supabaseRoleService } from "@/lib/services/role-service";
import { toast } from "sonner";

interface AddStaffDialogProps {
  eventId: string;
  onSuccess: () => void;
}

export function AddStaffDialog({ eventId, onSuccess }: AddStaffDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    if (open) {
      loadRoles();
    } else {
      // Reset form when dialog closes
      setEmail("");
      setRoleId("");
      setLoadingRoles(true);
    }
  }, [open, eventId]);

  const loadRoles = async () => {
    try {
      const rolesData = await supabaseRoleService.getRolesByEvent(eventId);
      // Filter out Owner role - can't assign owner role to staff
      const nonOwnerRoles = rolesData.filter((r) => r.name !== "Owner");
      setRoles(nonOwnerRoles);
      // Only set default role if roleId is empty (first time opening)
      if (nonOwnerRoles.length > 0 && roleId === "") {
        setRoleId(nonOwnerRoles[0].id);
      }
    } catch (error) {
      console.error("Error loading roles:", error);
      toast.error("Failed to load roles");
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await supabaseStaffService.addStaffByRoleId(eventId, email, roleId);
      toast.success("Staff added successfully");
      setEmail("");
      setRoleId(roles[0]?.id || "");
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to add staff");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary shadow-lg shadow-blue-500/30">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Staff
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Staff Member</DialogTitle>
          <DialogDescription>
            Find existing users by email and assign them a role for this event.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="staff@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Select Role</Label>
              {loadingRoles ? (
                <div className="h-10 bg-gray-50 rounded-md animate-pulse" />
              ) : roles.length > 0 ? (
                <Select value={roleId} onValueChange={setRoleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{role.name}</span>
                          {role.description && (
                            <span className="text-xs text-gray-500">
                              {role.description}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-md">
                  No roles available. Please create a role first in the Roles &
                  Permissions tab.
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={loading || roles.length === 0}
              className="w-full"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Staff Member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
