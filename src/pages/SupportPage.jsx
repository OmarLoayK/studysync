import { Mail, ShieldCheck, FileText, AlertTriangle, ExternalLink } from "lucide-react";
import { PublicFooter, PublicHeader } from "../components/layout";
import { LinkButton, SectionHeading } from "../components/ui";

function SupportCard({ icon: Icon, iconColor, title, children }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/[0.04]`}>
          <Icon className={`h-5 w-5 ${iconColor || "text-sky-400"}`} />
        </div>
        <h2 className="text-lg font-bold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default function SupportPage() {
  return (
    <div className="grid-glow min-h-screen" style={{ background: "#07071c" }}>
      <PublicHeader />
      <main className="mx-auto max-w-3xl px-6 py-20">
        <SectionHeading
          eyebrow="Support"
          title="Help, billing, and proof-flow guidance"
          description="If something in StudySync feels unclear, this page is the public home for support and key product expectations."
        />

        <div className="mt-10 space-y-4">
          <SupportCard icon={Mail} title="Contact support">
            <p className="text-2xl font-bold text-sky-300">omarkhalafbusiness@gmail.com</p>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Use this email for account help, billing questions, bug reports, refund conversations, and general product support.
            </p>
          </SupportCard>

          <SupportCard icon={ShieldCheck} title="How proof completion works" iconColor="text-violet-400">
            <p className="mb-4 text-sm leading-6 text-slate-400">
              StudySync collects proof when a task is completed, not when the task is first created. That keeps task capture fast and makes verification happen at the right moment.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  plan: "Free plan",
                  desc: "Submit a public Google Doc link as proof. For best results, the doc should contain the actual study proof and include a picture or screenshot related to the subject.",
                },
                {
                  plan: "Premium & Power",
                  desc: "Upload image proof directly inside the completion flow. This is the cleaner and more reliable path for photo- or screenshot-based proof.",
                },
              ].map(({ plan, desc }) => (
                <div key={plan} className="rounded-xl border border-white/7 bg-white/[0.02] p-4">
                  <p className="text-sm font-semibold text-white">{plan}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-400">{desc}</p>
                </div>
              ))}
            </div>
          </SupportCard>

          <SupportCard icon={AlertTriangle} title="Google Doc proof warning" iconColor="text-amber-400">
            <div className="space-y-2 text-sm leading-6 text-slate-400">
              <p>The Google Doc must be shared publicly so StudySync can read it. If the doc is private, restricted, or missing usable proof content, the app may not allow completion.</p>
              <p>If you want the free proof path to work well, make sure the document is public and includes a clear picture or screenshot tied to the subject you are submitting proof for.</p>
            </div>
          </SupportCard>

          <SupportCard icon={FileText} title="Common links" iconColor="text-slate-400">
            <div className="flex flex-wrap gap-2">
              <LinkButton to="/pricing">View pricing</LinkButton>
              <LinkButton to="/terms" variant="secondary">Terms</LinkButton>
              <LinkButton to="/privacy" variant="secondary">Privacy</LinkButton>
              <LinkButton to="/signup" variant="ghost">Create account</LinkButton>
            </div>
          </SupportCard>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
