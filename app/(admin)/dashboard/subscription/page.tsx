"use client";

export const runtime = "edge";

import { useState, useEffect } from "react";
import { Check, Sparkles, Zap, Shield, Crown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import {
  subscriptionService,
  UserSubscription,
} from "@/lib/services/subscription-service";
import { toast } from "sonner";

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<UserSubscription | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadSubscription();
  }, []);

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

  async function handleChoosePlan(planName: string) {
    if (planName === "Free") return;

    if (planName === "Enterprise") {
      const phoneNumber = "6285559496968";
      const message = encodeURIComponent(
        "Halo Marinikah, saya tertarik dengan paket Enterprise. Boleh minta informasi lebih lanjut mengenai fitur dan harganya?",
      );
      window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
      return;
    }

    setProcessingPlan(planName);
    try {
      const response = await fetch("/api/subscriptions/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType: planName.toLowerCase() }),
      });

      const data = await response.json();
      if (data.url) {
        toast.success("Redirecting to payment gateway...");
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to initiate payment");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setProcessingPlan(null);
    }
  }

  const packages = [
    {
      name: "Free",
      price: "Rp 0",
      description: "Untuk mempelai yang ingin mengatur undangan sederhana.",
      features: [
        "Jatah 1 Event",
        "Maksimal 100 Tamu",
        "1 Template Undangan",
        "RSVP & Ucapan Basic",
        "Export Data Tamu",
      ],
      current: subscription ? subscription.plan_type === "free" : true,
      popular: false,
      color: "blue",
      icon: <Shield className="w-6 h-6" />,
      accent: "bg-slate-100 text-slate-600",
      buttonVariant: "outline" as const,
      ringInfo: "ring-1 ring-slate-200",
    },
    {
      name: "Pro",
      price: "Rp 149.000",
      description: "Paling pas untuk pernikahan dengan tamu menengah.",
      features: [
        "Jatah 3 Event",
        "Maksimal 500 Tamu",
        "Semua Template Premium",
        "Custom Domain (Segera)",
        "Prioritas Support",
        "Check-in QR Code App",
      ],
      current: subscription?.plan_type === "pro",
      popular: true,
      color: "primary",
      icon: <Zap className="w-6 h-6" />,
      accent: "bg-blue-50 text-blue-600",
      buttonVariant: "default" as const,
      ringInfo: "ring-2 ring-blue-500 shadow-blue-500/20",
    },
    {
      name: "Enterprise",
      price: "Hubungi Kami",
      description: "Solusi lengkap untuk Wedding Organizer.",
      features: [
        "Unlimited Event",
        "Unlimited Tamu",
        "White Label (Tanpa Logo)",
        "API Access",
        "Dedicated Account Manager",
        "Custom Feature Request",
      ],
      current: subscription?.plan_type === "enterprise",
      popular: false,
      color: "indigo",
      icon: <Crown className="w-6 h-6" />,
      accent: "bg-indigo-50 text-indigo-600",
      buttonVariant: "outline" as const,
      ringInfo: "ring-1 ring-indigo-200",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] p-4 md:p-6 space-y-8 overflow-hidden">
      {/* Background Decor - Brand Aligned */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] opacity-40 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-100/50 via-sky-50/30 to-transparent blur-3xl rounded-full" />
      </div>

      <div className="relative text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center justify-center p-1 rounded-full bg-blue-50 mb-4 border border-blue-100">
          <Badge
            variant="secondary"
            className="px-3 py-1 rounded-full bg-white text-blue-600 shadow-sm uppercase tracking-widest text-[10px] font-bold"
          >
            Pricing Plans
          </Badge>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
          Pilih Paket yang Pas untuk <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
            Momen Spesialmu
          </span>
        </h1>
        <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Tingkatkan pengalaman manajemen pernikahan Anda dengan fitur premium.
          Upgrade kapan saja sesuai kebutuhan.
        </p>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto pt-6 pb-12 px-2">
        {packages.map((pkg) => (
          <Card
            key={pkg.name}
            className={`relative flex flex-col transition-all duration-300 ${
              pkg.popular
                ? "border-blue-500 shadow-xl shadow-blue-500/10 scale-105 z-10"
                : "border-gray-200 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-1 bg-white/60 backdrop-blur-sm"
            }`}
          >
            {pkg.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-full flex justify-center">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-[1px] rounded-full shadow-lg">
                  <Badge className="bg-white hover:bg-white text-blue-600 px-6 py-1 uppercase text-[11px] tracking-widest font-bold rounded-full border-0">
                    Most Popular
                  </Badge>
                </div>
              </div>
            )}

            <CardHeader className="pb-4 pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-2xl ${pkg.accent}`}>
                  {pkg.icon}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {pkg.name}
                    </CardTitle>
                    {pkg.current && (
                      <Badge
                        variant="secondary"
                        className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 font-bold px-2 py-0.5 text-[10px]"
                      >
                        ACTIVE
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-baseline gap-1">
                  <span
                    className={`text-3xl font-extrabold tracking-tight ${
                      pkg.popular ? "text-blue-600" : "text-gray-900"
                    }`}
                  >
                    {pkg.price}
                  </span>
                  {pkg.price !== "Hubungi Kami" && (
                    <span className="text-gray-500 font-medium text-sm">
                      /event
                    </span>
                  )}
                </div>
                <CardDescription className="text-sm leading-relaxed text-gray-500 font-medium">
                  {pkg.description}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="flex-1">
              <div className="space-y-4 pt-2">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  FEATURES
                </div>
                {pkg.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-start gap-3 text-[14px] group"
                  >
                    <div
                      className={`mt-0.5 rounded-full p-0.5 ${
                        pkg.popular
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-gray-600 font-medium group-hover:text-gray-900 transition-colors">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>

            <CardFooter className="pt-6 pb-8">
              <Button
                size="lg"
                variant={pkg.popular ? "default" : "outline"}
                className={`w-full font-bold text-sm h-11 rounded-xl transition-all duration-300 ${
                  pkg.current
                    ? "bg-gray-50 text-gray-400 hover:bg-gray-50 border-gray-100 cursor-not-allowed shadow-none"
                    : pkg.popular
                      ? "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg shadow-blue-500/30 border-0"
                      : "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border-gray-200 text-gray-700"
                }`}
                disabled={pkg.current || processingPlan === pkg.name}
                onClick={() => handleChoosePlan(pkg.name)}
              >
                {processingPlan === pkg.name ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : pkg.current ? (
                  "Current Plan"
                ) : pkg.price === "Hubungi Kami" ? (
                  "Contact Sales"
                ) : (
                  "Choose Plan"
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="text-center pb-8 opacity-60 hover:opacity-100 transition-opacity">
        <p className="text-xs text-gray-400 flex items-center justify-center gap-2 font-medium">
          <Shield className="w-3.5 h-3.5" />
          Secure Payment & Data Protection
        </p>
      </div>
    </div>
  );
}
