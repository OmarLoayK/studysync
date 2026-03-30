import { sendError, sendJson } from "../_lib/auth.js";
import { getAdminDb } from "../_lib/firebaseAdmin.js";
import { buildPlanFromSubscription } from "../_lib/subscriptions.js";
import { getStripe } from "../_lib/stripe.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function syncUserPlanByCustomer(customerId, subscription) {
  const db = getAdminDb();
  const snapshot = await db.collection("users").where("plan.stripeCustomerId", "==", customerId).limit(1).get();
  if (snapshot.empty) return;
  const userDoc = snapshot.docs[0];
  const current = userDoc.data();
  await userDoc.ref.set(
    {
      plan: buildPlanFromSubscription(subscription, current.plan),
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return sendJson(res, 500, { error: "Missing STRIPE_WEBHOOK_SECRET." });
    }

    const stripe = getStripe();
    const rawBody = await readRawBody(req);
    const signature = req.headers["stripe-signature"];
    const event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      if (session.customer && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        await syncUserPlanByCustomer(session.customer, subscription);
      }
    }

    if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      await syncUserPlanByCustomer(subscription.customer, subscription);
    }

    return sendJson(res, 200, { received: true });
  } catch (error) {
    return sendError(res, error);
  }
}
