import { Link } from "react-router-dom";
import {
  Sparkles,
  CheckCircle2,
  BarChart3,
  ShieldCheck,
  Zap,
  ArrowRight,
  Calendar,
  BookOpen,
  Trophy,
  BrainCircuit,
  FlameIcon,
} from "lucide-react";
import {
  FEATURE_PILLARS,
  MARKETING_METRICS,
  PLAN_DETAILS,
  APP_NAME,
  PLAN_ORDER,
} from "../lib/constants";
import { cn } from "../lib/utils";
import { PublicFooter, PublicHeader } from "../components/layout";
import { Badge, LinkButton } from "../components/ui";

const PILLAR_ICONS = [BarChart3, ShieldCheck, BrainCircuit];

const AI_FEATURES = [
  { icon: Calendar,    label: "Study Planner",    desc: "Turn assignments into realistic weekly schedules" },
  { icon: BookOpen,    label: "Quiz Generator",   desc: "Practice questions from any topic or notes" },
  { icon: FlameIcon,   label: "Flashcard Builder", desc: "Convert messy notes into clean revision cards" },
  { icon: BrainCircuit,label: "Topic Explainer",  desc: "Simpler explanations of hard concepts" },
  { icon: Zap,         label: "Study Breakdown",  desc: "Split big projects into manageable phases" },
  { icon: Trophy,      label: "Power tier",       desc: "Best-model AI routing with 240 monthly credits" },
];

const PLAN_ACCENTS = {
  free: {
    card: "bg-white/[0.03]",
    badge: "bg-white/8 text-slate-400 ring-white/10",
    cta: "secondary",
  },
  premium: {
    card: "bg-white/[0.05]",
    badge: "bg-sky-500/15 text-sky-200 ring-sky-400/25",
    cta: "primary",
    highlight: true,
  },
  power: {
    card: "bg-white/[0.03]",
    badge: "bg-amber-500/15 text-amber-200 ring-amber-400/25",
    cta: "secondary",
  },
};

function HeroMockDashboard() {
  return (
    <div className="relative">
      <div className="overflow-hidden rounded-3xl bg-white/[0.04] shadow-[0_32px_80px_-10px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.07)] backdrop-blur-sm">
        {/* Chrome bar */}
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-5 py-3.5">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-rose-400/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/60" />
          </div>
          <div className="mx-auto flex items-center gap-2 rounded-md bg-white/[0.06] px-3 py-1 text-xs text-zinc-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            studysync.app/dashboard
          </div>
        </div>

        <div className="p-5">
          {/* Stats row */}
          <div className="mb-4 grid grid-cols-3 gap-3">
            {[
              { label: "Due today",    value: "4",   accent: "text-sky-300",    bg: "from-sky-500/12" },
              { label: "This week",   value: "76%", accent: "text-violet-300", bg: "from-violet-500/12" },
              { label: "Streak",      value: "9d",  accent: "text-amber-300",  bg: "from-amber-500/12" },
            ].map((s) => (
              <div
                key={s.label}
                className={`overflow-hidden rounded-xl bg-gradient-to-b ${s.bg} to-transparent p-3.5 shadow-[0_1px_0_rgba(255,255,255,0.05)_inset]`}
              >
                <p className="text-xs text-zinc-500">{s.label}</p>
                <p className={`mt-1.5 text-xl font-bold ${s.accent}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Task card */}
          <div className="mb-3 rounded-xl bg-white/[0.04] p-4 shadow-[0_1px_0_rgba(255,255,255,0.05)_inset]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-amber-400" />
                  <p className="text-sm font-semibold text-white">Physics lab report</p>
                </div>
                <p className="mt-1 text-xs text-zinc-500">Due today · Medium priority</p>
              </div>
              <span className="shrink-0 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-200 ring-1 ring-inset ring-amber-400/20">
                Due today
              </span>
            </div>
          </div>

          {/* AI card */}
          <div className="rounded-xl bg-gradient-to-br from-violet-500/12 via-white/[0.02] to-sky-400/8 p-4 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset]">
            <div className="flex items-center gap-2 text-xs font-semibold text-violet-300">
              <Sparkles className="h-3.5 w-3.5" />
              AI Study Planner
            </div>
            <p className="mt-2 text-xs leading-5 text-zinc-500">Generate a schedule from your deadlines.</p>
            <div className="mt-3 flex items-center gap-1 text-xs font-medium text-violet-400">
              Generate plan <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Glow halo under the card */}
      <div
        className="pointer-events-none absolute -inset-10 -z-10 opacity-50"
        style={{ background: "radial-gradient(ellipse at center, rgba(139,92,246,0.28) 0%, transparent 70%)" }}
      />
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "#111113" }}>
      <PublicHeader />

      <main>
        {/* ── Hero ── */}
        <section className="relative flex min-h-[92vh] items-center overflow-hidden">
          {/* Aurora scene */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="orb orb-violet absolute" style={{ width: "700px", height: "700px", top: "-260px", right: "-160px" }} />
            <div className="orb orb-sky absolute"    style={{ width: "560px", height: "560px", bottom: "-200px", left: "-120px" }} />
            <div className="orb orb-teal absolute"   style={{ width: "360px", height: "360px", top: "55%", left: "48%", transform: "translate(-50%,-50%)" }} />
            <div className="noise-overlay absolute inset-0" />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-20 lg:py-32">
            <div className="grid items-center gap-16 lg:grid-cols-2">
              {/* Left: copy */}
              <div>
                <div className="animate-fade-up mb-8 inline-flex items-center gap-2.5 rounded-full bg-white/[0.06] px-4 py-2 ring-1 ring-white/[0.09]">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  <span className="text-sm font-medium text-zinc-300">Free · Premium $5/mo · Power $20/mo</span>
                </div>

                <h1 className="animate-fade-up delay-100 text-6xl font-bold leading-[1.04] tracking-tight text-white md:text-7xl xl:text-[5.5rem]">
                  Study smarter.
                  <br />
                  <span className="shimmer-text">Actually trust it.</span>
                </h1>

                <p className="animate-fade-up delay-200 mt-7 max-w-[500px] text-xl leading-8 text-zinc-400">
                  {APP_NAME} is a dark-mode study OS with proof-backed accountability, an intelligent dashboard, and AI tools that work at every price point.
                </p>

                <div className="animate-fade-up delay-300 mt-10 flex flex-wrap gap-4">
                  <LinkButton to="/signup" variant="primary" size="lg">
                    Start free — no card needed
                    <ArrowRight className="h-4 w-4" />
                  </LinkButton>
                  <LinkButton to="/pricing" variant="secondary" size="lg">
                    See pricing
                  </LinkButton>
                </div>

                <div className="animate-fade-up delay-500 mt-10 flex flex-wrap gap-3">
                  {["Free forever core", "Proof-backed tasks", "AI study tools"].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 rounded-full bg-white/[0.04] px-3.5 py-1.5 text-sm text-zinc-400 ring-1 ring-white/[0.07]"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: mock dashboard */}
              <div className="animate-fade-up delay-200 hidden lg:block">
                <HeroMockDashboard />
              </div>
            </div>
          </div>
        </section>

        {/* ── Metrics strip ── */}
        <section className="border-y border-white/[0.05] bg-white/[0.015]">
          <div className="mx-auto max-w-7xl px-6 py-12">
            <div className="grid gap-8 sm:grid-cols-3">
              {MARKETING_METRICS.map((metric) => (
                <div key={metric.label} className="text-center">
                  <p className="text-4xl font-bold tracking-tight text-white">{metric.value}</p>
                  <p className="mt-2 text-sm text-zinc-500">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="mx-auto max-w-7xl px-6 py-28">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-sky-400/70">Built for serious students</p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl xl:text-6xl">
              Your tasks, focus windows,
              <br className="hidden md:block" /> and AI tools. One system.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-400">
              {APP_NAME} is designed like a startup-grade productivity product — built for students who need clarity under pressure.
            </p>
          </div>

          <div className="mt-16 grid gap-4 md:grid-cols-3">
            {FEATURE_PILLARS.map((pillar, i) => {
              const Icon = PILLAR_ICONS[i] || BarChart3;
              return (
                <div
                  key={pillar.title}
                  className="card-float group relative overflow-hidden rounded-3xl bg-white/[0.04] p-8 shadow-[0_2px_4px_rgba(0,0,0,0.35),0_12px_40px_rgba(0,0,0,0.22)]"
                >
                  {/* Top edge highlight */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />

                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/20 to-violet-500/10 ring-1 ring-white/[0.08]">
                    <Icon className="h-6 w-6 text-sky-400" />
                  </div>

                  <h3 className="text-2xl font-bold text-white">{pillar.title}</h3>
                  <p className="mt-4 text-base leading-7 text-zinc-400">{pillar.copy}</p>

                  {/* Hover glow */}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{ background: "radial-gradient(circle at top left, rgba(56,189,248,0.07) 0%, transparent 60%)" }}
                  />
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Premium AI ── */}
        <section id="premium" className="relative overflow-hidden py-32">
          {/* Aurora */}
          <div className="pointer-events-none absolute inset-0">
            <div className="orb orb-violet absolute" style={{ width: "600px", height: "600px", top: "-200px", right: "-200px", opacity: 0.5 }} />
            <div className="orb orb-rose absolute"   style={{ width: "420px", height: "420px", bottom: "-150px", left: "-80px", opacity: 0.35 }} />
            <div className="noise-overlay absolute inset-0" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-6">
            <div className="grid items-start gap-16 lg:grid-cols-2">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-3.5 py-1.5 ring-1 ring-violet-400/20">
                  <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                  <span className="text-xs font-semibold text-violet-300">Premium AI tools</span>
                </div>

                <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl xl:text-6xl">
                  Six AI tools.
                  <br />
                  <span className="gradient-text">One unified workspace.</span>
                </h2>

                <p className="mt-6 text-xl leading-8 text-zinc-400">
                  Premium is intentionally priced at $5/month for everyday use. Power at $20/month gives serious users the best model routing and bigger limits — without making the whole product expensive for everyone.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <LinkButton to="/pricing" variant="primary">
                    Compare plans
                    <ArrowRight className="h-4 w-4" />
                  </LinkButton>
                  <LinkButton to="/signup" variant="ghost">
                    Start with free
                  </LinkButton>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {AI_FEATURES.map((feature) => (
                  <div
                    key={feature.label}
                    className="card-float flex items-start gap-3.5 rounded-2xl bg-white/[0.04] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 ring-1 ring-violet-400/20">
                      <feature.icon className="h-4 w-4 text-violet-300" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{feature.label}</p>
                      <p className="mt-0.5 text-xs leading-5 text-zinc-500">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section className="mx-auto max-w-7xl px-6 py-28">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-sky-400/70">Simple pricing</p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
              A free core, an affordable AI tier,
              <br className="hidden md:block" /> and one power tier.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-400">
              Start free for task and dashboard management, unlock everyday AI with Premium, and reserve Power for users who need the strongest model and higher limits.
            </p>
          </div>

          <div className="mt-14 grid gap-5 xl:grid-cols-3">
            {PLAN_ORDER.map((key) => {
              const plan = PLAN_DETAILS[key];
              const accent = PLAN_ACCENTS[key];

              return (
                <div
                  key={plan.name}
                  className={cn(
                    "relative flex flex-col rounded-3xl p-8 transition-all duration-300",
                    accent.card,
                    "shadow-[0_2px_4px_rgba(0,0,0,0.35),0_12px_40px_rgba(0,0,0,0.22)]",
                    accent.highlight
                      ? "gradient-ring scale-[1.025] shadow-[0_4px_60px_rgba(56,189,248,0.14),0_2px_4px_rgba(0,0,0,0.4)]"
                      : "",
                    "hover:shadow-[0_4px_60px_rgba(0,0,0,0.45)]",
                  )}
                >
                  {accent.highlight && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-sky-500 px-4 py-1 text-xs font-bold text-slate-950 shadow-[0_0_24px_rgba(56,189,248,0.6)]">
                        Most popular
                      </span>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                      <Badge className={cn("mt-2", accent.badge)}>{plan.badge}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-bold text-white">{plan.priceLabel}</p>
                      <p className="text-sm text-zinc-500">{plan.cadence}</p>
                    </div>
                  </div>

                  <ul className="mt-8 flex-1 space-y-3.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-zinc-300">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <LinkButton to="/signup" variant={accent.cta} className="w-full justify-center">
                      {plan.cta}
                    </LinkButton>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="mx-auto max-w-7xl px-6 pb-28">
          <div className="relative overflow-hidden rounded-3xl bg-white/[0.03] p-16 text-center shadow-[0_2px_4px_rgba(0,0,0,0.35),0_16px_60px_rgba(0,0,0,0.3)]">
            {/* Aurora inside CTA */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
              <div className="orb orb-violet absolute" style={{ width: "450px", height: "450px", top: "-180px", left: "-120px", opacity: 0.45 }} />
              <div className="orb orb-sky absolute"    style={{ width: "380px", height: "380px", bottom: "-160px", right: "-100px", opacity: 0.35 }} />
              <div className="noise-overlay absolute inset-0" />
            </div>
            {/* Top edge highlight */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.14] to-transparent" />

            <div className="relative z-10">
              <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl xl:text-6xl">
                Ready to build a real study system?
              </h2>
              <p className="mx-auto mt-5 max-w-lg text-xl text-zinc-400">
                Start free today. No credit card required. Upgrade to AI when you need more leverage.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <LinkButton to="/signup" variant="primary" size="lg">
                  Create free account
                  <ArrowRight className="h-4 w-4" />
                </LinkButton>
                <LinkButton to="/pricing" variant="ghost" size="lg">
                  View all plans
                </LinkButton>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
