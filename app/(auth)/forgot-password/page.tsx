"use client";

import { useTransition } from "react";
import Link from "next/link";
import { forgotPassword } from "@/lib/services/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await forgotPassword(formData);
      if (result?.error) {
        toast.error(result.error);
      } else if (result?.success) {
        toast.success(result.success);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Link
          href="/login"
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 mb-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to login
        </Link>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
          Forgot Password
        </h2>
        <p className="text-gray-500">
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </p>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              required
              className="pl-11 h-12 rounded-xl border-gray-200 focus:ring-blue-500 focus:border-blue-500"
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
              Sending link...
            </>
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </form>
    </div>
  );
}
