import { PublicFooter, PublicHeader } from "../components/layout";
import { Card, SectionHeading } from "../components/ui";

export default function TermsPage() {
  return (
    <div className="grid-glow min-h-screen">
      <PublicHeader />
      <main className="mx-auto max-w-5xl px-6 py-16">
        <SectionHeading
          eyebrow="Terms"
          title="StudySync Terms of Service"
          description="These terms explain the basic rules for using StudySync, paid plans, and AI-powered features."
        />

        <div className="mt-10 grid gap-6">
          <Card>
            <h2 className="text-2xl font-bold text-white">Using StudySync</h2>
            <p className="mt-4 text-slate-300">
              StudySync is provided as a productivity and study-planning platform for students. You agree to use the
              product lawfully, provide accurate account information, and avoid abusing the app, billing flows, or AI
              tools.
            </p>
          </Card>

          <Card>
            <h2 className="text-2xl font-bold text-white">Accounts and responsibility</h2>
            <p className="mt-4 text-slate-300">
              You are responsible for activity that happens under your account and for keeping your login credentials
              secure. You should not share access in a way that bypasses plan limits or platform protections.
            </p>
          </Card>

          <Card>
            <h2 className="text-2xl font-bold text-white">Paid plans and billing</h2>
            <p className="mt-4 text-slate-300">
              Paid subscriptions are processed by Stripe. When you subscribe to Premium or Power, you authorize
              recurring billing at the plan price shown at checkout until you cancel. Plan changes, billing management,
              and cancellations are handled through the Stripe billing portal linked inside the app.
            </p>
          </Card>

          <Card>
            <h2 className="text-2xl font-bold text-white">AI features and proof verification</h2>
            <p className="mt-4 text-slate-300">
              StudySync uses AI to generate study content and to help verify certain proof submissions. AI output can be
              helpful, but it may be incomplete or incorrect, so users should still exercise judgment before relying on
              it for academic decisions.
            </p>
          </Card>

          <Card>
            <h2 className="text-2xl font-bold text-white">Availability and changes</h2>
            <p className="mt-4 text-slate-300">
              We may improve, limit, or change product features over time, including AI usage limits, plan packaging,
              and verification flows. We aim to do that transparently and in a way that keeps the service reliable for
              users.
            </p>
          </Card>

          <Card>
            <h2 className="text-2xl font-bold text-white">Contact</h2>
            <p className="mt-4 text-slate-300">
              Questions about these terms can be sent to omarkhalafbusiness@gmail.com.
            </p>
          </Card>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
