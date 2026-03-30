import { requireUser, sendError, sendJson } from "../_lib/auth.js";
import { buildPlanFromSubscription, pickBestSubscription } from "../_lib/subscriptions.js";
import { getStripe, getAppUrl } from "../_lib/stripe.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  try {
    const stripe = getStripe();
    const { userRef, decoded, profile } = await requireUser(req);

    if (profile.plan?.tier === "premium" && ["active", "trialing"].includes(profile.plan?.status)) {
      return sendJson(res, 400, { error: "Premium is already active on this account." });
    }

    if (!process.env.STRIPE_PREMIUM_PRICE_ID) {
      return sendJson(res, 500, { error: "Missing STRIPE_PREMIUM_PRICE_ID." });
    }

    let stripeCustomerId = profile.plan?.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: decoded.email,
        name: profile.displayName || decoded.name || "StudySync Student",
        metadata: {
          firebaseUid: decoded.uid,
        },
      });
      stripeCustomerId = customer.id;
      await userRef.set(
        {
          plan: {
            ...profile.plan,
            stripeCustomerId,
          },
        },
        { merge: true },
      );
    }

    const existingSubscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: "all",
      limit: 10,
    });
    const bestExisting = pickBestSubscription(existingSubscriptions.data);

    if (bestExisting && ["active", "trialing"].includes(bestExisting.status)) {
      await userRef.set(
        {
          plan: buildPlanFromSubscription(bestExisting, profile.plan),
        },
        { merge: true },
      );

      return sendJson(res, 409, {
        error: "Premium is already active on this account. Use the billing portal to manage it.",
      });
    }

    const baseUrl = getAppUrl(req);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [
        {
          price: process.env.STRIPE_PREMIUM_PRICE_ID,
          quantity: 1,
        },
      ],
      client_reference_id: decoded.uid,
      allow_promotion_codes: true,
      success_url: `${baseUrl}/app/billing?checkout=success`,
      cancel_url: `${baseUrl}/pricing?checkout=cancelled`,
      metadata: {
        firebaseUid: decoded.uid,
      },
    });

    return sendJson(res, 200, { url: session.url });
  } catch (error) {
    return sendError(res, error);
  }
}
