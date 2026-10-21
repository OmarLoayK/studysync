import { Scale, User, CreditCard, Sparkles, RefreshCw, Mail } from "lucide-react";
import { PublicFooter, PublicHeader } from "../components/layout";
import { APP_NAME } from "../lib/constants";

const SECTIONS = [
  {
    icon: Scale,
    title: "Using StudySync",
    body: "StudySync is provided as a productivity and study-planning platform for students. You agree to use the product lawfully, provide accurate account information, and avoid abusing the app, billing flows, or AI tools.",
  },
  {
    icon: User,
    title: "Accounts and responsibility",
    body: "You are responsible for activity that happens under your account and for keeping your login credentials secure. You should not share access in a way that bypasses plan limits or platform protections.",
  },
  {
    icon: CreditCard,
    title: "Paid plans and billing",
    body: "Paid subscriptions are processed by Stripe. When you subscribe to Premium or Power, you authorize recurring billing at the plan price shown at checkout until you cancel. Plan changes, billing management, and cancellations are handled through the Stripe billing portal linked inside the app.",
  },
  {
    icon: Sparkles,
    title: "AI features and proof verification",
    body: "StudySync uses AI to generate study content and to help verify certain proof submissions. AI output can be helpful, but it may be incomplete or incorrect, so users should exercise judgment before relying on it for academic decisions.",
  },
  {
    icon: RefreshCw,
    title: "Availability and changes",
    body: "We may improve, limit, or change product features over time, including AI usage limits, plan packaging, and verification flows. We aim to do that transparently and in a way that keeps the service reliable for users.",
  },
  {
    icon: Mail,
    title: "Contact",
    body: "Questions about these terms can be sent to omarkhalafbusiness@gmail.com. We aim to respond within 5 business days.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ background: "#08081a" }}>
      <PublicHeader />

      <main className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-indigo-400/70">Legal</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-white md:text-5xl">{APP_NAME} Terms of Service</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-400">
            The basic rules for using StudySync, paid plans, and AI-powered features.
          </p>
          <p className="mt-3 text-sm text-slate-600">Last updated October 2026</p>
        </div>

        <div className="space-y-8">
          {SECTIONS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 mt-0.5">
                <Icon className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{title}</h2>
                <p className="mt-2 text-sm leading-7 text-slate-400">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
