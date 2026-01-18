import { createClient } from "@/lib/supabase/client";
import { Role, Permission, RoleWithPermissions } from "@/lib/types";

export interface RoleService {
  getRolesByEvent: (eventId: string) => Promise<RoleWithPermissions[]>;
  createRole: (
    eventId: string,
    name: string,
    description?: string
  ) => Promise<Role>;
  updateRole: (
    roleId: string,
    data: { name?: string; description?: string }
  ) => Promise<Role>;
  deleteRole: (roleId: string) => Promise<void>;
  getRolePermissions: (roleId: string) => Promise<Permission[]>;
  updateRolePermissions: (
    roleId: string,
    permissionIds: string[]
  ) => Promise<void>;
  getAvailablePermissions: () => Promise<Permission[]>;
}

export const supabaseRoleService: RoleService = {
  async getRolesByEvent(eventId: string) {
    const supabase = createClient() as any;

    const { data: roles, error: rolesError } = await supabase
      .from("roles")
      .select("*, creator_profile:profiles!roles_created_by_fkey(*)")
      .eq("event_id", eventId)
      .order("is_system_role", { ascending: false })
      .order("name");

    if (rolesError) {
      console.error("Error fetching roles:", rolesError);
      throw rolesError;
    }

    // Fetch permissions for each role
    const rolesWithPermissions = await Promise.all(
      (roles || []).map(async (role: Role) => {
        const { data: rolePerms } = await supabase
          .from("role_permissions")
          .select("permission_id, permissions(*)")
          .eq("role_id", role.id);

        return {
          ...role,
          permissions: (rolePerms || []).map((rp: any) => rp.permissions),
        };
      })
    );

    return rolesWithPermissions as RoleWithPermissions[];
  },

  async createRole(eventId: string, name: string, description?: string) {
    const supabase = createClient() as any;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("roles")
      .insert([
        {
          event_id: eventId,
          name,
          description,
          is_system_role: false,
          created_by: user?.id,
        },
      ])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as Role;
  },

  async updateRole(
    roleId: string,
    data: { name?: string; description?: string }
  ) {
    const supabase = createClient() as any;

    const { data: updated, error } = await supabase
      .from("roles")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", roleId)
      .eq("is_system_role", false) // Prevent updating system roles
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!updated) throw new Error("Cannot update system roles");
    return updated as Role;
  },

  async deleteRole(roleId: string) {
    const supabase = createClient() as any;

    // Check if role is assigned to any staff
    const { data: staffCount } = await supabase
      .from("event_staff")
      .select("id", { count: "exact", head: true })
      .eq("role_id", roleId);

    if (staffCount && staffCount > 0) {
      throw new Error(
        "Cannot delete role that is assigned to staff members. Please reassign or remove staff first."
      );
    }

    const { error } = await supabase
      .from("roles")
      .delete()
      .eq("id", roleId)
      .eq("is_system_role", false); // Prevent deleting system roles

    if (error) throw error;
  },

  async getRolePermissions(roleId: string) {
    const supabase = createClient() as any;

    const { data, error } = await supabase
      .from("role_permissions")
      .select("permissions(*)")
      .eq("role_id", roleId);

    if (error) {
      console.error("Error fetching role permissions:", error);
      throw error;
    }

    return (data || []).map((rp: any) => rp.permissions) as Permission[];
  },

  async updateRolePermissions(roleId: string, permissionIds: string[]) {
    const supabase = createClient() as any;

    // Check if role is a system role
    const { data: role } = await supabase
      .from("roles")
      .select("is_system_role")
      .eq("id", roleId)
      .maybeSingle();

    if (role?.is_system_role) {
      throw new Error("Cannot modify permissions for system roles");
    }

    // Delete existing permissions
    await supabase.from("role_permissions").delete().eq("role_id", roleId);

    // Insert new permissions
    if (permissionIds.length > 0) {
      const { error } = await supabase.from("role_permissions").insert(
        permissionIds.map((permissionId) => ({
          role_id: roleId,
          permission_id: permissionId,
        }))
      );

      if (error) throw error;
    }
  },

  async getAvailablePermissions() {
    const supabase = createClient() as any;

    const { data, error } = await supabase
      .from("permissions")
      .select("*")
      .order("resource")
      .order("action");

    if (error) {
      console.error("Error fetching permissions:", error);
      throw error;
    }

    return data as Permission[];
  },
};
