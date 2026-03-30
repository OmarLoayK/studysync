import { requireUser, sendError, sendJson } from "../_lib/auth.js";
import { getAppUrl, getStripe } from "../_lib/stripe.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  try {
    const stripe = getStripe();
    const { profile } = await requireUser(req);
    const stripeCustomerId = profile.plan?.stripeCustomerId;

    if (!stripeCustomerId) {
      return sendJson(res, 400, { error: "No Stripe customer found for this user yet." });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${getAppUrl(req)}/app/billing`,
    });

    return sendJson(res, 200, { url: session.url });
  } catch (error) {
    return sendError(res, error);
  }
}
