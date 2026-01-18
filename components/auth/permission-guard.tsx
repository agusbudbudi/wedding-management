"use client";

import { usePermissions } from "@/lib/hooks/use-permissions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface PermissionGuardProps {
  children: React.ReactNode;
  resource: string;
  action: string;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function PermissionGuard({
  children,
  resource,
  action,
  fallback = null,
  redirectTo,
}: PermissionGuardProps) {
  const { hasPermission, loading, role } = usePermissions();
  const router = useRouter();
  const [canShow, setCanShow] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (hasPermission(resource, action)) {
        setCanShow(true);
      } else if (redirectTo) {
        router.push(redirectTo);
      }
    }
  }, [loading, hasPermission, resource, action, redirectTo, router]);

  if (loading) {
    // Optional: Return null or a skeleton if needed,
    // but for buttons we might just want to show nothing while loading
    // or keep the previous state.
    // For page protection, we might want a loader.
    if (redirectTo) {
      // If it's a page guard (implied by redirectTo)
      return (
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      );
    }
    return null;
  }

  if (canShow) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
