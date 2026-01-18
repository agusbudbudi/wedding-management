"use client";

import { GuestBookClient } from "./guest-book-client";
import { PermissionGuard } from "@/components/auth/permission-guard";

export function GuestBookClientPage() {
  return (
    <PermissionGuard
      resource="guest_book"
      action="view"
      redirectTo="/restricted"
    >
      <div className="flex-1 flex flex-col min-h-0">
        <GuestBookClient />
      </div>
    </PermissionGuard>
  );
}
