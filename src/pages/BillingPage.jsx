import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { createCheckoutSession, createPortalSession, syncBillingStatus } from "../services/api";
import { formatDateTime } from "../lib/utils";
import { Badge, Button, Card, ProgressBar, SectionHeading } from "../components/ui";

export default function BillingPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [loadingAction, setLoadingAction] = useState("");
  const [error, setError] = useState("");
  const [syncing, setSyncing] = useState(false);

  const isPremium = profile?.plan?.tier === "premium";

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

  async function handleCheckout() {
    setLoadingAction("checkout");
    setError("");
    try {
      const response = await createCheckoutSession(user);
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
        <Card className={isPremium ? "border-sky-400/25 bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950" : "bg-slate-900/80"}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-sky-300/80">Current plan</p>
              <h2 className="mt-2 text-3xl font-bold text-white">{isPremium ? "Premium" : "Free"}</h2>
            </div>
            <Badge className={isPremium ? "bg-emerald-500/15 text-emerald-200 ring-emerald-400/25" : "bg-slate-950 text-slate-300 ring-white/10"}>
              {profile?.plan?.status || "inactive"}
            </Badge>
          </div>

          <div className="mt-6 grid gap-3 text-slate-300">
            <p>- Free gives you the full task dashboard, analytics snapshots, and account controls.</p>
            <p>- Premium unlocks all AI tools, smarter planning, richer analytics, and advanced proof architecture.</p>
            <p>- Subscription status syncs back through Stripe webhooks into Firestore for feature gating.</p>
          </div>

          <div className="mt-6 grid gap-3 text-sm text-slate-400">
            <p>
              Billing cycle end:{" "}
              {profile?.plan?.currentPeriodEnd ? formatDateTime(profile.plan.currentPeriodEnd) : "Will appear after Stripe syncs the billing period."}
            </p>
            {profile?.plan?.cancelAtPeriodEnd ? <p>Your premium access is set to end at the current billing period.</p> : null}
            {syncing ? <p>Refreshing Stripe status...</p> : null}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {isPremium ? (
              <Button onClick={handlePortal} disabled={loadingAction === "portal"}>
                {loadingAction === "portal" ? "Opening portal..." : "Open billing portal"}
              </Button>
            ) : (
              <Button onClick={handleCheckout} disabled={loadingAction === "checkout"}>
                {loadingAction === "checkout" ? "Creating checkout..." : "Upgrade to premium"}
              </Button>
            )}
          </div>
        </Card>

        <Card>
          <p className="text-sm uppercase tracking-[0.24em] text-sky-300/80">AI usage</p>
          <h2 className="mt-2 text-3xl font-bold text-white">Premium credits stay visible</h2>
          <p className="mt-3 text-slate-400">
            This keeps the product honest at a $5/month price point and gives users a clear sense of what premium includes.
          </p>
          <div className="mt-6">
            <ProgressBar
              label="Monthly AI generations"
              value={profile?.usage?.aiGenerationsUsed ?? 0}
              max={profile?.usage?.aiGenerationsLimit ?? 60}
              helper={isPremium ? "When the cap is hit, the backend blocks more AI requests until the next month." : "Free users stay at zero until they upgrade."}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
