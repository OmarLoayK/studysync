import { CheckCircle2, ArrowRight } from "lucide-react";
import { APP_NAME, PLAN_DETAILS, PLAN_ORDER, PREMIUM_PRICE_DOLLARS, POWER_PRICE_DOLLARS } from "../lib/constants";
import { useAuth } from "../contexts/AuthContext";
import { cn } from "../lib/utils";
import { PublicFooter, PublicHeader } from "../components/layout";
import { Badge, LinkButton } from "../components/ui";

export default function PricingPage() {
  const { user, profile } = useAuth();
  const currentTier = profile?.plan?.tier;

  return (
    <div className="min-h-screen" style={{ background: "#08081a" }}>
      <PublicHeader />

      <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl px-6 py-20">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-400">Pricing</p>
          <h1 className="mt-3 text-5xl font-bold tracking-tight text-white md:text-6xl">
            Free core productivity.
            <br className="hidden md:block" />
            <span className="shimmer-text">Premium AI for serious students.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
            {APP_NAME} keeps the base product strong for free, charges lightly for everyday AI at ${PREMIUM_PRICE_DOLLARS}/month, and leaves room for a power tier at ${POWER_PRICE_DOLLARS}/month.
          </p>
        </div>

        <div className="mt-16 grid gap-5 xl:grid-cols-3">
          {PLAN_ORDER.map((key) => {
            const plan = PLAN_DETAILS[key];
            const isActive = currentTier === key;
            const isPopular = key === "premium";

            return (
              <div
                key={plan.name}
                className={cn(
                  "relative flex flex-col rounded-2xl p-8 transition-all duration-300",
                  isPopular
                    ? "gradient-ring bg-white/[0.04] scale-[1.02]"
                    : "bg-white/[0.025]",
                )}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-indigo-500 px-4 py-1 text-xs font-bold text-white shadow-[0_0_24px_rgba(99,102,241,0.5)]">
                      Recommended
                    </span>
                  </div>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{plan.name}</h2>
                    {isActive && (
                      <Badge className="mt-2 bg-emerald-500/15 text-emerald-200 ring-emerald-400/25">
                        Current plan
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-5xl font-bold tracking-tight text-white">{plan.priceLabel}</p>
                    <p className="mt-1 text-sm text-slate-500">{plan.cadence}</p>
                  </div>
                </div>

                <p className="mt-4 text-sm text-slate-400">
                  {key === "power"
                    ? "Our most capable AI model and 4× the monthly credits."
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
                      variant={isPopular ? "primary" : "secondary"}
                      className="w-full justify-center"
                    >
                      {key === "free" ? "Open free workspace" : "Continue to billing"}
                      {key !== "free" && <ArrowRight className="h-4 w-4" />}
                    </LinkButton>
                  ) : (
                    <LinkButton
                      to="/signup"
                      variant={isPopular ? "primary" : "secondary"}
                      className="w-full justify-center"
                    >
                      {key === "free" ? "Start free" : `Sign up for ${plan.name}`}
                      <ArrowRight className="h-4 w-4" />
                    </LinkButton>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ strip */}
        <div className="mt-20 grid gap-8 pt-16 sm:grid-cols-3">
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
