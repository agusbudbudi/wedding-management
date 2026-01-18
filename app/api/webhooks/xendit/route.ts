import { NextResponse } from "next/server";

export const runtime = "edge";

import { createClient } from "@/lib/supabase/server";
import { xenditService } from "@/lib/services/xendit-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const headers = request.headers;
    const callbackToken = headers.get("x-callback-token");

    if (!xenditService.verifyWebhookToken(callbackToken || "")) {
      console.warn("Unauthorized webhook attempt - invalid callback token");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status, id: invoice_id, payment_method } = body;

    const supabase = await createClient();

    // 1. Update payment record
    // Casting to any to bypass strict type check where Update is inferred as 'never'
    const { data: paymentRecord, error: updateError } = await (
      supabase.from("payment_records") as any
    )
      .update({
        status: status.toLowerCase(),
        payment_method: payment_method || "unknown",
        updated_at: new Date().toISOString(),
      })
      .eq("external_id", invoice_id)
      .select()
      .single();

    if (updateError || !paymentRecord) {
      console.error("Update payment record error:", updateError);
      return NextResponse.json(
        { error: "Payment record not found" },
        { status: 404 },
      );
    }

    // 2. If paid, update user subscription
    if (status === "PAID") {
      const planLimits = {
        pro: 3,
        enterprise: 9999,
      };

      const planType = paymentRecord.plan_type as keyof typeof planLimits;
      const limit = planType && planLimits[planType] ? planLimits[planType] : 1;

      // Casting chain to any because user_subscriptions is also potentially restricted
      const { error: subError } = await (
        supabase.from("user_subscriptions") as any
      ).upsert({
        user_id: paymentRecord.user_id,
        plan_type: paymentRecord.plan_type || "free",
        event_limit: limit,
        status: "active",
        updated_at: new Date().toISOString(),
      });

      if (subError) {
        console.error("Update subscription error:", subError);
        return NextResponse.json(
          { error: "Failed to update subscription" },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
