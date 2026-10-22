import { requireUser, sendError, sendJson } from "../_lib/auth.js";
import { getAdminAuth, getAdminBucket } from "../_lib/firebaseAdmin.js";
import { getStripe } from "../_lib/stripe.js";

const ACTIVE_STATUSES = ["active", "trialing", "past_due", "unpaid", "incomplete"];

async function cancelStripeSubscriptions(customerId) {
  if (!customerId) return;

  const stripe = getStripe();
  const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 100 });

  await Promise.all(
    subscriptions.data
      .filter((subscription) => ACTIVE_STATUSES.includes(subscription.status))
      .map((subscription) => stripe.subscriptions.cancel(subscription.id)),
  );
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  try {
    const { db, userRef, decoded, profile } = await requireUser(req);
    const uid = decoded.uid;

    // 1. Stop future charges before any data is removed.
    await cancelStripeSubscriptions(profile.plan?.stripeCustomerId);

    // 2. Proof images in Firebase Storage.
    await getAdminBucket().deleteFiles({ prefix: `users/${uid}/` });

    // 3. The user document and every subcollection (tasks, AI history, etc.).
    await db.recursiveDelete(userRef);

    // 4. The login itself.
    await getAdminAuth().deleteUser(uid);

    return sendJson(res, 200, { deleted: true });
  } catch (error) {
    return sendError(res, error);
  }
}
