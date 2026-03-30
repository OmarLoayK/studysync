import { PLAN_DETAILS, PLAN_ORDER, PREMIUM_PRICE_DOLLARS, POWER_PRICE_DOLLARS } from "../lib/constants";
import { useAuth } from "../contexts/AuthContext";
import { PublicFooter, PublicHeader } from "../components/layout";
import { Badge, Card, LinkButton, SectionHeading } from "../components/ui";

export default function PricingPage() {
  const { user, profile } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950">
      <PublicHeader />

      <main className="mx-auto max-w-7xl px-6 py-18">
        <SectionHeading
          eyebrow="Pricing"
          title={`Free core productivity, premium AI at $${PREMIUM_PRICE_DOLLARS}/month, and power AI at $${POWER_PRICE_DOLLARS}/month.`}
          description="StudySync keeps the base product strong for free, charges lightly for everyday AI, and leaves room for a higher-end tier for serious AI-heavy students."
        />

        <div className="mt-12 grid gap-6 xl:grid-cols-3">
          {PLAN_ORDER.map((key) => {
            const plan = PLAN_DETAILS[key];
            const isActive = profile?.plan?.tier === key;

            return (
              <Card key={plan.name} className={key === "power" ? "border-amber-400/25 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30" : key === "premium" ? "border-sky-400/30" : ""}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-3xl font-bold text-white">{plan.name}</h2>
                      <Badge className={key === "power" ? "bg-amber-500/15 text-amber-100 ring-amber-400/25" : key === "premium" ? "bg-sky-500/15 text-sky-200 ring-sky-400/20" : "bg-slate-950 text-slate-300 ring-white/10"}>
                        {plan.badge}
                      </Badge>
                      {isActive ? <Badge className="bg-emerald-500/15 text-emerald-200 ring-emerald-400/25">Current plan</Badge> : null}
                    </div>
                    <p className="mt-3 text-slate-400">
                      {key === "power"
                        ? "Best-model AI, bigger limits, and heavier study workflows."
                        : key === "premium"
                          ? "Affordable paid AI for most students."
                          : "Core study management without the AI spend."}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-5xl font-bold text-white">{plan.priceLabel}</p>
                    <p className="text-slate-400">{plan.cadence}</p>
                  </div>
                </div>

                <div className="mt-8 grid gap-3 text-slate-300">
                  {plan.features.map((feature) => (
                    <p key={feature}>- {feature}</p>
                  ))}
                </div>

                <div className="mt-8">
                  {user ? (
                    <LinkButton
                      to={key === "free" ? "/app" : "/app/billing"}
                      variant={key === "power" ? "secondary" : key === "premium" ? "primary" : "secondary"}
                    >
                      {key === "free" ? "Open free workspace" : "Continue to billing"}
                    </LinkButton>
                  ) : (
                    <LinkButton to="/signup" variant={key === "premium" ? "primary" : "secondary"}>
                      {key === "free" ? "Start free" : `Start with ${plan.name.toLowerCase()} later`}
                    </LinkButton>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
