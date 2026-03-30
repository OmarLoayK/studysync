import { PublicFooter, PublicHeader } from "../components/layout";
import { Card, SectionHeading } from "../components/ui";

export default function PrivacyPage() {
  return (
    <div className="grid-glow min-h-screen">
      <PublicHeader />
      <main className="mx-auto max-w-5xl px-6 py-16">
        <SectionHeading
          eyebrow="Privacy"
          title="StudySync Privacy Policy"
          description="This page explains what StudySync stores, what third-party services power the product, and how users can contact support."
        />

        <div className="mt-10 grid gap-6">
          <Card>
            <h2 className="text-2xl font-bold text-white">What we collect</h2>
            <p className="mt-4 text-slate-300">
              StudySync stores the information needed to run your workspace, including your account email, profile
              details, tasks, settings, study preferences, billing state, and AI usage counters.
            </p>
          </Card>

          <Card>
            <h2 className="text-2xl font-bold text-white">How the product uses your data</h2>
            <p className="mt-4 text-slate-300">
              Your data is used to authenticate your account, show your dashboard, save study progress, manage
              subscriptions, and provide AI and proof-verification features inside the app.
            </p>
          </Card>

          <Card>
            <h2 className="text-2xl font-bold text-white">Third-party services</h2>
            <p className="mt-4 text-slate-300">
              StudySync uses Firebase for authentication, database, and storage services, Stripe for billing and
              subscription management, Vercel for hosting and serverless functions, and OpenAI for AI generation and
              proof-verification workflows.
            </p>
          </Card>

          <Card>
            <h2 className="text-2xl font-bold text-white">Proof verification note</h2>
            <p className="mt-4 text-slate-300">
              When a free user submits a Google Doc as proof, the app may inspect readable document text and, when
              available, publicly reachable images exported from that document to decide whether the proof matches the
              task subject.
            </p>
          </Card>

          <Card>
            <h2 className="text-2xl font-bold text-white">Your choices</h2>
            <p className="mt-4 text-slate-300">
              You can update profile and settings data inside the app, cancel your paid subscription through the billing
              portal, and contact support if you want help with account issues or data questions.
            </p>
          </Card>

          <Card>
            <h2 className="text-2xl font-bold text-white">Contact</h2>
            <p className="mt-4 text-slate-300">
              Privacy questions can be sent to omarkhalafbusiness@gmail.com.
            </p>
          </Card>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
