"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { RoleWithPermissions, Permission } from "@/lib/types";
import { supabaseRoleService } from "@/lib/services/role-service";
import { toast } from "sonner";

interface RoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  role: RoleWithPermissions | null;
  permissions: Permission[];
  permissionsByResource: Record<string, Permission[]>;
  onSuccess: () => void;
}

export function RoleDialog({
  open,
  onOpenChange,
  eventId,
  role,
  permissions,
  permissionsByResource,
  onSuccess,
}: RoleDialogProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description || "");
      setSelectedPermissions(new Set(role.permissions.map((p) => p.id)));
    } else {
      setName("");
      setDescription("");
      const mandatoryPerms = permissions.filter(
        (p) =>
          (p.resource === "events" && p.action === "view") ||
          (p.resource === "dashboard" && p.action === "view")
      );
      setSelectedPermissions(new Set(mandatoryPerms.map((p) => p.id)));
    }
  }, [role, open, permissions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (role) {
        // Update existing role
        await supabaseRoleService.updateRole(role.id, { name, description });
        await supabaseRoleService.updateRolePermissions(
          role.id,
          Array.from(selectedPermissions)
        );
        toast.success("Role updated successfully");
      } else {
        // Create new role
        const newRole = await supabaseRoleService.createRole(
          eventId,
          name,
          description
        );
        await supabaseRoleService.updateRolePermissions(
          newRole.id,
          Array.from(selectedPermissions)
        );
        toast.success("Role created successfully");
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to save role");
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (permissionId: string) => {
    const perm = permissions.find((p) => p.id === permissionId);
    if (
      (perm?.resource === "events" && perm?.action === "view") ||
      (perm?.resource === "dashboard" && perm?.action === "view")
    )
      return;

    const newSet = new Set(selectedPermissions);
    if (newSet.has(permissionId)) {
      newSet.delete(permissionId);
    } else {
      newSet.add(permissionId);
    }
    setSelectedPermissions(newSet);
  };

  const toggleAllInResource = (resource: string) => {
    const resourcePerms = permissionsByResource[resource] || [];
    const allSelected = resourcePerms.every((p) =>
      selectedPermissions.has(p.id)
    );

    const newSet = new Set(selectedPermissions);
    if (allSelected) {
      resourcePerms.forEach((p) => newSet.delete(p.id));
    } else {
      resourcePerms.forEach((p) => newSet.add(p.id));
    }
    setSelectedPermissions(newSet);
  };

  const formatResourceName = (resource: string) => {
    return resource
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-fit max-h-[85vh] p-0 gap-0 overflow-hidden flex flex-col">
        <div className="p-6 pb-4 border-b flex-none">
          <DialogHeader>
            <DialogTitle>{role ? "Edit Role" : "Create New Role"}</DialogTitle>
            <DialogDescription>
              {role
                ? "Update role details and permissions"
                : "Create a custom role with specific permissions for your event team"}
            </DialogDescription>
          </DialogHeader>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden min-h-0"
        >
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Role Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Event Coordinator"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this role is responsible for..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-4">
                <Label>Permissions</Label>
                <div className="border rounded-xl p-4 space-y-4">
                  {Object.entries(permissionsByResource).map(
                    ([resource, perms]) => {
                      const allSelected = perms.every((p) =>
                        selectedPermissions.has(p.id)
                      );
                      const someSelected = perms.some((p) =>
                        selectedPermissions.has(p.id)
                      );

                      return (
                        <div key={resource} className="space-y-2">
                          <div className="flex items-center space-x-2 pb-2 border-b">
                            <Checkbox
                              id={`resource-${resource}`}
                              checked={allSelected}
                              disabled={
                                resource === "events" ||
                                resource === "dashboard"
                              }
                              onCheckedChange={() =>
                                toggleAllInResource(resource)
                              }
                              className={
                                someSelected && !allSelected
                                  ? "data-[state=checked]:bg-blue-600"
                                  : ""
                              }
                            />
                            <Label
                              htmlFor={`resource-${resource}`}
                              className="font-bold text-sm cursor-pointer"
                            >
                              {formatResourceName(resource)}
                            </Label>
                          </div>
                          <div className="pl-6 space-y-2">
                            {perms.map((perm) => (
                              <div
                                key={perm.id}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={perm.id}
                                  checked={selectedPermissions.has(perm.id)}
                                  disabled={
                                    (perm.resource === "events" &&
                                      perm.action === "view") ||
                                    (perm.resource === "dashboard" &&
                                      perm.action === "view")
                                  }
                                  onCheckedChange={() =>
                                    togglePermission(perm.id)
                                  }
                                />
                                <Label
                                  htmlFor={perm.id}
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  {perm.display_name}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t bg-gray-50/50 flex-none">
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {role ? "Update Role" : "Create Role"}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
