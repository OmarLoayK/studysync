import { PLAN_DETAILS, PREMIUM_PRICE_DOLLARS } from "../lib/constants";
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
          title={`Free core productivity, premium AI for $${PREMIUM_PRICE_DOLLARS}/month.`}
          description="StudySync keeps the base product strong for free, then charges only for the higher-cost leverage layer."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {Object.entries(PLAN_DETAILS).map(([key, plan]) => {
            const isActive = profile?.plan?.tier === key;
            return (
              <Card key={plan.name} className={key === "premium" ? "border-sky-400/30" : ""}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-3xl font-bold text-white">{plan.name}</h2>
                      {key === "premium" ? (
                        <Badge className="bg-sky-500/15 text-sky-200 ring-sky-400/20">Best value</Badge>
                      ) : null}
                      {isActive ? <Badge className="bg-emerald-500/15 text-emerald-200 ring-emerald-400/25">Current plan</Badge> : null}
                    </div>
                    <p className="mt-3 text-slate-400">{plan.badge}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-5xl font-bold text-white">{plan.priceLabel}</p>
                    <p className="text-slate-400">{plan.cadence}</p>
                  </div>
                </div>

                <div className="mt-8 grid gap-3 text-slate-300">
                  {plan.features.map((feature) => (
                    <p key={feature}>• {feature}</p>
                  ))}
                </div>

                <div className="mt-8">
                  {user ? (
                    <LinkButton
                      to={key === "premium" ? "/app/billing" : "/app"}
                      variant={key === "premium" ? "primary" : "secondary"}
                    >
                      {key === "premium" ? "Continue to billing" : "Open free workspace"}
                    </LinkButton>
                  ) : (
                    <LinkButton to="/signup" variant={key === "premium" ? "primary" : "secondary"}>
                      {key === "premium" ? "Start and upgrade later" : "Start free"}
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
