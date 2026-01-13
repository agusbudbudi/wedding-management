"use client";

import { useState, useEffect } from "react";
import { supabaseRoleService } from "@/lib/services/role-service";
import { RoleWithPermissions, Permission } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Plus, Pencil, Trash2, Lock } from "lucide-react";
import { toast } from "sonner";
import { RoleDialog } from "./role-dialog";

interface RolesPermissionsTabProps {
  eventId: string;
}

export function RolesPermissionsTab({ eventId }: RolesPermissionsTabProps) {
  const [roles, setRoles] = useState<RoleWithPermissions[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleWithPermissions | null>(
    null
  );
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [eventId]);

  const loadData = async () => {
    try {
      const [rolesData, permsData] = await Promise.all([
        supabaseRoleService.getRolesByEvent(eventId),
        supabaseRoleService.getAvailablePermissions(),
      ]);
      setRoles(rolesData);
      setPermissions(permsData);
    } catch (error) {
      console.error("Error loading roles:", error);
      toast.error("Failed to load roles and permissions");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (role: RoleWithPermissions) => {
    if (role.is_system_role) {
      toast.error("Cannot edit system roles");
      return;
    }
    setEditingRole(role);
    setDialogOpen(true);
  };

  const handleDelete = async (roleId: string, isSystemRole: boolean) => {
    if (isSystemRole) {
      toast.error("Cannot delete system roles");
      return;
    }
    setRoleToDelete(roleId);
  };

  const confirmDelete = async () => {
    if (!roleToDelete) return;

    try {
      await supabaseRoleService.deleteRole(roleToDelete);
      toast.success("Role deleted successfully");
      setRoleToDelete(null);
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete role");
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingRole(null);
  };

  const handleSuccess = () => {
    loadData();
    handleDialogClose();
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-gray-50 rounded-[2rem]" />
        ))}
      </div>
    );
  }

  // Group permissions by resource
  const permissionsByResource = permissions.reduce((acc, perm) => {
    if (!acc[perm.resource]) {
      acc[perm.resource] = [];
    }
    acc[perm.resource].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-500">
          Create custom roles and assign specific permissions for your event
          team.
        </p>
        <Button
          onClick={() => {
            setEditingRole(null);
            setDialogOpen(true);
          }}
          className="bg-primary shadow-lg shadow-blue-500/30"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Role
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <Card
            key={role.id}
            className="group relative overflow-hidden rounded-[2rem] border-none shadow-[0_2px_40px_-12px_rgba(0,0,0,0.08)] hover:shadow-xl transition-all duration-300 bg-white"
          >
            {role.is_system_role && (
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Lock className="w-24 h-24" />
              </div>
            )}
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-blue-50 rounded-2xl group-hover:bg-blue-600 transition-colors duration-300">
                  <Shield className="w-6 h-6 text-blue-600 group-hover:text-white" />
                </div>
                <Badge
                  className={`rounded-full px-4 py-1 font-bold text-[10px] uppercase tracking-wider ${
                    role.is_system_role
                      ? "bg-purple-50 text-purple-700"
                      : "bg-blue-50 text-blue-700"
                  }`}
                >
                  {role.is_system_role ? "System Role" : "Custom Role"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  {role.name}
                </CardTitle>
                <CardDescription className="mt-1 text-gray-400 font-medium">
                  {role.description || "No description"}
                </CardDescription>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Permissions ({role.permissions.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.slice(0, 3).map((perm) => (
                    <Badge
                      key={perm.id}
                      variant="outline"
                      className="text-[10px] rounded-full"
                    >
                      {perm.display_name}
                    </Badge>
                  ))}
                  {role.permissions.length > 3 && (
                    <Badge
                      variant="outline"
                      className="text-[10px] rounded-full"
                    >
                      +{role.permissions.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {!role.is_system_role && (
                <div className="pt-4 flex items-center gap-2 border-t border-gray-50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(role)}
                    className="flex-1 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(role.id, role.is_system_role)}
                    className="flex-1 rounded-xl text-gray-600 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <RoleDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        eventId={eventId}
        role={editingRole}
        permissions={permissions}
        permissionsByResource={permissionsByResource}
        onSuccess={handleSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!roleToDelete}
        onOpenChange={(open) => !open && setRoleToDelete(null)}
      >
        <DialogContent className="max-w-md rounded-[2rem] border-none shadow-2xl p-6 text-left">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Delete Role?
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-gray-500">
              Are you sure you want to delete this role? This action cannot be
              undone.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setRoleToDelete(null)}
              className="rounded-xl font-bold cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="rounded-xl font-bold shadow-lg shadow-red-100 cursor-pointer"
            >
              Delete Role
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
