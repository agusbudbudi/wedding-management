"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, Zap } from "lucide-react";
import {
  subscriptionService,
  UserSubscription,
} from "@/lib/services/subscription-service";
import { toast } from "sonner";

export function SubscriptionTab() {
  const [subscription, setSubscription] = useState<UserSubscription | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchSubscription() {
      const sub = await subscriptionService.getSubscription(supabase);
      setSubscription(sub);
      setLoading(false);
    }
    fetchSubscription();
  }, [supabase]);

  async function handleUpgrade() {
    setUpgrading(true);
    try {
      const response = await fetch("/api/subscriptions/create-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planType: "pro" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create invoice");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast.error("Upgrade failed: " + error.message);
    } finally {
      setUpgrading(false);
    }
  }

  if (loading) {
    return <div>Loading subscription details...</div>;
  }

  // Default to free if no subscription record found (should ideally exist if user is created)
  const planType = subscription?.plan_type || "free";
  const isFree = planType === "free";

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-medium">Current Plan</h3>
            <p className="text-sm text-muted-foreground">
              You are currently on the{" "}
              <span className="font-medium capitalize">{planType}</span> plan.
            </p>
          </div>
          <Badge
            variant={isFree ? "secondary" : "default"}
            className="capitalize"
          >
            {planType}
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              Status
            </div>
            <div className="capitalize">{subscription?.status || "Active"}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              Usage
            </div>
            <div>
              {subscription?.events_used || 0} /{" "}
              {subscription?.event_limit === 9999
                ? "Unlimited"
                : subscription?.event_limit}{" "}
              Events Created
            </div>
          </div>
        </div>

        {isFree && (
          <div className="bg-blue-50 border border-blue-100 p-3 rounded-[1.5rem] flex items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-500">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 p-2.5 rounded-xl">
                <Zap className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <h3 className="font-bold text-blue-900">Upgrade to Pro</h3>
                <p className="text-blue-700/70 text-sm font-medium">
                  Unlock more events and premium features.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="bg-white border-blue-200 text-blue-600 hover:bg-blue-50 font-bold rounded-xl"
              onClick={handleUpgrade}
              disabled={upgrading}
            >
              {upgrading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upgrade to Pro - IDR 149.000
            </Button>
          </div>
        )}
      </div>

      {isFree && (
        <div className="space-y-4 pt-4 border-t border-dashed">
          <h3 className="text-lg font-medium">Pro Plan Benefits</h3>
          <ul className="grid gap-3 text-sm">
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-500" /> Create up to 3
              Events
            </li>
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-500" /> Up to 500 Guests
              per Event
            </li>
            <li className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-green-500" /> Advanced
              Analytics
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
