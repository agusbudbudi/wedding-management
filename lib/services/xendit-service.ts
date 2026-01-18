export const xenditService = {
  async createInvoice(params: {
    externalId: string;
    amount: number;
    payerEmail?: string;
    description: string;
    items?: any[];
    baseUrl?: string;
  }) {
    const secretKey = process.env.XENDIT_SECRET_KEY;
    if (!secretKey) {
      throw new Error("XENDIT_SECRET_KEY is not defined");
    }

    const baseUrl = params.baseUrl || process.env.NEXT_PUBLIC_APP_URL;

    if (!baseUrl) {
      throw new Error(
        "Base application URL is not defined. Please check NEXT_PUBLIC_APP_URL in .env.local",
      );
    }

    try {
      const auth = btoa(`${secretKey}:`);
      const response = await fetch("https://api.xendit.co/v2/invoices", {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          external_id: params.externalId,
          amount: params.amount,
          payer_email: params.payerEmail,
          description: params.description,
          items: params.items,
          currency: "IDR",
          success_redirect_url: `${baseUrl}/dashboard/subscription/success`,
          failure_redirect_url: `${baseUrl}/dashboard/subscription`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create invoice");
      }

      const data = await response.json();
      return {
        ...data,
        invoiceUrl: data.invoice_url,
      };
    } catch (error: any) {
      console.error("Xendit createInvoice error:", error);
      throw error;
    }
  },

  async getInvoice(invoiceId: string) {
    const secretKey = process.env.XENDIT_SECRET_KEY;
    if (!secretKey) {
      throw new Error("XENDIT_SECRET_KEY is not defined");
    }

    try {
      const auth = btoa(`${secretKey}:`);
      const response = await fetch(
        `https://api.xendit.co/v2/invoices/${invoiceId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to get invoice");
      }

      const data = await response.json();
      return {
        ...data,
        invoiceUrl: data.invoice_url,
      };
    } catch (error: any) {
      console.error("Xendit getInvoice error:", error);
      throw error;
    }
  },

  verifyWebhookToken(token: string) {
    return token === process.env.XENDIT_CALLBACK_TOKEN;
  },
};
