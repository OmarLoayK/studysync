export function getSubscriptionPeriodEnd(subscription) {
  if (subscription.current_period_end) {
    return subscription.current_period_end;
  }

  const itemPeriodEnd = subscription.items?.data?.[0]?.current_period_end;
  return itemPeriodEnd || null;
}

export function buildPlanFromSubscription(subscription, existingPlan = {}) {
  const active = ["active", "trialing"].includes(subscription.status);
  const periodEnd = getSubscriptionPeriodEnd(subscription);

  return {
    ...existingPlan,
    tier: active ? "premium" : "free",
    status: subscription.status,
    stripeCustomerId: subscription.customer,
    stripeSubscriptionId: subscription.id,
    stripePriceId: subscription.items?.data?.[0]?.price?.id || existingPlan.stripePriceId || "",
    currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000).toISOString() : "",
    cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
  };
}

function subscriptionPriority(subscription) {
  if (subscription.status === "active") return 5;
  if (subscription.status === "trialing") return 4;
  if (subscription.status === "past_due") return 3;
  if (subscription.status === "incomplete") return 2;
  if (subscription.status === "canceled") return 1;
  return 0;
}

export function pickBestSubscription(subscriptions = []) {
  if (!subscriptions.length) return null;

  return [...subscriptions].sort((left, right) => {
    const priorityDelta = subscriptionPriority(right) - subscriptionPriority(left);
    if (priorityDelta !== 0) return priorityDelta;
    return (right.created || 0) - (left.created || 0);
  })[0];
}
