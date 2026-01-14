"use client";

import { useState, useEffect } from "react";
import { Permission } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { authService } from "@/lib/services/auth-service";

export function usePermissions() {
  const [role, setRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkPermissions() {
      const activeEventId = localStorage.getItem("active_event_id");
      if (!activeEventId) {
        setRole(null);
        setPermissions([]);
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient() as any;
        const user = await authService.getUser();

        if (!user) {
          setRole(null);
          setPermissions([]);
          setLoading(false);
          return;
        }

        // Check if user is owner
        const { data: events } = await supabase
          .from("events")
          .select("user_id")
          .eq("id", activeEventId)
          .limit(1);

        const event = events && events.length > 0 ? events[0] : null;

        if (event?.user_id === user.id) {
          // Owner has all permissions
          setRole("owner");
          const { data: allPerms } = await supabase
            .from("permissions")
            .select("*");
          setPermissions(allPerms || []);
          setLoading(false);
          return;
        }

        // Check staff role and permissions
        const { data: staffData } = await supabase
          .from("event_staff")
          .select("role_id, assigned_role:roles(id, name)")
          .eq("event_id", activeEventId)
          .eq("user_id", user.id)
          .limit(1);

        const staff = staffData && staffData.length > 0 ? staffData[0] : null;

        if (staff?.role_id) {
          // Fetch permissions for this role
          const { data: rolePerms } = await supabase
            .from("role_permissions")
            .select("permissions(*)")
            .eq("role_id", staff.role_id);

          setRole(staff.assigned_role?.name || "staff");
          setPermissions((rolePerms || []).map((rp: any) => rp.permissions));
        } else {
          setRole(null);
          setPermissions([]);
        }
      } catch (error) {
        console.error("Error checking permissions:", error);
        setRole(null);
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    }

    checkPermissions();

    // Listen for event changes
    window.addEventListener("storage", checkPermissions);
    window.addEventListener("active-event-changed", checkPermissions);

    return () => {
      window.removeEventListener("storage", checkPermissions);
      window.removeEventListener("active-event-changed", checkPermissions);
    };
  }, []);

  const hasPermission = (resource: string, action: string) => {
    if (role === "owner") return true;
    return permissions.some(
      (p) => p.resource === resource && p.action === action
    );
  };

  const canAccess = (menu: string) => {
    // Events menu is always accessible
    if (menu === "Events") return true;

    // Owner has access to everything
    if (role === "owner") return true;

    // No role = no access
    if (!role) return false;

    // Check permissions based on menu
    const menuPermissionMap: Record<
      string,
      { resource: string; action: string }
    > = {
      Dashboard: { resource: "dashboard", action: "view" },
      "Guest List": { resource: "guest_list", action: "view" },
      Seating: { resource: "seating", action: "view" },
      "Check-in Tool": { resource: "check_in", action: "view" },
      Invitations: { resource: "invitations", action: "view" },
      "Staff Event": { resource: "staff", action: "view" },
      Settings: { resource: "events", action: "edit" },
    };

    const permCheck = menuPermissionMap[menu];
    if (!permCheck) return false;

    return hasPermission(permCheck.resource, permCheck.action);
  };

  return { role, permissions, loading, canAccess, hasPermission };
}
