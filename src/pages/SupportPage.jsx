import { Mail, ShieldCheck, AlertTriangle, FileText } from "lucide-react";
import { PublicFooter, PublicHeader } from "../components/layout";
import { LinkButton, SectionHeading } from "../components/ui";

export default function SupportPage() {
  return (
    <div className="min-h-screen" style={{ background: "#08081a" }}>
      <PublicHeader />
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-3xl px-6 py-20">
        <SectionHeading
          eyebrow="Support"
          title="Help, billing, and proof-flow guidance"
          description="If something in StudySync feels unclear, this page is the public home for support and key product expectations."
        />

        <div className="mt-12 space-y-8">
          {/* Contact */}
          <div className="flex gap-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 mt-0.5">
              <Mail className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Contact support</h2>
              <p className="mt-2 text-2xl font-bold text-indigo-300">omarkhalafbusiness@gmail.com</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Use this email for account help, billing questions, bug reports, refund conversations, and general product support.
              </p>
            </div>
          </div>

          {/* Proof workflow */}
          <div className="flex gap-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 mt-0.5">
              <ShieldCheck className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">How proof completion works</h2>
              <p className="mt-2 mb-4 text-sm leading-6 text-slate-400">
                StudySync collects proof when a task is completed, not when it is first created. That keeps task capture fast and makes verification happen at the right moment.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    plan: "Free plan",
                    desc: "Submit a public Google Doc link as proof. The doc should contain the actual study proof and include a picture or screenshot related to the subject.",
                  },
                  {
                    plan: "Premium & Power",
                    desc: "Upload image proof directly inside the completion flow. This is the cleaner and more reliable path for photo- or screenshot-based proof.",
                  },
                ].map(({ plan, desc }) => (
                  <div key={plan} className="rounded-xl bg-white/[0.025] p-4">
                    <p className="text-sm font-semibold text-white">{plan}</p>
                    <p className="mt-2 text-xs leading-5 text-slate-400">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Google Doc warning */}
          <div className="flex gap-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 mt-0.5">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Google Doc proof warning</h2>
              <div className="mt-2 space-y-2 text-sm leading-6 text-slate-400">
                <p>The Google Doc must be shared publicly so StudySync can read it. If the doc is private, restricted, or missing usable proof content, the app may not allow completion.</p>
                <p>Make sure the document is public and includes a clear picture or screenshot tied to the subject you are submitting proof for.</p>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="flex gap-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] mt-0.5">
              <FileText className="h-5 w-5 text-slate-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Common links</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <LinkButton to="/pricing">View pricing</LinkButton>
                <LinkButton to="/terms" variant="secondary">Terms</LinkButton>
                <LinkButton to="/privacy" variant="secondary">Privacy</LinkButton>
                <LinkButton to="/refunds" variant="secondary">Refunds</LinkButton>
                <LinkButton to="/cookies" variant="secondary">Cookies</LinkButton>
                <LinkButton to="/signup" variant="ghost">Create account</LinkButton>
              </div>
            </div>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
