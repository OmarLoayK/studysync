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
  Clock,
} from "lucide-react";
import {
  FEATURE_PILLARS,
  MARKETING_METRICS,
  PLAN_DETAILS,
  APP_NAME,
  PLAN_ORDER,
} from "../lib/constants";
import { PublicFooter, PublicHeader } from "../components/layout";
import { Badge, Card, LinkButton } from "../components/ui";

const PILLAR_ICONS = [BarChart3, ShieldCheck, BrainCircuit];

const AI_FEATURES = [
  { icon: Calendar, label: "Study Planner", desc: "Turn assignments into realistic weekly schedules" },
  { icon: BookOpen, label: "Quiz Generator", desc: "Practice questions from any topic or notes" },
  { icon: FlameIcon, label: "Flashcard Builder", desc: "Convert messy notes into clean revision cards" },
  { icon: BrainCircuit, label: "Topic Explainer", desc: "Simpler explanations of hard concepts" },
  { icon: Zap, label: "Study Breakdown", desc: "Split big projects into manageable phases" },
  { icon: Trophy, label: "Power tier", desc: "Best-model AI routing with 240 monthly credits" },
];

const PLAN_ACCENTS = {
  free: {
    card: "border-white/8 bg-white/[0.03]",
    badge: "bg-white/8 text-slate-400 ring-white/10",
    price: "text-white",
    cta: "secondary",
  },
  premium: {
    card: "border-sky-400/25 bg-gradient-to-br from-sky-500/8 via-white/[0.03] to-teal-400/5",
    badge: "bg-sky-500/15 text-sky-200 ring-sky-400/25",
    price: "text-white",
    cta: "primary",
    highlight: true,
  },
  power: {
    card: "border-amber-400/20 bg-gradient-to-br from-amber-500/8 via-white/[0.03] to-orange-400/5",
    badge: "bg-amber-500/15 text-amber-200 ring-amber-400/25",
    price: "text-white",
    cta: "secondary",
  },
};

function HeroMockDashboard() {
  return (
    <div className="relative">
      <div
        className="overflow-hidden rounded-2xl border border-white/10 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.8)]"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Mock window chrome */}
        <div className="flex items-center gap-2 border-b border-white/8 px-5 py-3.5">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-rose-400/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/60" />
          </div>
          <div className="mx-auto flex items-center gap-2 rounded-md bg-white/5 px-3 py-1 text-xs text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            studysync.app/dashboard
          </div>
        </div>

        <div className="p-5">
          {/* Stats row */}
          <div className="mb-4 grid grid-cols-3 gap-3">
            {[
              { label: "Due today", value: "4", accent: "text-sky-300", bg: "from-sky-500/15" },
              { label: "Weekly progress", value: "76%", accent: "text-emerald-300", bg: "from-emerald-500/15" },
              { label: "Streak", value: "9 days", accent: "text-amber-300", bg: "from-amber-500/15" },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`relative overflow-hidden rounded-xl border border-white/8 bg-gradient-to-b ${stat.bg} to-transparent p-3.5`}
              >
                <p className="text-xs text-slate-500">{stat.label}</p>
                <p className={`mt-1.5 text-xl font-bold ${stat.accent}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Task card */}
          <div className="mb-3 rounded-xl border border-white/8 bg-white/[0.04] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-amber-400" />
                  <p className="text-sm font-semibold text-white">Physics lab report</p>
                </div>
                <p className="mt-1 text-xs text-slate-500">Due today · Medium priority</p>
              </div>
              <span className="shrink-0 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-200 ring-1 ring-inset ring-amber-400/25">
                Due today
              </span>
            </div>
            <div className="mt-3 flex gap-2">
              <span className="rounded-full bg-sky-500/12 px-2 py-0.5 text-xs text-sky-300 ring-1 ring-inset ring-sky-400/20">
                Ready to complete
              </span>
              <span className="rounded-full bg-white/6 px-2 py-0.5 text-xs text-slate-400 ring-1 ring-inset ring-white/10">
                Proof ready
              </span>
            </div>
          </div>

          {/* AI upsell card */}
          <div className="rounded-xl border border-sky-400/20 bg-gradient-to-br from-sky-500/10 via-white/[0.03] to-teal-400/8 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-300">
              <Sparkles className="h-3.5 w-3.5" />
              AI Study Planner
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Generate a realistic study schedule from your assignments and available hours.
            </p>
            <div className="mt-3 flex items-center gap-1 text-xs font-medium text-sky-400">
              Generate plan
              <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Floating glow */}
      <div
        className="pointer-events-none absolute -inset-4 -z-10 opacity-40"
        style={{
          background: "radial-gradient(ellipse at center, rgba(56,189,248,0.2) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="grid-glow min-h-screen">
      <PublicHeader />

      <main>
        {/* ── Hero ── */}
        <section className="grid-lines relative">
          <div className="hero-orb a" />
          <div className="hero-orb b" />

          <div className="relative z-10 mx-auto grid max-w-7xl gap-16 px-6 py-20 md:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/8 px-4 py-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400" />
                <span className="text-sm font-medium text-sky-300">
                  Free · Premium at $5/mo · Power at $20/mo
                </span>
              </div>

              <h1 className="max-w-3xl text-5xl font-bold leading-[1.08] tracking-tight text-white md:text-6xl lg:text-7xl">
                Turn chaotic school weeks into a system you can{" "}
                <span className="shimmer-text">actually trust.</span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-400">
                {APP_NAME} is a dark-mode study operating system with proof-backed accountability, a command-center dashboard, and premium AI tools that stay honest at every price point.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <LinkButton to="/signup" variant="primary" size="lg">
                  Start free — no card needed
                  <ArrowRight className="h-4 w-4" />
                </LinkButton>
                <LinkButton to="/pricing" variant="secondary" size="lg">
                  See pricing
                </LinkButton>
              </div>

              <div className="mt-10 flex flex-wrap gap-5">
                {[
                  "Free forever core",
                  "Proof-backed tasks",
                  "AI study tools",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-slate-400">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:block">
              <HeroMockDashboard />
            </div>
          </div>
        </section>

        {/* ── Social proof metrics ── */}
        <section className="border-y border-white/7 bg-white/[0.015]">
          <div className="mx-auto max-w-7xl px-6 py-12">
            <div className="grid gap-8 sm:grid-cols-3">
              {MARKETING_METRICS.map((metric) => (
                <div key={metric.label} className="text-center">
                  <p className="text-4xl font-bold tracking-tight text-white">{metric.value}</p>
                  <p className="mt-2 text-sm text-slate-500">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-400/70">
              Built for serious students
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-white md:text-5xl">
              Your tasks, focus windows, and AI tools
              <br className="hidden md:block" /> live in one system.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
              {APP_NAME} is designed to feel like a startup-grade productivity product with a student-first workflow built for clarity under pressure.
            </p>
          </div>

          <div className="mt-16 grid gap-5 md:grid-cols-3">
            {FEATURE_PILLARS.map((pillar, i) => {
              const Icon = PILLAR_ICONS[i] || BarChart3;
              return (
                <div
                  key={pillar.title}
                  className="group relative rounded-2xl border border-white/8 bg-white/[0.03] p-6 transition-all duration-300 hover:border-sky-400/20 hover:bg-white/[0.05]"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-sky-400/20 bg-sky-500/10">
                    <Icon className="h-5 w-5 text-sky-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{pillar.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">{pillar.copy}</p>
                  <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ background: "radial-gradient(circle at top left, rgba(56,189,248,0.05) 0%, transparent 60%)" }}
                  />
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Premium AI section ── */}
        <section id="premium" className="mx-auto max-w-7xl px-6 py-10">
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-br from-sky-500/6 via-white/[0.02] to-teal-400/4">
            <div className="grid gap-12 p-8 lg:grid-cols-[1fr_1fr] lg:items-center lg:p-12">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-sky-400" />
                  <span className="text-xs font-semibold text-sky-300">Premium AI tools</span>
                </div>

                <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
                  AI plans for both lightweight and heavy study workflows.
                </h2>

                <p className="mt-5 text-lg leading-8 text-slate-400">
                  Premium is intentionally priced at $5/month for everyday use, while Power at $20/month gives serious users the best model routing and bigger limits without making the whole product expensive for everyone.
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
                    className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-4 transition-colors duration-200 hover:border-sky-400/20 hover:bg-white/5"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/10">
                      <feature.icon className="h-4 w-4 text-sky-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{feature.label}</p>
                      <p className="mt-0.5 text-xs leading-5 text-slate-500">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-400/70">Simple pricing</p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-white md:text-5xl">
              A free core, an affordable AI tier,
              <br className="hidden md:block" /> and one power tier.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
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
                  className={`relative flex flex-col rounded-2xl border p-7 ${accent.card}`}
                >
                  {accent.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-sky-500 px-4 py-1 text-xs font-bold text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.5)]">
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
                      <p className={`text-4xl font-bold ${accent.price}`}>{plan.priceLabel}</p>
                      <p className="text-sm text-slate-500">{plan.cadence}</p>
                    </div>
                  </div>

                  <ul className="mt-7 flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-slate-300">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <LinkButton
                      to="/signup"
                      variant={accent.cta}
                      className="w-full justify-center"
                    >
                      {plan.cta}
                    </LinkButton>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="relative overflow-hidden rounded-2xl border border-sky-400/20 bg-gradient-to-br from-sky-500/10 via-white/[0.03] to-teal-400/8 p-12 text-center">
            <div className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(ellipse at center top, rgba(56,189,248,0.15) 0%, transparent 65%)" }}
            />
            <div className="relative z-10">
              <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
                Ready to build a real study system?
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg text-slate-400">
                Start free today. No credit card required. Upgrade to AI when you need more leverage.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
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

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
