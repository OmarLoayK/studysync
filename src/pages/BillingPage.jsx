import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { createCheckoutSession, createPortalSession, syncBillingStatus } from "../services/api";
import { formatDateTime, isPremiumPlan } from "../lib/utils";
import { PLAN_DETAILS, PLAN_ORDER } from "../lib/constants";
import { Badge, Button, Card, ProgressBar, SectionHeading } from "../components/ui";

export default function BillingPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [loadingAction, setLoadingAction] = useState("");
  const [error, setError] = useState("");
  const [syncing, setSyncing] = useState(false);

  const currentTier = profile?.plan?.tier || "free";
  const currentPlan = PLAN_DETAILS[currentTier] || PLAN_DETAILS.free;
  const hasPaidPlan = isPremiumPlan(profile);
  const canUsePower = currentTier === "power" && ["active", "trialing"].includes(profile?.plan?.status);
  const planCards = useMemo(() => PLAN_ORDER.map((key) => PLAN_DETAILS[key]), []);

  useEffect(() => {
    let active = true;

    async function syncPlan() {
      if (!user) return;
      setSyncing(true);
      try {
        await syncBillingStatus(user);
        if (active) {
          await refreshProfile();
        }
      } catch (caughtError) {
        if (active) {
          setError(caughtError.message || "Could not refresh billing status.");
        }
      } finally {
        if (active) {
          setSyncing(false);
        }
      }
    }

    void syncPlan();
    return () => {
      active = false;
    };
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

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Billing"
        title="Subscription status, premium gating, and AI usage"
        description="Stripe owns checkout and customer portal flows. Firestore stores the current plan state so the app can gate premium features immediately."
      />

      {error ? <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className={hasPaidPlan ? "border-sky-400/25 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950" : "bg-slate-900/80"}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-sky-300/80">Current plan</p>
              <h2 className="mt-2 text-3xl font-bold text-white">{currentPlan.name}</h2>
            </div>
            <Badge className={hasPaidPlan ? "bg-emerald-500/15 text-emerald-200 ring-emerald-400/25" : "bg-slate-950 text-slate-300 ring-white/10"}>
              {profile?.plan?.status || "inactive"}
            </Badge>
          </div>

          <div className="mt-6 grid gap-3 text-slate-300">
            <p>- Free keeps the task dashboard, analytics snapshots, and account controls strong.</p>
            <p>- Premium is the affordable AI layer for most students at $5/month.</p>
            <p>- Power is the high-usage tier with the best model routing, larger limits, and deeper AI sessions.</p>
          </div>

          <div className="mt-6 grid gap-3 text-sm text-slate-400">
            <p>
              Billing cycle end:{" "}
              {profile?.plan?.currentPeriodEnd ? formatDateTime(profile.plan.currentPeriodEnd) : "Will appear after Stripe syncs the billing period."}
            </p>
            {profile?.plan?.cancelAtPeriodEnd ? <p>Your paid access is set to end at the current billing period.</p> : null}
            {syncing ? <p>Refreshing Stripe status...</p> : null}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {hasPaidPlan ? (
              <Button onClick={handlePortal} disabled={loadingAction === "portal"}>
                {loadingAction === "portal" ? "Opening portal..." : "Open billing portal"}
              </Button>
            ) : (
              <>
                <Button onClick={() => void handleCheckout("premium")} disabled={loadingAction === "premium"}>
                  {loadingAction === "premium" ? "Creating checkout..." : "Upgrade to premium"}
                </Button>
                <Button variant="secondary" onClick={() => void handleCheckout("power")} disabled={loadingAction === "power"}>
                  {loadingAction === "power" ? "Creating checkout..." : "Go power"}
                </Button>
              </>
            )}
          </div>
        </Card>

        <Card>
          <p className="text-sm uppercase tracking-[0.24em] text-sky-300/80">AI usage</p>
          <h2 className="mt-2 text-3xl font-bold text-white">{canUsePower ? "Power credits stay visible" : "Paid AI credits stay visible"}</h2>
          <p className="mt-3 text-slate-400">
            This keeps the product honest at each price point and gives users a clear sense of what their paid plan includes.
          </p>
          <div className="mt-6">
            <ProgressBar
              label="Monthly AI generations"
              value={profile?.usage?.aiGenerationsUsed ?? 0}
              max={profile?.usage?.aiGenerationsLimit ?? currentPlan.monthlyAiLimit}
              helper={hasPaidPlan ? "When the cap is hit, the backend blocks more AI requests until the next month." : "Free users stay at zero until they upgrade."}
            />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {planCards.map((plan) => {
          const isCurrent = currentTier === plan.key && (plan.key === "free" || hasPaidPlan);
          const isLockedUpgrade = hasPaidPlan && plan.key !== currentTier;

          return (
            <Card key={plan.key} className={plan.key === "power" ? "border-amber-400/20 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40" : plan.key === "premium" ? "border-sky-400/20" : ""}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                    <Badge className={plan.key === "power" ? "bg-amber-500/15 text-amber-100 ring-amber-400/25" : "bg-slate-950 text-slate-300 ring-white/10"}>
                      {plan.badge}
                    </Badge>
                    {isCurrent ? <Badge className="bg-emerald-500/15 text-emerald-200 ring-emerald-400/25">Current</Badge> : null}
                  </div>
                  <p className="mt-3 text-slate-400">{plan.key === "power" ? "For heavy AI users who want the strongest study assist." : plan.key === "premium" ? "For most students who want paid AI without overpaying." : "For clean task management and planning basics."}</p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-white">{plan.priceLabel}</p>
                  <p className="text-slate-400">{plan.cadence}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 text-slate-300">
                {plan.features.map((feature) => <p key={feature}>- {feature}</p>)}
              </div>

              <div className="mt-8">
                {isCurrent ? (
                  <Button variant="secondary" onClick={handlePortal}>Manage billing</Button>
                ) : isLockedUpgrade ? (
                  <Button variant="secondary" onClick={handlePortal}>Change in billing portal</Button>
                ) : plan.key === "free" ? (
                  <Button variant="secondary" as="a" href="/app">Stay on free</Button>
                ) : (
                  <Button onClick={() => void handleCheckout(plan.key)} disabled={loadingAction === plan.key}>
                    {loadingAction === plan.key ? "Creating checkout..." : plan.cta}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
