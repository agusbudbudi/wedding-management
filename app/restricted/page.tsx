import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function RestrictedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="mb-6 rounded-full bg-red-100 p-6">
        <ShieldAlert className="h-12 w-12 text-red-600" />
      </div>
      <h1 className="mb-2 text-3xl font-bold text-gray-900">
        Restricted Access
      </h1>
      <p className="mb-8 max-w-md text-gray-500">
        You do not have permission to access this page. If you believe this is
        an error, please contact the event administrator.
      </p>
      <Button asChild className="rounded-xl px-8">
        <Link href="/dashboard">Return to Dashboard</Link>
      </Button>
    </div>
  );
}
