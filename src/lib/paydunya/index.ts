/* §9 Intégration PayDunya — client REST sans SDK tiers */

const BASE_URL =
  process.env.PAYDUNYA_MODE === "live"
    ? "https://app.paydunya.com/api/v1"
    : "https://app.paydunya.com/sandbox-api/v1"

const HEADERS = {
  "Content-Type": "application/json",
  "PAYDUNYA-MASTER-KEY": process.env.PAYDUNYA_MASTER_KEY ?? "",
  "PAYDUNYA-PRIVATE-KEY": process.env.PAYDUNYA_PRIVATE_KEY ?? "",
  "PAYDUNYA-TOKEN": process.env.PAYDUNYA_TOKEN ?? "",
}

export interface PaydunyaInvoicePayload {
  amount: number
  description: string
  returnUrl: string
  cancelUrl: string
  callbackUrl: string
  customData?: Record<string, string>
}

export interface PaydunyaInvoiceResult {
  success: boolean
  token?: string
  invoiceUrl?: string
  error?: string
}

/* §9.2 — Créer une facture de paiement PayDunya */
export async function createInvoice(
  payload: PaydunyaInvoicePayload
): Promise<PaydunyaInvoiceResult> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

  const body = {
    invoice: {
      total_amount: payload.amount,
      description: payload.description,
    },
    store: {
      name: process.env.NEXT_PUBLIC_APP_NAME ?? "IQRA TOGO",
      tagline: "Le savoir, la liberté",
      postal_address: "Quartier Limamwa, Tchamba",
      website_url: appUrl,
      logo_url: `${appUrl}/logo.png`,
    },
    actions: {
      cancel_url: payload.cancelUrl,
      return_url: payload.returnUrl,
      callback_url: payload.callbackUrl,
    },
    custom_data: payload.customData ?? {},
  }

  try {
    const res = await fetch(`${BASE_URL}/checkout-invoice/create`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    })

    const data = await res.json()

    if (data.response_code === "00") {
      return {
        success: true,
        token: data.token,
        invoiceUrl: data.invoice_url,
      }
    }

    return {
      success: false,
      error: data.response_text ?? "Erreur PayDunya inconnue",
    }
  } catch (err) {
    console.error("[PayDunya createInvoice]", err)
    return { success: false, error: "Impossible de contacter PayDunya" }
  }
}

/* §9.4 — Vérifier la signature HMAC d'un webhook PayDunya */
export async function verifyWebhookSignature(
  rawBody: string,
  token: string
): Promise<boolean> {
  const secret = process.env.PAYDUNYA_WEBHOOK_SECRET ?? ""
  if (!secret) return false

  try {
    const { createHmac } = await import("crypto")
    const expected = createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex")
    return expected === token
  } catch {
    return false
  }
}

/* §9.4 — Récupérer le statut d'une transaction */
export async function getInvoiceStatus(token: string): Promise<{
  status: "pending" | "completed" | "cancelled" | "failed"
  amount?: number
  customData?: Record<string, string>
}> {
  try {
    const res = await fetch(
      `${BASE_URL}/checkout-invoice/confirm/${token}`,
      { headers: HEADERS, signal: AbortSignal.timeout(8000) }
    )
    const data = await res.json()

    if (data.response_code === "00") {
      const status = data.status === "completed" ? "completed"
        : data.status === "cancelled" ? "cancelled"
        : data.status === "failed" ? "failed"
        : "pending"

      return {
        status,
        amount: data.invoice?.total_amount,
        customData: data.custom_data,
      }
    }
    return { status: "failed" }
  } catch {
    return { status: "failed" }
  }
}
