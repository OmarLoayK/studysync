import { Database, Cpu, Users, Eye, Settings2, Mail } from "lucide-react";
import { PublicFooter, PublicHeader } from "../components/layout";
import { APP_NAME } from "../lib/constants";

const SECTIONS = [
  {
    icon: Database,
    title: "What we collect",
    body: "StudySync stores the information needed to run your workspace, including your account email, profile details, tasks, settings, study preferences, billing state, and AI usage counters.",
  },
  {
    icon: Cpu,
    title: "How the product uses your data",
    body: "Your data is used to authenticate your account, show your dashboard, save study progress, manage subscriptions, and provide AI and proof-verification features inside the app.",
  },
  {
    icon: Users,
    title: "Third-party services",
    body: "StudySync uses Firebase (Google) for authentication, database, and storage services, Stripe for billing and subscription management, Vercel for hosting and serverless functions, and OpenAI for AI generation and proof-verification workflows.",
  },
  {
    icon: Eye,
    title: "Proof verification note",
    body: "When a free user submits a Google Doc as proof, the app may inspect readable document text and, when available, publicly reachable images to decide whether the proof matches the task subject.",
  },
  {
    icon: Settings2,
    title: "Your choices",
    body: "You can update profile and settings data inside the app, delete your account from the Account page (this permanently removes all your data), cancel your paid subscription through the billing portal, and contact support for any data questions.",
  },
  {
    icon: Mail,
    title: "Contact",
    body: "Privacy questions can be sent to omarkhalafbusiness@gmail.com. We aim to respond within 5 business days.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ background: "#08081a" }}>
      <PublicHeader />

      <main className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-indigo-400/70">Legal</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-white md:text-5xl">{APP_NAME} Privacy Policy</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-400">
            What we store, what third-party services power the product, and how to contact support.
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
