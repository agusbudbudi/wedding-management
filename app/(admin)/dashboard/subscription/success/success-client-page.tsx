"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ArrowRight,
  PartyPopper,
  Calendar,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  subscriptionService,
  UserSubscription,
} from "@/lib/services/subscription-service";

export function SubscriptionSuccessClientPage() {
  const [subscription, setSubscription] = useState<UserSubscription | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadSubscription() {
      try {
        const sub = await subscriptionService.getSubscription(supabase);
        setSubscription(sub);
      } catch (error) {
        console.error("Failed to load subscription:", error);
      } finally {
        setLoading(false);
      }
    }
    loadSubscription();
  }, [supabase]);

  return (
    <div className="relative flex items-center justify-center overflow-hidden py-12">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-100/40 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-cyan-100/40 blur-[120px] rounded-full animate-pulse" />
      </div>

      <div className="relative w-full max-w-lg space-y-10 animate-in fade-in zoom-in duration-700">
        <div className="text-center space-y-8">
          <div className="mx-auto w-14 h-14 bg-green-50 rounded-full flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-7 h-7 text-green-500" />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Payment Successful!
            </h1>
            <p className="text-gray-500 text-sm md:text-base max-w-sm mx-auto leading-relaxed">
              Terima kasih! Akun Anda telah berhasil ditingkatkan ke paket{" "}
              <span className="font-bold text-blue-600">
                {subscription?.plan_type?.toUpperCase() || "Premium"}
              </span>
              .
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/60 space-y-6">
            <div className="flex items-center gap-5">
              <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                  New Limit
                </p>
                <p className="text-gray-900 text-xl font-bold">
                  {subscription?.event_limit || 3} Events
                </p>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                  Features
                </p>
                <p className="text-gray-900 text-xl font-bold">
                  Premium Templates Unleashed
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 text-blue-600 text-sm font-semibold animate-pulse">
            <PartyPopper className="w-6 h-6" />
            <span>Mulai buat event baru sekarang!</span>
          </div>
        </div>

        <div className="flex flex-col gap-6 items-center">
          <Button
            size="lg"
            className="w-full max-w-sm bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold h-14 rounded-2xl shadow-xl shadow-blue-500/25 group transition-all duration-300 hover:scale-[1.02]"
            onClick={() => router.push("/dashboard/events")}
          >
            Go to Events Dashboard
            <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Button>

          <p className="text-xs text-gray-400">
            Butuh bantuan?{" "}
            <button className="text-blue-500 font-bold hover:underline">
              Hubungi Support
            </button>
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes gradient-x {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
