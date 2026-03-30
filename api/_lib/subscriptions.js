const paidPlanConfig = {
  premium: {
    priceId: () => process.env.STRIPE_PREMIUM_PRICE_ID,
    aiLimit: () => Number(process.env.PREMIUM_AI_MONTHLY_LIMIT || 60),
  },
  power: {
    priceId: () => process.env.STRIPE_POWER_PRICE_ID,
    aiLimit: () => Number(process.env.POWER_AI_MONTHLY_LIMIT || 240),
  },
};

export function getPlanTierFromPriceId(priceId) {
  if (!priceId) return "free";

  for (const [tier, config] of Object.entries(paidPlanConfig)) {
    if (config.priceId() && config.priceId() === priceId) {
      return tier;
    }
  }

  return "premium";
}

export function getStripePriceIdForTier(tier) {
  return paidPlanConfig[tier]?.priceId?.() || "";
}

export function getAiLimitForTier(tier) {
  if (tier === "power") return paidPlanConfig.power.aiLimit();
  if (tier === "premium") return paidPlanConfig.premium.aiLimit();
  return 0;
}

export function getSubscriptionPeriodEnd(subscription) {
  if (subscription.current_period_end) {
    return subscription.current_period_end;
  }

  const itemPeriodEnd = subscription.items?.data?.[0]?.current_period_end;
  return itemPeriodEnd || null;
}

export function buildPlanFromSubscription(subscription, existingPlan = {}, existingUsage = {}) {
  const active = ["active", "trialing"].includes(subscription.status);
  const priceId = subscription.items?.data?.[0]?.price?.id || existingPlan.stripePriceId || "";
  const tier = active ? getPlanTierFromPriceId(priceId) : "free";
  const periodEnd = getSubscriptionPeriodEnd(subscription);

  return {
    plan: {
      ...existingPlan,
      tier,
      badgeLabel: tier === "power" ? "Flagship AI" : tier === "premium" ? "Best value" : "Starter",
      status: subscription.status,
      stripeCustomerId: subscription.customer,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000).toISOString() : "",
      cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
    },
    usage: {
      ...existingUsage,
      aiGenerationsLimit: getAiLimitForTier(tier),
    },
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
