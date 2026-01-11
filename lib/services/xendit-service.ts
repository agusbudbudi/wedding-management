import { Xendit } from "xendit-node";

const xenditClient = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY || "",
});

export const xenditService = {
  async createInvoice(params: {
    externalId: string;
    amount: number;
    payerEmail?: string;
    description: string;
    items?: any[];
    baseUrl?: string;
  }) {
    if (!process.env.XENDIT_SECRET_KEY) {
      throw new Error("XENDIT_SECRET_KEY is not defined");
    }

    const baseUrl = params.baseUrl || process.env.NEXT_PUBLIC_APP_URL;

    if (!baseUrl) {
      throw new Error(
        "Base application URL is not defined. Please check NEXT_PUBLIC_APP_URL in .env.local"
      );
    }

    try {
      const response = await (xenditClient.Invoice as any).createInvoice({
        data: {
          externalId: params.externalId,
          amount: params.amount,
          payerEmail: params.payerEmail,
          description: params.description,
          items: params.items,
          currency: "IDR",
          successRedirectUrl: `${baseUrl}/dashboard/subscription/success`,
          failureRedirectUrl: `${baseUrl}/dashboard/subscription`,
        },
      });
      return response;
    } catch (error: any) {
      console.error("Xendit createInvoice error:", error);
      throw error;
    }
  },

  async getInvoice(invoiceId: string) {
    try {
      const response = await (xenditClient.Invoice as any).getInvoice({
        invoiceId,
      });
      return response;
    } catch (error: any) {
      console.error("Xendit getInvoice error:", error);
      throw error;
    }
  },

  verifyWebhookToken(token: string) {
    return token === process.env.XENDIT_CALLBACK_TOKEN;
  },
};
