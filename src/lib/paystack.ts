type PaystackVerification = {
  verified: boolean;
  amount: number;
  email: string;
  status: string;
};

type PaystackInitializeResponse = {
  reference: string;
  accessCode: string;
  authorizationUrl: string;
};

async function getPaystackSecret() {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    throw new Error("Payment provider is not configured");
  }
  return secret;
}

export async function verifyPaystackTransaction(reference: string): Promise<PaystackVerification> {
  if (!reference) {
    throw new Error("Payment reference is required");
  }

  const secret = await getPaystackSecret();
  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${secret}` },
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.status || data.data?.status !== "success") {
    return { verified: false, amount: 0, email: "", status: data.data?.status || "failed" };
  }

  return {
    verified: true,
    amount: Number(data.data.amount) / 100,
    email: String(data.data.customer?.email || ""),
    status: data.data.status,
  };
}

export async function refundPaystackTransaction(reference: string, amount?: number) {
  try {
    const secret = await getPaystackSecret();
    const body: { reference: string; amount?: number } = { reference };
    if (typeof amount === "number" && amount > 0) {
      body.amount = Math.round(amount * 100);
    }

    const response = await fetch("https://api.paystack.co/refund", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    return { ok: response.ok, data: await response.json().catch(() => ({})) };
  } catch {
    return { ok: false, data: { error: "Refund request failed" } };
  }
}

export async function initializePaystackTransaction(params: {
  email: string;
  amount: number;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}): Promise<PaystackInitializeResponse> {
  const secret = await getPaystackSecret();

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: Math.max(1, Math.round(params.amount * 100)),
      currency: "GHS",
      channels: ["card", "mobile_money", "bank", "ussd"],
      callback_url: params.callbackUrl,
      ...(params.metadata ? { metadata: params.metadata } : {}),
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.status) {
    throw new Error(data.message || "Payment initialization failed");
  }

  return {
    reference: String(data.data?.reference || ""),
    accessCode: String(data.data?.access_code || ""),
    authorizationUrl: String(data.data?.authorization_url || ""),
  };
}
