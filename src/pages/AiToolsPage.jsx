import { useMemo, useState } from "react";
import { AI_TOOLS } from "../lib/constants";
import { useAuth } from "../contexts/AuthContext";
import { generateAiResult } from "../services/api";
import { Badge, Button, Card, EmptyState, ProgressBar, SectionHeading, TextArea, TextInput } from "../components/ui";

function ResultRenderer({ tool, result }) {
  if (!result) return null;

  if (tool === "planner") {
    return (
      <div className="space-y-4">
        <Card className="bg-slate-950/70">
          <h3 className="text-2xl font-bold text-white">{result.title}</h3>
          <p className="mt-3 text-slate-300">{result.summary}</p>
        </Card>
        <div className="grid gap-4">
          {result.schedule?.map((item) => (
            <Card key={`${item.day}-${item.focus}`} className="bg-slate-950/70">
              <p className="text-sm uppercase tracking-[0.18em] text-sky-300/80">{item.day}</p>
              <h4 className="mt-2 text-xl font-bold text-white">{item.focus}</h4>
              <p className="mt-2 text-slate-300">{item.deliverables}</p>
              <p className="mt-3 text-sm text-slate-500">{item.duration}</p>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (tool === "quiz") {
    return (
      <div className="grid gap-4">
        {result.questions?.map((question, index) => (
          <Card key={`${question.question}-${index}`} className="bg-slate-950/70">
            <p className="text-sm uppercase tracking-[0.18em] text-sky-300/80">Question {index + 1}</p>
            <h4 className="mt-2 text-xl font-bold text-white">{question.question}</h4>
            <div className="mt-4 grid gap-2 text-slate-300">
              {question.options?.map((option) => <p key={option}>• {option}</p>)}
            </div>
            <p className="mt-4 text-sm text-emerald-300">Answer: {question.answer}</p>
            <p className="mt-2 text-sm text-slate-400">{question.explanation}</p>
          </Card>
        ))}
      </div>
    );
  }

  if (tool === "flashcards") {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {result.cards?.map((card) => (
          <Card key={card.front} className="bg-slate-950/70">
            <p className="text-sm uppercase tracking-[0.18em] text-sky-300/80">Front</p>
            <h4 className="mt-2 text-xl font-bold text-white">{card.front}</h4>
            <p className="mt-5 text-sm uppercase tracking-[0.18em] text-teal-300/80">Back</p>
            <p className="mt-2 text-slate-300">{card.back}</p>
          </Card>
        ))}
      </div>
    );
  }

  if (tool === "explainer") {
    return (
      <Card className="bg-slate-950/70">
        <h3 className="text-2xl font-bold text-white">{result.title}</h3>
        <p className="mt-3 text-slate-300">{result.summary}</p>
        <div className="mt-4 grid gap-3 text-slate-300">
          {result.explanation?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {result.phases?.map((phase) => (
        <Card key={phase.name} className="bg-slate-950/70">
          <p className="text-sm uppercase tracking-[0.18em] text-sky-300/80">{phase.estimate}</p>
          <h4 className="mt-2 text-xl font-bold text-white">{phase.name}</h4>
          <p className="mt-2 text-slate-300">{phase.goal}</p>
          <div className="mt-4 grid gap-2 text-slate-300">
            {phase.tasks?.map((task) => <p key={task}>• {task}</p>)}
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function AiToolsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [selectedTool, setSelectedTool] = useState(AI_TOOLS[0].key);
  const [formState, setFormState] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const activeTool = useMemo(() => AI_TOOLS.find((tool) => tool.key === selectedTool), [selectedTool]);
  const isPremium = profile?.plan?.tier === "premium";

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const payload = Object.fromEntries(activeTool.fields.map((field) => [field.name, formState[field.name]?.trim() ?? ""]));
      const response = await generateAiResult(user, { tool: activeTool.key, payload });
      setResult(response.result);
      await refreshProfile();
    } catch (caughtError) {
      setError(caughtError.message || "AI generation failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <SectionHeading eyebrow="Premium AI" title="Lean, useful AI tools for real study work" description="StudySync keeps prompts tight, usage capped, and outputs structured so the premium tier can survive at $5/month." />
      <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <div className="space-y-6">
          <Card>
            <p className="text-sm uppercase tracking-[0.24em] text-sky-300/80">Plan status</p>
            <h2 className="mt-2 text-2xl font-bold text-white">{isPremium ? "Premium AI is active" : "Premium required for AI tools"}</h2>
            <p className="mt-3 text-slate-400">
              {isPremium ? "Your account can generate study plans, quizzes, flashcards, explainers, and breakdowns." : "Upgrade in Billing to unlock premium AI tools, smarter planning, and advanced study leverage."}
            </p>
            <div className="mt-6">
              <ProgressBar label="Monthly AI credits" value={profile?.usage?.aiGenerationsUsed ?? 0} max={profile?.usage?.aiGenerationsLimit ?? 60} helper={isPremium ? "Credits reset monthly. Use them on the tools that unblock you most." : "Free plan keeps AI disabled."} />
            </div>
          </Card>

          <div className="grid gap-4">
            {AI_TOOLS.map((tool) => (
              <button
                key={tool.key}
                type="button"
                onClick={() => setSelectedTool(tool.key)}
                className={`rounded-[24px] border p-5 text-left transition ${selectedTool === tool.key ? "border-sky-400/30 bg-sky-500/10" : "border-white/10 bg-slate-900/70 hover:bg-white/5"}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-white">{tool.label}</h3>
                  <Badge className="bg-slate-950 text-slate-300 ring-white/10">{tool.shortLabel}</Badge>
                </div>
                <p className="mt-3 text-sm text-slate-400">{tool.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-sky-300/80">Generator</p>
                <h2 className="mt-2 text-2xl font-bold text-white">{activeTool.label}</h2>
              </div>
              <Badge className={isPremium ? "bg-emerald-500/15 text-emerald-200 ring-emerald-400/25" : "bg-rose-500/15 text-rose-200 ring-rose-400/25"}>
                {isPremium ? "Premium unlocked" : "Locked"}
              </Badge>
            </div>

            {!isPremium ? (
              <div className="mt-6">
                <EmptyState
                  title="Upgrade to use premium AI"
                  copy="The AI layer is gated by active Stripe subscription status, then rate-limited through monthly usage credits to keep costs controlled."
                  action={<Button as="a" href="/app/billing">Open billing</Button>}
                />
              </div>
            ) : (
              <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
                {activeTool.fields.map((field) =>
                  field.type === "textarea" ? (
                    <TextArea key={field.name} label={field.label} placeholder={field.placeholder} value={formState[field.name] ?? ""} onChange={(event) => setFormState((current) => ({ ...current, [field.name]: event.target.value }))} required />
                  ) : (
                    <TextInput key={field.name} label={field.label} placeholder={field.placeholder} value={formState[field.name] ?? ""} onChange={(event) => setFormState((current) => ({ ...current, [field.name]: event.target.value }))} required />
                  ),
                )}
                {error ? <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}
                <Button type="submit" size="lg" disabled={submitting}>{submitting ? "Generating..." : `Generate ${activeTool.shortLabel}`}</Button>
              </form>
            )}
          </Card>

          {result ? (
            <Card>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-sky-300/80">Result</p>
                  <h2 className="mt-2 text-2xl font-bold text-white">{activeTool.label} output</h2>
                </div>
                <Badge className="bg-slate-950 text-slate-300 ring-white/10">Saved to Firestore</Badge>
              </div>
              <div className="mt-6"><ResultRenderer tool={selectedTool} result={result} /></div>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
