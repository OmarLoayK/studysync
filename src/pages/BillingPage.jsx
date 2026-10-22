import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CreditCard, CheckCircle2, ArrowRight, Zap, RefreshCw } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { createCheckoutSession, createPortalSession, syncBillingStatus } from "../services/api";
import { formatDateTime, isPremiumPlan } from "../lib/utils";
import { PLAN_DETAILS, PLAN_ORDER } from "../lib/constants";
import { AlertBox, Badge, Button, ProgressBar, SectionHeading } from "../components/ui";

const PLAN_ACCENTS = {
  free: {
    cta: "secondary",
  },
  premium: {
    cta: "primary",
    highlight: true,
  },
  power: {
    cta: "secondary",
    warm: true,
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
    active:   "bg-emerald-500/15 text-emerald-200 ring-emerald-400/25",
    trialing: "bg-indigo-500/15 text-indigo-200 ring-indigo-400/25",
    inactive: "bg-white/[0.06] text-slate-400 ring-white/10",
    past_due: "bg-rose-500/15 text-rose-200 ring-rose-400/25",
    canceled: "bg-slate-700/30 text-slate-400 ring-white/10",
  };

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Billing"
        title="Subscription status and AI usage"
        description="Stripe owns checkout and customer portal flows. Your plan gates premium features immediately."
      />

      {error && <AlertBox variant="error">{error}</AlertBox>}

      {/* Current status */}
      <div className="grid gap-5 xl:grid-cols-2">
        {/* Current plan */}
        <div className={`rounded-2xl p-6 ${hasPaidPlan ? "bg-gradient-to-br from-indigo-500/6 via-white/[0.02] to-violet-400/4" : "bg-white/[0.025]"}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15">
                <CreditCard className="h-5 w-5 text-indigo-400" />
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

          <div className="mt-5 space-y-1.5 text-sm text-slate-500">
            <p>
              Billing cycle end:{" "}
              <span className="text-slate-300">
                {profile?.plan?.currentPeriodEnd
                  ? formatDateTime(profile.plan.currentPeriodEnd)
                  : "Appears after Stripe syncs."}
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
        </div>

        {/* AI usage */}
        <div className="rounded-2xl bg-white/[0.025] p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15">
              <Zap className="h-5 w-5 text-indigo-400" />
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
            <p className="mt-4 text-xs text-slate-500">
              Credits are shared across all 5 AI tools. Use them on the tools that unblock you most.
            </p>
          )}
        </div>
      </div>

      {/* Plan comparison */}
      <div>
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">All plans</p>
        <div className="grid gap-4 xl:grid-cols-3">
          {planCards.map((plan) => {
            const accent = PLAN_ACCENTS[plan.key];
            const isCurrent = currentTier === plan.key && (plan.key === "free" || hasPaidPlan);
            const isLockedUpgrade = hasPaidPlan && plan.key !== currentTier;

            return (
              <div
                key={plan.key}
                className={`flex flex-col rounded-2xl p-6 ${
                  accent.highlight ? "bg-gradient-to-br from-indigo-500/6 via-white/[0.02] to-violet-400/4" :
                  accent.warm ? "bg-gradient-to-br from-amber-500/6 via-white/[0.02] to-orange-400/4" :
                  "bg-white/[0.025]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
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
        <p className="mt-6 max-w-3xl text-xs leading-6 text-slate-400">
          Paid plans are monthly subscriptions that renew automatically at the price shown until you cancel.
          You can cancel any time in the billing portal and keep access until the end of the paid period.
          First payments can be refunded within 14 days. See the{" "}
          <Link to="/refunds" className="text-indigo-300 underline underline-offset-2">Refund Policy</Link> and{" "}
          <Link to="/terms" className="text-indigo-300 underline underline-offset-2">Terms of Service</Link>.
        </p>
      </div>
    </div>
  );
}
