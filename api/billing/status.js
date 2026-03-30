import { requireUser, sendError, sendJson } from "../_lib/auth.js";
import { buildPlanFromSubscription, pickBestSubscription } from "../_lib/subscriptions.js";
import { getStripe } from "../_lib/stripe.js";

async function syncPlanFromStripe({ stripe, profile, userRef }) {
  if (!profile.plan?.stripeCustomerId) {
    return profile.plan;
  }

  const subscriptions = await stripe.subscriptions.list({
    customer: profile.plan.stripeCustomerId,
    status: "all",
    limit: 10,
  });

  const bestSubscription = pickBestSubscription(subscriptions.data);
  if (!bestSubscription) {
    return profile.plan;
  }

  const nextState = buildPlanFromSubscription(bestSubscription, profile.plan, profile.usage);

  await userRef.set(
    {
      ...nextState,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );

  return nextState.plan;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  try {
    const stripe = getStripe();
    const authResult = await requireUser(req);
    const plan = await syncPlanFromStripe({
      stripe,
      profile: authResult.profile,
      userRef: authResult.userRef,
    });

    return sendJson(res, 200, { plan });
  } catch (error) {
    return sendError(res, error);
  }
}
