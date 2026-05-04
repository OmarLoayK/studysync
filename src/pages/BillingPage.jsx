import { useEffect, useMemo, useState } from "react";
import { CreditCard, CheckCircle2, ArrowRight, Zap, RefreshCw } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { createCheckoutSession, createPortalSession, syncBillingStatus } from "../services/api";
import { formatDateTime, isPremiumPlan } from "../lib/utils";
import { PLAN_DETAILS, PLAN_ORDER } from "../lib/constants";
import { AlertBox, Badge, Button, Card, ProgressBar, SectionHeading } from "../components/ui";

const PLAN_ACCENTS = {
  free: {
    card: "border-white/8 bg-white/[0.03]",
    badge: "bg-white/8 text-slate-400 ring-white/10",
    cta: "secondary",
  },
  premium: {
    card: "border-sky-400/20 bg-gradient-to-br from-sky-500/6 via-white/[0.02] to-teal-400/4",
    badge: "bg-sky-500/15 text-sky-200 ring-sky-400/25",
    cta: "primary",
  },
  power: {
    card: "border-amber-400/15 bg-gradient-to-br from-amber-500/6 via-white/[0.02] to-orange-400/4",
    badge: "bg-amber-500/15 text-amber-200 ring-amber-400/25",
    cta: "secondary",
  },
};

export default function BillingPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [loadingAction, setLoadingAction] = useState("");
  const [error, setError] = useState("");
  const [syncing, setSyncing] = useState(false);

  const currentTier = profile?.plan?.tier || "free";
  const currentPlan = PLAN_DETAILS[currentTier] || PLAN_DETAILS.free;
  const hasPaidPlan = isPremiumPlan(profile);
  const planCards = useMemo(() => PLAN_ORDER.map((key) => PLAN_DETAILS[key]), []);

  const aiUsed = profile?.usage?.aiGenerationsUsed ?? 0;
  const aiLimit = profile?.usage?.aiGenerationsLimit ?? currentPlan.monthlyAiLimit;
  const planStatus = profile?.plan?.status || "inactive";

  useEffect(() => {
    let active = true;

    async function syncPlan() {
      if (!user) return;
      setSyncing(true);
      try {
        await syncBillingStatus(user);
        if (active) await refreshProfile();
      } catch (caughtError) {
        if (active) setError(caughtError.message || "Could not refresh billing status.");
      } finally {
        if (active) setSyncing(false);
      }
    }

    void syncPlan();
    return () => { active = false; };
  }, [refreshProfile, user]);

  async function handleCheckout(tier) {
    setLoadingAction(tier);
    setError("");
    try {
      const response = await createCheckoutSession(user, tier);
      window.location.href = response.url;
    } catch (caughtError) {
      setError(caughtError.message || "Could not open Stripe checkout.");
    } finally {
      setLoadingAction("");
    }
  }

  async function handlePortal() {
    setLoadingAction("portal");
    setError("");
    try {
      const response = await createPortalSession(user);
      window.location.href = response.url;
    } catch (caughtError) {
      setError(caughtError.message || "Could not open the billing portal.");
    } finally {
      setLoadingAction("");
    }
  }

  const statusStyles = {
    active: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/25",
    trialing: "bg-sky-500/15 text-sky-200 ring-sky-400/25",
    inactive: "bg-white/8 text-slate-400 ring-white/10",
    past_due: "bg-rose-500/15 text-rose-200 ring-rose-400/25",
    canceled: "bg-slate-700/30 text-slate-400 ring-white/10",
  };

  return (
    <div className="space-y-7">
      <SectionHeading
        eyebrow="Billing"
        title="Subscription status and AI usage"
        description="Stripe owns checkout and customer portal flows. Firestore stores the current plan state so the app can gate premium features immediately."
      />

      {error && <AlertBox variant="error">{error}</AlertBox>}

      {/* Current status cards */}
      <div className="grid gap-5 xl:grid-cols-2">
        {/* Current plan */}
        <Card className={hasPaidPlan ? "border-sky-400/20 bg-gradient-to-br from-sky-500/6 via-white/[0.02] to-teal-400/4" : ""}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/[0.04]">
                <CreditCard className="h-5 w-5 text-sky-400" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Current plan</p>
                <h2 className="mt-0.5 text-2xl font-bold text-white">{currentPlan.name}</h2>
              </div>
            </div>
            <Badge className={statusStyles[planStatus] || statusStyles.inactive}>
              {planStatus}
            </Badge>
          </div>

          <div className="mt-5 space-y-2 text-sm text-slate-400">
            <p>Free keeps the task dashboard, analytics, and account controls strong.</p>
            <p>Premium is the affordable AI layer for most students at $5/month.</p>
            <p>Power is the high-usage tier with the best model routing and bigger limits.</p>
          </div>

          <div className="mt-5 space-y-1.5 text-sm text-slate-500">
            <p>
              Billing cycle end:{" "}
              <span className="text-slate-300">
                {profile?.plan?.currentPeriodEnd
                  ? formatDateTime(profile.plan.currentPeriodEnd)
                  : "Appears after Stripe syncs the billing period."}
              </span>
            </p>
            {profile?.plan?.cancelAtPeriodEnd && (
              <p className="text-amber-400">Paid access ends at the current billing period.</p>
            )}
            {syncing && (
              <p className="flex items-center gap-1.5 text-slate-600">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Refreshing Stripe status...
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-2.5">
            {hasPaidPlan ? (
              <Button onClick={handlePortal} disabled={loadingAction === "portal"}>
                {loadingAction === "portal" ? "Opening..." : "Open billing portal"}
              </Button>
            ) : (
              <>
                <Button onClick={() => void handleCheckout("premium")} disabled={Boolean(loadingAction)}>
                  {loadingAction === "premium" ? "Creating checkout..." : "Upgrade to Premium"}
                  {!loadingAction && <ArrowRight className="h-4 w-4" />}
                </Button>
                <Button variant="secondary" onClick={() => void handleCheckout("power")} disabled={Boolean(loadingAction)}>
                  {loadingAction === "power" ? "Creating checkout..." : "Go Power"}
                </Button>
              </>
            )}
          </div>
        </Card>

        {/* AI usage */}
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/[0.04]">
              <Zap className="h-5 w-5 text-sky-400" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">AI usage</p>
              <h2 className="mt-0.5 text-2xl font-bold text-white">Monthly credits</h2>
            </div>
          </div>

          <p className="mt-4 text-sm text-slate-400">
            Usage stays visible at every price point so the product stays honest about what each tier includes.
          </p>

          <div className="mt-5">
            <ProgressBar
              label="Monthly AI generations"
              value={aiUsed}
              max={hasPaidPlan ? aiLimit : currentPlan.monthlyAiLimit || 60}
              helper={
                hasPaidPlan
                  ? "When the cap is hit, the backend blocks more AI requests until the next month."
                  : "Free users stay at zero until they upgrade."
              }
            />
          </div>

          {hasPaidPlan && (
            <div className="mt-5 rounded-xl border border-white/7 bg-white/[0.02] p-3.5 text-xs text-slate-500">
              Credits are shared across all 5 AI tools. Use them on the tools that unblock you most.
            </div>
          )}
        </Card>
      </div>

      {/* Plan comparison cards */}
      <div>
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">All plans</p>
        <div className="grid gap-5 xl:grid-cols-3">
          {planCards.map((plan) => {
            const accent = PLAN_ACCENTS[plan.key];
            const isCurrent = currentTier === plan.key && (plan.key === "free" || hasPaidPlan);
            const isLockedUpgrade = hasPaidPlan && plan.key !== currentTier;

            return (
              <div key={plan.key} className={`flex flex-col rounded-2xl border p-6 ${accent.card}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge className={accent.badge}>{plan.badge}</Badge>
                      {isCurrent && (
                        <Badge className="bg-emerald-500/15 text-emerald-200 ring-emerald-400/25">
                          <CheckCircle2 className="h-3 w-3" />
                          Current
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">{plan.priceLabel}</p>
                    <p className="text-xs text-slate-500">{plan.cadence}</p>
                  </div>
                </div>

                <p className="mt-4 text-sm text-slate-400">
                  {plan.key === "power"
                    ? "For heavy AI users who want the strongest study assist."
                    : plan.key === "premium"
                      ? "For most students who want paid AI without overpaying."
                      : "For clean task management and planning basics."}
                </p>

                <ul className="mt-5 flex-1 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  {isCurrent ? (
                    <Button variant="secondary" onClick={handlePortal} className="w-full justify-center">
                      Manage billing
                    </Button>
                  ) : isLockedUpgrade ? (
                    <Button variant="secondary" onClick={handlePortal} className="w-full justify-center">
                      Change in portal
                    </Button>
                  ) : plan.key === "free" ? (
                    <Button variant="secondary" as="a" href="/app" className="w-full justify-center">
                      Stay on free
                    </Button>
                  ) : (
                    <Button
                      variant={accent.cta}
                      onClick={() => void handleCheckout(plan.key)}
                      disabled={Boolean(loadingAction)}
                      className="w-full justify-center"
                    >
                      {loadingAction === plan.key ? "Creating checkout..." : plan.cta}
                      {!loadingAction && <ArrowRight className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
