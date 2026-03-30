import { useEffect, useMemo, useState } from "react";
import { AI_TOOLS } from "../lib/constants";
import { useAuth } from "../contexts/AuthContext";
import { generateAiResult } from "../services/api";
import { Badge, Button, Card, EmptyState, ProgressBar, SectionHeading, Select, TextArea, TextInput } from "../components/ui";

function normalizeAnswer(value = "") {
  return value.trim().toLowerCase();
}

function isCorrectAnswer(question, answer) {
  return normalizeAnswer(question.answer) === normalizeAnswer(answer);
}

function getQuizOptions(question) {
  if (Array.isArray(question.options) && question.options.length > 0) {
    return question.options;
  }

  if (question.type === "true-false") {
    return ["True", "False"];
  }

  return [];
}

function buildInitialFormState(tool) {
  return tool.fields.reduce((accumulator, field) => {
    accumulator[field.name] = field.defaultValue ?? "";
    return accumulator;
  }, {});
}

function ResultRenderer({ tool, result, resultKey, onPerfectRun }) {
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
    return <InteractiveQuizResult key={resultKey} result={result} onPerfectRun={onPerfectRun} />;
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
            {phase.tasks?.map((task) => <p key={task}>- {task}</p>)}
          </div>
        </Card>
      ))}
    </div>
  );
}

function InteractiveQuizResult({ result, onPerfectRun }) {
  const questions = result.questions ?? [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [perfectAwarded, setPerfectAwarded] = useState(false);

  const question = questions[currentIndex];
  const options = getQuizOptions(question || {});
  const answeredCorrectly = question ? isCorrectAnswer(question, selectedAnswer) : false;

  function handleReveal() {
    if (!question || !selectedAnswer) return;

    if (!revealed && answeredCorrectly) {
      setScore((current) => current + 1);
    }

    setRevealed(true);
  }

  async function handleAdvance() {
    if (!question) return;

    const atLastQuestion = currentIndex === questions.length - 1;

    if (atLastQuestion) {
      const finalScore = score + (revealed && answeredCorrectly ? 0 : 0);
      const perfectRun = finalScore === questions.length && questions.length > 0;
      setCompleted(true);

      if (perfectRun && !perfectAwarded) {
        setPerfectAwarded(true);
        await onPerfectRun?.();
      }
      return;
    }

    setCurrentIndex((current) => current + 1);
    setSelectedAnswer("");
    setRevealed(false);
  }

  function handleRestart() {
    setCurrentIndex(0);
    setSelectedAnswer("");
    setRevealed(false);
    setScore(0);
    setCompleted(false);
    setPerfectAwarded(false);
  }

  if (!question && !completed) {
    return <p className="text-slate-400">The quiz is empty. Try generating again.</p>;
  }

  if (completed) {
    const perfectRun = score === questions.length && questions.length > 0;

    return (
      <div className="space-y-4">
        <Card className="bg-slate-950/70">
          <p className="text-sm uppercase tracking-[0.18em] text-sky-300/80">Quiz complete</p>
          <h3 className="mt-2 text-2xl font-bold text-white">{result.title}</h3>
          <p className="mt-3 text-slate-300">{result.summary}</p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Badge className={perfectRun ? "bg-emerald-500/15 text-emerald-200 ring-emerald-400/25" : "bg-slate-900 text-slate-300 ring-white/10"}>
              Score {score}/{questions.length}
            </Badge>
            {perfectRun ? (
              <Badge className="bg-amber-500/15 text-amber-100 ring-amber-400/25">Perfect run unlocked</Badge>
            ) : null}
          </div>
          <p className="mt-4 text-sm text-slate-400">
            {perfectRun
              ? "You got every question right. A perfect run trophy was added to your account."
              : "Review the explanations, then run it back for a cleaner score."}
          </p>
          <div className="mt-5">
            <Button variant="secondary" onClick={handleRestart}>Restart quiz</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-slate-950/70">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-sky-300/80">Question {currentIndex + 1} of {questions.length}</p>
            <h3 className="mt-2 text-2xl font-bold text-white">{result.title}</h3>
          </div>
          <Badge className="bg-slate-900 text-slate-300 ring-white/10">Score {score}/{questions.length}</Badge>
        </div>
        <p className="mt-4 text-lg font-semibold text-white">{question.question}</p>
        <div className="mt-5 grid gap-3">
          {options.map((option) => {
            const selected = selectedAnswer === option;
            const correctOption = normalizeAnswer(question.answer) === normalizeAnswer(option);
            const revealTone = revealed
              ? correctOption
                ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100"
                : selected
                  ? "border-rose-400/35 bg-rose-500/10 text-rose-100"
                  : "border-white/10 bg-slate-900/80 text-slate-300"
              : selected
                ? "border-sky-400/35 bg-sky-500/10 text-sky-100"
                : "border-white/10 bg-slate-900/80 text-slate-300 hover:bg-white/5";

            return (
              <button
                key={option}
                type="button"
                className={`rounded-2xl border px-4 py-4 text-left transition ${revealTone}`}
                onClick={() => {
                  if (!revealed) {
                    setSelectedAnswer(option);
                  }
                }}
              >
                {option}
              </button>
            );
          })}
        </div>

        {!revealed ? (
          <div className="mt-5">
            <Button onClick={handleReveal} disabled={!selectedAnswer}>Check answer</Button>
          </div>
        ) : (
          <div className={`mt-5 rounded-[24px] border px-4 py-4 ${answeredCorrectly ? "border-emerald-400/25 bg-emerald-500/10" : "border-rose-400/25 bg-rose-500/10"}`}>
            <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${answeredCorrectly ? "text-emerald-200" : "text-rose-200"}`}>
              {answeredCorrectly ? "Good job" : "Not quite"}
            </p>
            <p className="mt-2 text-slate-100">
              {answeredCorrectly ? "You landed the right answer." : `The correct answer was ${question.answer}.`}
            </p>
            <p className="mt-2 text-sm text-slate-300">{question.explanation}</p>
            <div className="mt-4">
              <Button onClick={() => void handleAdvance()}>{currentIndex === questions.length - 1 ? "Finish quiz" : "Next question"}</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function AiToolsPage() {
  const { user, profile, refreshProfile, saveProfile } = useAuth();
  const [selectedTool, setSelectedTool] = useState(AI_TOOLS[0].key);
  const [formState, setFormState] = useState(buildInitialFormState(AI_TOOLS[0]));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [resultBundle, setResultBundle] = useState(null);
  const [rewardingPerfectRun, setRewardingPerfectRun] = useState(false);

  const activeTool = useMemo(() => AI_TOOLS.find((tool) => tool.key === selectedTool), [selectedTool]);
  const isPremium = profile?.plan?.tier === "premium";

  useEffect(() => {
    setFormState((current) => {
      const nextState = { ...current };
      for (const field of activeTool.fields) {
        if (typeof nextState[field.name] === "undefined") {
          nextState[field.name] = field.defaultValue ?? "";
        }
      }
      return nextState;
    });
    setError("");
  }, [activeTool]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const payload = Object.fromEntries(
        activeTool.fields.map((field) => [field.name, `${formState[field.name] ?? ""}`.trim()]),
      );
      const response = await generateAiResult(user, { tool: activeTool.key, payload });
      setResultBundle({ key: Date.now(), data: response.result });
      await refreshProfile();
    } catch (caughtError) {
      setError(caughtError.message || "AI generation failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePerfectRun() {
    if (rewardingPerfectRun) return;

    setRewardingPerfectRun(true);
    try {
      await saveProfile({
        stats: {
          ...profile?.stats,
          perfectQuizRuns: (profile?.stats?.perfectQuizRuns ?? 0) + 1,
        },
      });
      await refreshProfile();
    } finally {
      setRewardingPerfectRun(false);
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
                onClick={() => {
                  setSelectedTool(tool.key);
                  setResultBundle(null);
                }}
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
                {activeTool.fields.map((field) => {
                  if (field.type === "textarea") {
                    return <TextArea key={field.name} label={field.label} placeholder={field.placeholder} value={formState[field.name] ?? ""} onChange={(event) => setFormState((current) => ({ ...current, [field.name]: event.target.value }))} required />;
                  }

                  if (field.type === "select") {
                    return (
                      <Select key={field.name} label={field.label} value={formState[field.name] ?? field.defaultValue ?? ""} onChange={(event) => setFormState((current) => ({ ...current, [field.name]: event.target.value }))}>
                        {field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </Select>
                    );
                  }

                  return (
                    <TextInput
                      key={field.name}
                      label={field.label}
                      type={field.type === "number" ? "number" : "text"}
                      min={field.min}
                      max={field.max}
                      placeholder={field.placeholder}
                      value={formState[field.name] ?? ""}
                      onChange={(event) => setFormState((current) => ({ ...current, [field.name]: event.target.value }))}
                      required
                    />
                  );
                })}
                {error ? <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}
                <Button type="submit" size="lg" disabled={submitting}>{submitting ? "Generating..." : `Generate ${activeTool.shortLabel}`}</Button>
              </form>
            )}
          </Card>

          {resultBundle ? (
            <Card>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-sky-300/80">Result</p>
                  <h2 className="mt-2 text-2xl font-bold text-white">{activeTool.label} output</h2>
                </div>
                <Badge className="bg-slate-950 text-slate-300 ring-white/10">Saved to Firestore</Badge>
              </div>
              <div className="mt-6">
                <ResultRenderer
                  tool={selectedTool}
                  result={resultBundle.data}
                  resultKey={resultBundle.key}
                  onPerfectRun={handlePerfectRun}
                />
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
