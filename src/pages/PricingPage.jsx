import { CheckCircle2, ArrowRight } from "lucide-react";
import { APP_NAME, PLAN_DETAILS, PLAN_ORDER, PREMIUM_PRICE_DOLLARS, POWER_PRICE_DOLLARS } from "../lib/constants";
import { useAuth } from "../contexts/AuthContext";
import { PublicFooter, PublicHeader } from "../components/layout";
import { Badge, LinkButton } from "../components/ui";

const PLAN_ACCENTS = {
  free: {
    card: "border-white/8 bg-white/[0.03]",
    badge: "bg-white/8 text-slate-400 ring-white/10",
    cta: "secondary",
  },
  premium: {
    card: "border-sky-400/25 bg-gradient-to-br from-sky-500/8 via-white/[0.03] to-teal-400/5",
    badge: "bg-sky-500/15 text-sky-200 ring-sky-400/25",
    cta: "primary",
    popular: true,
  },
  power: {
    card: "border-amber-400/20 bg-gradient-to-br from-amber-500/8 via-white/[0.03] to-orange-400/5",
    badge: "bg-amber-500/15 text-amber-200 ring-amber-400/25",
    cta: "secondary",
  },
};

export default function PricingPage() {
  const { user, profile } = useAuth();
  const currentTier = profile?.plan?.tier;

  return (
    <div className="min-h-screen" style={{ background: "#07071c" }}>
      <PublicHeader />

      <main className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-400/70">Pricing</p>
          <h1 className="mt-3 text-5xl font-bold tracking-tight text-white md:text-6xl">
            Free core productivity.
            <br className="hidden md:block" />
            <span className="shimmer-text">Premium AI for serious students.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
            {APP_NAME} keeps the base product strong for free, charges lightly for everyday AI at ${PREMIUM_PRICE_DOLLARS}/month, and leaves room for a power tier at ${POWER_PRICE_DOLLARS}/month for high-usage students.
          </p>
        </div>

        <div className="mt-16 grid gap-5 xl:grid-cols-3">
          {PLAN_ORDER.map((key) => {
            const plan = PLAN_DETAILS[key];
            const accent = PLAN_ACCENTS[key];
            const isActive = currentTier === key;

            return (
              <div key={plan.name} className={`relative flex flex-col rounded-2xl border p-8 ${accent.card}`}>
                {accent.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-sky-500 px-4 py-1 text-xs font-bold text-slate-950 shadow-[0_0_24px_rgba(56,189,248,0.5)]">
                      Most popular
                    </span>
                  </div>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{plan.name}</h2>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge className={accent.badge}>{plan.badge}</Badge>
                      {isActive && (
                        <Badge className="bg-emerald-500/15 text-emerald-200 ring-emerald-400/25">
                          Current plan
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-5xl font-bold tracking-tight text-white">{plan.priceLabel}</p>
                    <p className="mt-1 text-sm text-slate-500">{plan.cadence}</p>
                  </div>
                </div>

                <p className="mt-4 text-sm text-slate-400">
                  {key === "power"
                    ? "Best-model AI, bigger limits, and heavier study workflows."
                    : key === "premium"
                      ? "Affordable paid AI for most students who want assistance without overpaying."
                      : "Core study management without the AI spend. Seriously strong on its own."}
                </p>

                <ul className="mt-8 flex-1 space-y-3.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-slate-300">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-10">
                  {user ? (
                    <LinkButton
                      to={key === "free" ? "/app" : "/app/billing"}
                      variant={accent.cta}
                      className="w-full justify-center"
                    >
                      {key === "free" ? "Open free workspace" : "Continue to billing"}
                      {key !== "free" && <ArrowRight className="h-4 w-4" />}
                    </LinkButton>
                  ) : (
                    <LinkButton
                      to="/signup"
                      variant={accent.cta}
                      className="w-full justify-center"
                    >
                      {key === "free" ? "Start free" : `Start with ${plan.name.toLowerCase()} later`}
                      <ArrowRight className="h-4 w-4" />
                    </LinkButton>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ-like trust strip */}
        <div className="mt-20 grid gap-6 border-t border-white/7 pt-16 sm:grid-cols-3">
          {[
            {
              q: "What happens when I hit the AI credit limit?",
              a: "The backend blocks further AI requests until the next monthly reset. Your tasks and dashboard always stay accessible.",
            },
            {
              q: "Can I cancel my subscription?",
              a: "Yes — cancel anytime through the Stripe billing portal. You keep access until the end of the paid period.",
            },
            {
              q: "Is proof submission required?",
              a: "By default yes, but you can configure it in Settings. Free users verify via Google Doc; paid users can upload image proof.",
            },
          ].map(({ q, a }) => (
            <div key={q}>
              <h3 className="text-sm font-semibold text-white">{q}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{a}</p>
            </div>
          ))}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
