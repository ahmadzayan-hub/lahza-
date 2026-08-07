// Outbound notifications. Sends via the WhatsApp Cloud API when configured,
// and always logs so the flow is observable in every environment.

export async function sendWhatsApp(to: string, message: string, tag = "whatsapp"): Promise<boolean> {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneId || !token) {
    console.info(`[${tag}:log-fallback]`, { to, message });
    return false;
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: message },
      }),
    });
    if (!res.ok) {
      console.error(`[${tag}:error]`, res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[${tag}:exception]`, err);
    return false;
  }
}

/**
 * Abandoned-cart recovery nudge. Targets the customer when their contact is
 * known, otherwise pings the ops number so a human can follow up. (Anonymous
 * pre-checkout carts have no contact, hence the ops fallback.)
 */
export async function sendAbandonedCartNudge(payload: {
  items: number;
  subtotal: number;
  contact?: string;
}): Promise<boolean> {
  const to = payload.contact || process.env.OPS_WHATSAPP_TO;
  if (!to) {
    console.info("[abandoned-cart:no-recipient]", payload);
    return false;
  }
  const message = payload.contact
    ? `You left ${payload.items} item(s) (AED ${payload.subtotal}) in your Beyond Style cart. Complete your order for free delivery over AED 200.`
    : `Abandoned cart: ${payload.items} item(s), AED ${payload.subtotal}.`;
  return sendWhatsApp(to, message, "abandoned-cart");
}
