import { Cookie, Shield, BarChart3, Settings2, CheckCircle2, Mail } from "lucide-react";
import { PublicFooter, PublicHeader } from "../components/layout";
import { APP_NAME } from "../lib/constants";

const SECTIONS = [
  {
    icon: Cookie,
    title: "What are cookies?",
    body: "Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences and understand how you use the product.",
  },
  {
    icon: Shield,
    title: "Essential cookies",
    body: "These are required for StudySync to function. They include Firebase Authentication session tokens that keep you logged in, and security cookies that protect against cross-site request forgery. You cannot opt out of essential cookies and continue using the product.",
  },
  {
    icon: BarChart3,
    title: "Third-party cookies",
    body: "StudySync uses Firebase (Google) for authentication and database storage, Stripe for payment processing, and OpenAI for AI features. These providers may set their own cookies governed by their privacy policies. We do not use advertising cookies or sell your data to advertisers.",
  },
  {
    icon: Settings2,
    title: "Managing cookies",
    body: "You can control cookies through your browser settings. Blocking essential cookies will prevent you from logging in. Most browsers let you view, delete, or block cookies at any time — check your browser's help documentation for instructions.",
  },
  {
    icon: CheckCircle2,
    title: "Cookie duration",
    body: "Session cookies expire when you close your browser. Persistent cookies (such as Firebase session tokens) are stored for up to 30 days so you can stay logged in between visits. You can clear them at any time by signing out or clearing your browser storage.",
  },
  {
    icon: Mail,
    title: "Questions",
    body: "If you have questions about how we use cookies, email omarkhalafbusiness@gmail.com. We aim to respond within 5 business days.",
  },
];

export default function CookiesPage() {
  return (
    <div className="min-h-screen" style={{ background: "#08081a" }}>
      <PublicHeader />

      <main className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-indigo-400/70">Legal</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-white md:text-5xl">Cookie Policy</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-400">
            How {APP_NAME} uses cookies and similar technologies to keep your session secure.
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
