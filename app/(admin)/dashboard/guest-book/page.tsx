import { GuestBookClient } from "./guest-book-client";

import { PermissionGuard } from "@/components/auth/permission-guard";

export const runtime = "edge";

export default function GuestBookPage() {
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
