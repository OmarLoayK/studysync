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
  FlameIcon,
  BrainCircuit,
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
import { LinkButton } from "../components/ui";

const PILLAR_ICONS = [BarChart3, ShieldCheck, BrainCircuit];

const AI_TOOLS_DISPLAY = [
  { icon: Calendar,     label: "Study Planner",     desc: "Turn assignments into realistic weekly schedules" },
  { icon: BookOpen,     label: "Quiz Generator",    desc: "Practice questions from any topic or notes" },
  { icon: FlameIcon,    label: "Flashcard Builder", desc: "Convert messy notes into clean revision cards" },
  { icon: BrainCircuit, label: "Topic Explainer",   desc: "Simpler explanations of hard concepts" },
  { icon: Zap,          label: "Study Breakdown",   desc: "Split big projects into manageable phases" },
];

const PLAN_ACCENTS = {
  free:    { cta: "secondary" },
  premium: { cta: "primary", highlight: true },
  power:   { cta: "secondary" },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "#08081a" }}>
      <PublicHeader />

      <main>
        {/* ── HERO ── */}
        <section className="relative flex min-h-screen items-center overflow-hidden">
          {/* Background layers */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="orb orb-indigo absolute" style={{ width: "1000px", height: "1000px", top: "-350px", right: "-300px" }} />
            <div className="orb orb-violet absolute" style={{ width: "650px", height: "650px", bottom: "-250px", left: "-150px" }} />
            <div
              className="morph absolute opacity-[0.18]"
              style={{
                width: "450px", height: "450px",
                top: "25%", right: "18%",
                background: "radial-gradient(circle, rgba(99,102,241,0.7) 0%, rgba(139,92,246,0.35) 50%, transparent 70%)",
                filter: "blur(50px)",
              }}
            />
            <div className="noise-overlay absolute inset-0" />
          </div>

          {/* Floating product chips — positioned absolutely for depth */}
          <div className="pointer-events-none absolute right-[4%] top-[22%] hidden xl:block animate-float" style={{ animationDelay: "0s" }}>
            <div className="flex items-center gap-2.5 rounded-2xl bg-white/[0.07] px-4 py-2.5 backdrop-blur-md ring-1 ring-white/[0.1]">
              <div className="h-2 w-2 rounded-full bg-amber-400" />
              <span className="text-sm font-medium text-white">Physics lab — due today</span>
            </div>
          </div>
          <div className="pointer-events-none absolute right-[7%] top-[42%] hidden xl:block animate-float" style={{ animationDelay: "1.3s" }}>
            <div className="rounded-2xl bg-indigo-500/10 px-4 py-3 backdrop-blur-md ring-1 ring-indigo-400/20 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-400">This week</p>
              <p className="mt-0.5 text-2xl font-black text-white">76%</p>
            </div>
          </div>
          <div className="pointer-events-none absolute right-[4%] top-[62%] hidden xl:block animate-float" style={{ animationDelay: "2.6s" }}>
            <div className="flex items-center gap-2 rounded-2xl bg-amber-500/10 px-4 py-2.5 backdrop-blur-md ring-1 ring-amber-400/15">
              <FlameIcon className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-bold text-amber-200">9 day streak</span>
            </div>
          </div>

          {/* Hero text */}
          <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-28 lg:py-40">
            <div className="max-w-[740px]">
              <div className="animate-fade-up mb-10 inline-flex items-center gap-2.5 rounded-full bg-white/[0.05] px-4 py-2 ring-1 ring-white/[0.08]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-sm font-medium text-zinc-300">Free · Premium $5/mo · Power $20/mo</span>
              </div>

              <h1
                className="animate-fade-up delay-100 font-black leading-[0.92] tracking-[-0.04em] text-white"
                style={{ fontSize: "clamp(3.75rem, 10.5vw, 9rem)" }}
              >
                Study<br />smarter.
              </h1>
              <div
                className="animate-fade-up delay-200 font-black leading-[0.92] tracking-[-0.04em]"
                style={{ fontSize: "clamp(3.75rem, 10.5vw, 9rem)" }}
              >
                <span className="shimmer-text">Actually<br />trust it.</span>
              </div>

              <p className="animate-fade-up delay-300 mt-10 max-w-lg text-xl leading-8 text-zinc-400">
                {APP_NAME} is a study OS with proof-backed accountability, an intelligent dashboard, and AI tools that work at every price point.
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

              <div className="animate-fade-up delay-500 mt-8 flex flex-wrap gap-x-7 gap-y-2">
                {["Free forever core", "Proof-backed tasks", "AI study tools"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-zinc-500">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400/60" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Wave divider ── */}
        <div className="relative z-10 -mb-px overflow-hidden" style={{ height: "100px" }}>
          <svg viewBox="0 0 1440 100" className="absolute bottom-0 w-full" preserveAspectRatio="none" style={{ height: "100px" }}>
            <path d="M0,60 C400,100 1040,0 1440,60 L1440,100 L0,100 Z" fill="rgba(255,255,255,0.013)" />
          </svg>
        </div>

        {/* ── STATS (keep 50K+ etc.) ── */}
        <section className="py-24" style={{ background: "rgba(255,255,255,0.01)" }}>
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-14 text-center sm:grid-cols-3">
              {MARKETING_METRICS.map((metric) => (
                <div key={metric.label}>
                  <p
                    className="font-black leading-none tracking-tight text-white"
                    style={{ fontSize: "clamp(3rem, 8vw, 6rem)" }}
                  >
                    {metric.value}
                  </p>
                  <p className="mt-4 text-base text-zinc-500">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Wave divider (flipped) ── */}
        <div className="relative z-10 -mt-px overflow-hidden" style={{ height: "100px" }}>
          <svg viewBox="0 0 1440 100" className="absolute top-0 w-full" preserveAspectRatio="none" style={{ height: "100px" }}>
            <path d="M0,40 C400,0 1040,100 1440,40 L1440,0 L0,0 Z" fill="rgba(255,255,255,0.01)" />
          </svg>
        </div>

        {/* ── FEATURES (editorial numbered rows) ── */}
        <section id="features" className="mx-auto max-w-7xl px-6 py-32">
          <div className="mb-20">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-indigo-400/70">
              Built for serious students
            </p>
            <h2
              className="mt-5 max-w-2xl font-black tracking-tight text-white"
              style={{ fontSize: "clamp(2.5rem, 5.5vw, 4.75rem)", lineHeight: "1.04" }}
            >
              Your tasks, focus windows, and AI. One system.
            </h2>
          </div>

          <div className="feature-rows">
            {FEATURE_PILLARS.map((pillar, i) => {
              const Icon = PILLAR_ICONS[i] || BarChart3;
              return (
                <div
                  key={pillar.title}
                  className="feature-row border-t border-white/[0.06] py-12 grid gap-6 md:gap-16 md:grid-cols-[96px_280px_1fr] items-start"
                >
                  <span className="text-[5.5rem] font-black text-white/[0.04] leading-none select-none tracking-tighter">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15">
                      <Icon className="h-5 w-5 text-indigo-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white leading-tight">{pillar.title}</h3>
                  </div>
                  <p className="text-lg leading-8 text-zinc-400">{pillar.copy}</p>
                </div>
              );
            })}
            <div className="border-t border-white/[0.06]" />
          </div>
        </section>

        {/* ── PREMIUM AI (immersive full-section) ── */}
        <section id="premium" className="relative overflow-hidden py-36">
          <div className="pointer-events-none absolute inset-0">
            <div className="orb orb-violet absolute" style={{ width: "750px", height: "750px", top: "-150px", right: "-200px", opacity: 0.45 }} />
            <div className="orb orb-indigo absolute" style={{ width: "550px", height: "550px", bottom: "-120px", left: "-100px", opacity: 0.4 }} />
            <div
              className="morph absolute opacity-[0.09]"
              style={{
                width: "550px", height: "550px",
                top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                background: "radial-gradient(circle, rgba(139,92,246,0.9) 0%, rgba(99,102,241,0.45) 40%, transparent 70%)",
                filter: "blur(65px)",
              }}
            />
            <div className="noise-overlay absolute inset-0" />
          </div>

          <div className="relative z-10 mx-auto max-w-7xl px-6">
            <div className="grid items-start gap-20 lg:grid-cols-2">
              <div>
                <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-3.5 py-1.5 ring-1 ring-violet-400/20">
                  <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                  <span className="text-xs font-semibold text-violet-300">Premium AI tools</span>
                </div>
                <h2
                  className="font-black tracking-tight text-white"
                  style={{ fontSize: "clamp(2.5rem, 5.5vw, 4.75rem)", lineHeight: "1.04" }}
                >
                  Five AI tools.
                  <br />
                  <span className="gradient-text">One workspace.</span>
                </h2>
                <p className="mt-8 text-xl leading-8 text-zinc-400">
                  Premium is intentionally priced at $5/month for everyday use. Power at $20/month gives serious users best-model routing and bigger limits.
                </p>
                <div className="mt-10 flex flex-wrap gap-3">
                  <LinkButton to="/pricing" variant="primary">
                    Compare plans <ArrowRight className="h-4 w-4" />
                  </LinkButton>
                  <LinkButton to="/signup" variant="ghost">
                    Start with free
                  </LinkButton>
                </div>
              </div>

              {/* Tools as editorial left-border list — no individual boxes */}
              <div>
                {AI_TOOLS_DISPLAY.map((tool) => (
                  <div
                    key={tool.label}
                    className="flex items-start gap-5 border-t border-white/[0.06] py-7 last:border-b last:mb-0"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/12">
                      <tool.icon className="h-5 w-5 text-violet-300" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-white">{tool.label}</p>
                      <p className="mt-1 text-sm leading-6 text-zinc-500">{tool.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section className="mx-auto max-w-7xl px-6 py-28">
          <div className="mb-16 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-indigo-400/70">Simple pricing</p>
            <h2
              className="mt-4 font-black tracking-tight text-white"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3.75rem)", lineHeight: "1.08" }}
            >
              A free core, an affordable AI tier,
              <br className="hidden md:block" /> and one power tier.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-400">
              Start free for task and dashboard management. Unlock everyday AI with Premium. Reserve Power for users who need the strongest model.
            </p>
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            {PLAN_ORDER.map((key) => {
              const plan = PLAN_DETAILS[key];
              const accent = PLAN_ACCENTS[key];
              return (
                <div
                  key={plan.name}
                  className={cn(
                    "relative flex flex-col rounded-3xl p-8 transition-all duration-300",
                    accent.highlight
                      ? "gradient-ring bg-white/[0.04] scale-[1.025]"
                      : "bg-white/[0.025]",
                  )}
                >
                  {accent.highlight && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-indigo-500 px-4 py-1 text-xs font-bold text-white shadow-[0_0_24px_rgba(99,102,241,0.5)]">
                        Most popular
                      </span>
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
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

        {/* ── BOTTOM CTA ── */}
        <section className="relative overflow-hidden py-40">
          <div className="pointer-events-none absolute inset-0">
            <div className="orb orb-indigo absolute" style={{ width: "650px", height: "650px", top: "-200px", left: "5%", opacity: 0.38 }} />
            <div className="orb orb-violet absolute" style={{ width: "550px", height: "550px", bottom: "-150px", right: "5%", opacity: 0.35 }} />
            <div
              className="morph absolute opacity-[0.07]"
              style={{
                width: "700px", height: "700px",
                top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                background: "radial-gradient(circle, rgba(99,102,241,0.9) 0%, rgba(139,92,246,0.5) 40%, transparent 70%)",
                filter: "blur(60px)",
              }}
            />
            <div className="noise-overlay absolute inset-0" />
          </div>

          <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
            <h2
              className="font-black tracking-tight text-white"
              style={{ fontSize: "clamp(2.75rem, 6.5vw, 5.5rem)", lineHeight: "1.04" }}
            >
              Ready to build a real study system?
            </h2>
            <p className="mx-auto mt-7 max-w-lg text-xl leading-8 text-zinc-400">
              Start free today. No credit card required. Upgrade to AI when you need more leverage.
            </p>
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <LinkButton to="/signup" variant="primary" size="lg">
                Create free account
                <ArrowRight className="h-4 w-4" />
              </LinkButton>
              <LinkButton to="/pricing" variant="secondary" size="lg">
                View all plans
              </LinkButton>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
