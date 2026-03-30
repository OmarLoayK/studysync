import { FEATURE_PILLARS, MARKETING_METRICS, PLAN_DETAILS, APP_NAME, APP_TAGLINE } from "../lib/constants";
import { PublicFooter, PublicHeader } from "../components/layout";
import { Badge, Card, LinkButton, SectionHeading } from "../components/ui";

export default function LandingPage() {
  return (
    <div className="grid-glow min-h-screen">
      <PublicHeader />

      <main>
        <section className="grid-lines relative overflow-hidden">
          <div className="hero-orb a" />
          <div className="hero-orb b" />
          <div className="mx-auto grid max-w-7xl gap-14 px-6 py-20 md:py-28 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <Badge className="bg-sky-500/12 text-sky-200 ring-sky-400/20">
                Free core productivity. Premium AI for $5/month.
              </Badge>
              <h1 className="mt-6 max-w-4xl text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
                {APP_NAME} turns chaotic school weeks into a clean system you can actually trust.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">{APP_TAGLINE}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                <LinkButton to="/signup" variant="primary" size="lg">
                  Start free
                </LinkButton>
                <LinkButton to="/pricing" variant="ghost" size="lg">
                  View pricing
                </LinkButton>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {MARKETING_METRICS.map((metric) => (
                  <Card key={metric.label} className="glass-panel p-5">
                    <p className="text-3xl font-bold text-white">{metric.value}</p>
                    <p className="mt-2 text-sm text-slate-400">{metric.label}</p>
                  </Card>
                ))}
              </div>
            </div>

            <Card className="glass-panel relative overflow-hidden p-0">
              <div className="border-b border-white/10 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-sky-300/80">Study mission control</p>
                    <h2 className="mt-2 text-2xl font-bold text-white">A dashboard that feels like a real product, not a checklist.</h2>
                  </div>
                  <Badge className="bg-emerald-500/15 text-emerald-200 ring-emerald-400/25">On track</Badge>
                </div>
              </div>

              <div className="grid gap-5 px-6 py-6">
                <div className="rounded-[24px] border border-white/10 bg-slate-950/80 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-semibold text-white">Physics lab report</p>
                      <p className="mt-1 text-sm text-slate-400">Due today • Medium priority • Proof ready</p>
                    </div>
                    <Badge className="bg-amber-500/15 text-amber-200 ring-amber-400/25">Due today</Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge className="bg-sky-500/15 text-sky-200 ring-sky-400/25">Ready to Complete</Badge>
                    <Badge className="bg-slate-900 text-slate-300 ring-white/10">3 checkpoints left</Badge>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <Card className="bg-slate-950/70 p-5">
                    <p className="text-sm text-slate-400">Due today</p>
                    <p className="mt-2 text-3xl font-bold text-white">4</p>
                  </Card>
                  <Card className="bg-slate-950/70 p-5">
                    <p className="text-sm text-slate-400">Weekly progress</p>
                    <p className="mt-2 text-3xl font-bold text-white">76%</p>
                  </Card>
                  <Card className="bg-slate-950/70 p-5">
                    <p className="text-sm text-slate-400">Current streak</p>
                    <p className="mt-2 text-3xl font-bold text-white">9 days</p>
                  </Card>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-sky-500/10 via-slate-950 to-teal-400/10 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300/80">Premium AI tools</p>
                  <p className="mt-3 text-slate-300">
                    Generate flashcards, quizzes, explainers, study schedules, and assignment breakdowns inside the same workspace.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-6 py-20">
          <SectionHeading
            eyebrow="Built for serious students"
            title="Your tasks, focus windows, and premium tools live in one system."
            description="StudySync is designed to feel like a startup-grade productivity product with a student-first workflow."
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {FEATURE_PILLARS.map((pillar) => (
              <Card key={pillar.title} className="bg-slate-900/70">
                <h3 className="text-2xl font-bold text-white">{pillar.title}</h3>
                <p className="mt-4 text-slate-400">{pillar.copy}</p>
              </Card>
            ))}
          </div>
        </section>

        <section id="premium" className="mx-auto max-w-7xl px-6 py-10">
          <Card className="overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950">
            <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr] lg:items-center">
              <div>
                <Badge className="bg-sky-500/12 text-sky-200 ring-sky-400/20">Premium AI</Badge>
                <h2 className="mt-5 text-4xl font-bold text-white">Five AI tools students will actually use, with pricing that stays believable.</h2>
                <p className="mt-4 max-w-2xl text-lg text-slate-300">
                  Premium is intentionally priced at $5/month, so StudySync uses monthly AI credits and lean prompt design to keep the unit economics sane.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <LinkButton to="/pricing" variant="primary">
                    Compare plans
                  </LinkButton>
                  <LinkButton to="/signup" variant="ghost">
                    Start with free
                  </LinkButton>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  "AI Study Planner",
                  "AI Quiz Generator",
                  "AI Flashcard Generator",
                  "AI Topic Explainer",
                  "AI Study Breakdown",
                  "Billing and usage controls",
                ].map((item) => (
                  <div key={item} className="rounded-[24px] border border-white/10 bg-slate-950/70 p-5 text-slate-200">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20">
          <SectionHeading
            eyebrow="Simple pricing"
            title="A free core plan with a lightweight premium upgrade."
            description="Start free for task and dashboard management, then unlock the AI layer when you need deeper planning leverage."
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {Object.values(PLAN_DETAILS).map((plan) => (
              <Card key={plan.name} className={plan.name === "Premium" ? "border-sky-400/30 bg-slate-900" : "bg-slate-900/70"}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                    <p className="mt-2 text-slate-400">{plan.badge}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-white">{plan.priceLabel}</p>
                    <p className="text-slate-400">{plan.cadence}</p>
                  </div>
                </div>
                <div className="mt-6 grid gap-3 text-slate-300">
                  {plan.features.map((feature) => (
                    <p key={feature}>• {feature}</p>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
