import { sendError, sendJson } from "../_lib/auth.js";
import { getAdminDb } from "../_lib/firebaseAdmin.js";
import { buildPlanFromSubscription, pickBestSubscription } from "../_lib/subscriptions.js";
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

async function findUserRef(stripe, customerId, uidHint) {
  const db = getAdminDb();
  const snapshot = await db.collection("users").where("plan.stripeCustomerId", "==", customerId).limit(1).get();
  if (!snapshot.empty) return snapshot.docs[0].ref;

  // Fall back to the Firebase uid recorded at checkout, in case the customer id was never saved.
  let uid = uidHint;
  if (!uid) {
    const customer = await stripe.customers.retrieve(customerId);
    uid = customer.deleted ? "" : customer.metadata?.firebaseUid;
  }
  if (!uid) return null;
  const userRef = db.collection("users").doc(uid);
  return (await userRef.get()).exists ? userRef : null;
}

// Events can arrive out of order and can concern a stale subscription (e.g. an abandoned
// incomplete checkout expiring), so always sync from the customer's best current subscription.
async function syncUserPlanByCustomer(stripe, customerId, uidHint) {
  const userRef = await findUserRef(stripe, customerId, uidHint);
  if (!userRef) return;

  const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 10 });
  const subscription = pickBestSubscription(subscriptions.data);
  if (!subscription) return;

  const current = (await userRef.get()).data();
  const nextState = buildPlanFromSubscription(subscription, current.plan, current.usage);
  await userRef.set(
    {
      ...nextState,
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
        await syncUserPlanByCustomer(stripe, session.customer, session.client_reference_id);
      }
    }

    if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      await syncUserPlanByCustomer(stripe, subscription.customer, subscription.metadata?.firebaseUid);
    }

    return sendJson(res, 200, { received: true });
  } catch (error) {
    return sendError(res, error);
  }
}
