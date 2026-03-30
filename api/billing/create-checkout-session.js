import { requireUser, sendError, sendJson } from "../_lib/auth.js";
import { buildPlanFromSubscription, getStripePriceIdForTier, pickBestSubscription } from "../_lib/subscriptions.js";
import { getStripe, getAppUrl } from "../_lib/stripe.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  try {
    const stripe = getStripe();
    const { userRef, decoded, profile } = await requireUser(req);
    const requestedTier = req.body?.tier === "power" ? "power" : "premium";
    const requestedPriceId = getStripePriceIdForTier(requestedTier);

    if (!requestedPriceId) {
      return sendJson(res, 500, { error: `Missing Stripe price for ${requestedTier}.` });
    }

    if (profile.plan?.tier === requestedTier && ["active", "trialing"].includes(profile.plan?.status)) {
      return sendJson(res, 400, { error: `${requestedTier === "power" ? "Power" : "Premium"} is already active on this account.` });
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
      const nextState = buildPlanFromSubscription(bestExisting, profile.plan, profile.usage);
      await userRef.set(
        {
          ...nextState,
        },
        { merge: true },
      );

      return sendJson(res, 409, {
        error: "A paid plan is already active on this account. Use the billing portal to switch plans.",
      });
    }

    const baseUrl = getAppUrl(req);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [
        {
          price: requestedPriceId,
          quantity: 1,
        },
      ],
      client_reference_id: decoded.uid,
      allow_promotion_codes: true,
      success_url: `${baseUrl}/app/billing?checkout=success`,
      cancel_url: `${baseUrl}/pricing?checkout=cancelled`,
      metadata: {
        firebaseUid: decoded.uid,
        requestedTier,
      },
    });

    return sendJson(res, 200, { url: session.url });
  } catch (error) {
    return sendError(res, error);
  }
}
