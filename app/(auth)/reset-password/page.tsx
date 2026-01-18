"use client";

export const runtime = "edge";

import { useTransition } from "react";
import { updatePassword } from "@/lib/services/auth-actions";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    startTransition(async () => {
      const result = await updatePassword(formData);
      if (result?.error) {
        toast.error(result.error);
      }
      // Success will redirect via server action
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
          Reset Password
        </h2>
        <p className="text-gray-500">Please enter your new password below.</p>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <PasswordInput
              id="password"
              name="password"
              placeholder="••••••••"
              required
              className="h-12 rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500"
              icon={<Lock className="w-4 h-4" />}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              placeholder="••••••••"
              required
              className="h-12 rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500"
              icon={<Lock className="w-4 h-4" />}
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-lg shadow-blue-500/25"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating password...
            </>
          ) : (
            "Update Password"
          )}
        </Button>
      </form>
    </div>
  );
}
