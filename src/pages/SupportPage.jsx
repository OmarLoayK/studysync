import { PublicFooter, PublicHeader } from "../components/layout";
import { Badge, Card, LinkButton, SectionHeading } from "../components/ui";

export default function SupportPage() {
  return (
    <div className="grid-glow min-h-screen">
      <PublicHeader />
      <main className="mx-auto max-w-5xl px-6 py-16">
        <SectionHeading
          eyebrow="Support"
          title="Help, billing questions, and proof-flow guidance"
          description="If something in StudySync feels unclear, this page is the public-facing home for support and key product expectations."
        />

        <div className="mt-10 grid gap-6">
          <Card>
            <Badge className="bg-sky-500/15 text-sky-200 ring-sky-400/25">Support email</Badge>
            <h2 className="mt-4 text-3xl font-bold text-white">omarkhalafbusiness@gmail.com</h2>
            <p className="mt-4 text-slate-300">
              Use this email for account help, billing questions, bug reports, refund conversations, and general product
              support.
            </p>
          </Card>

          <Card>
            <h2 className="text-2xl font-bold text-white">How proof completion works</h2>
            <p className="mt-4 text-slate-300">
              StudySync now collects proof when a task is completed, not when the task is first created. That keeps task
              capture fast and makes verification happen at the right moment.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-[22px] border border-white/10 bg-slate-950/60 p-4">
                <p className="font-semibold text-white">Free plan</p>
                <p className="mt-2 text-sm text-slate-400">
                  Submit a public Google Doc link as proof. For the strongest results, the doc should contain the actual
                  study proof and include a picture or screenshot related to the subject.
                </p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-slate-950/60 p-4">
                <p className="font-semibold text-white">Premium and Power</p>
                <p className="mt-2 text-sm text-slate-400">
                  Upload image proof directly inside the completion flow. This is the cleaner and more reliable path for
                  photo- or screenshot-based proof.
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-2xl font-bold text-white">Important Google Doc warning</h2>
            <p className="mt-4 text-slate-300">
              The Google Doc must be shared publicly so StudySync can read it. If the doc is private, restricted, or
              missing usable proof content, the app may not allow completion.
            </p>
            <p className="mt-3 text-slate-300">
              If you want the free proof path to work well, make sure the document is public and includes a clear picture
              or screenshot tied to the subject you are submitting proof for.
            </p>
          </Card>

          <Card>
            <h2 className="text-2xl font-bold text-white">Common links</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              <LinkButton to="/pricing">View pricing</LinkButton>
              <LinkButton to="/terms" variant="secondary">
                Terms
              </LinkButton>
              <LinkButton to="/privacy" variant="secondary">
                Privacy
              </LinkButton>
            </div>
          </Card>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
