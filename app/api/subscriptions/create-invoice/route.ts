import { NextResponse } from "next/server";

export const runtime = "edge";

import { createClient } from "@/lib/supabase/server";
import { xenditService } from "@/lib/services/xendit-service";

export async function POST(request: Request) {
  try {
    const { planType } = await request.json();
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const plans = {
      pro: { amount: 149000, description: "Wedding Management Pro Plan" },
      enterprise: {
        amount: 1000000,
        description: "Wedding Management Enterprise Plan",
      },
    };

    const plan = plans[planType as keyof typeof plans];
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 });
    }

    // externalId for Xendit, helpful for tracking on their dashboard
    const externalId = `sub_${user.id}_${Date.now()}`;

    // Derive base URL from request headers
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const host = request.headers.get("host");
    const baseUrl = `${protocol}://${host}`;

    // 1. Create Xendit Invoice
    const xenditInvoice = await xenditService.createInvoice({
      externalId,
      amount: plan.amount,
      payerEmail: user.email,
      description: plan.description,
      baseUrl,
    });

    // 2. Log payment attempt in database
    // We store Xendit's internal ID as external_id in our table for easy lookup in webhooks
    const { error: dbError } = await (
      supabase.from("payment_records") as any
    ).insert({
      user_id: user.id,
      external_id: xenditInvoice.id, // Xendit's Invoice ID (e.g., 65...)
      amount: plan.amount,
      status: "pending",
      plan_type: planType,
      checkout_link: xenditInvoice.invoiceUrl,
    });

    if (dbError) {
      console.error("Database log error:", dbError);
    }

    return NextResponse.json({ url: xenditInvoice.invoiceUrl });
  } catch (error: any) {
    console.error("Create invoice error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
