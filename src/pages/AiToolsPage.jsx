import { useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  Calendar,
  BookOpen,
  FlameIcon,
  BrainCircuit,
  Zap,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Trophy,
  Lock,
  ArrowRight,
} from "lucide-react";
import { AI_TOOLS } from "../lib/constants";
import { useAuth } from "../contexts/AuthContext";
import { generateAiResult } from "../services/api";
import { isPremiumPlan } from "../lib/utils";
import { AlertBox, Badge, Button, LinkButton, ProgressBar, SectionHeading, Select, TextArea, TextInput } from "../components/ui";

const TOOL_ICONS = {
  planner: Calendar,
  quiz: BookOpen,
  flashcards: FlameIcon,
  explainer: BrainCircuit,
  breakdown: Zap,
};

function normalizeAnswer(value = "") {
  return value.trim().toLowerCase();
}

function isCorrectAnswer(question, answer) {
  return normalizeAnswer(question.answer) === normalizeAnswer(answer);
}

function getQuizOptions(question) {
  if (Array.isArray(question.options) && question.options.length > 0) return question.options;
  if (question.type === "true-false") return ["True", "False"];
  return [];
}

function buildInitialFormState(tool) {
  return tool.fields.reduce((acc, field) => {
    acc[field.name] = field.defaultValue ?? "";
    return acc;
  }, {});
}

/* ─── Result renderers ─── */

function PlannerResult({ result }) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5">
        <h3 className="text-lg font-bold text-white">{result.title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">{result.summary}</p>
      </div>
      {result.schedule?.map((item) => (
        <div key={`${item.day}-${item.focus}`} className="flex gap-4 rounded-xl border border-white/8 bg-white/[0.03] p-5">
          <div className="shrink-0">
            <span className="inline-block rounded-lg bg-sky-500/10 px-2.5 py-1 text-xs font-semibold text-sky-300">
              {item.day}
            </span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">{item.focus}</h4>
            <p className="mt-1 text-sm text-slate-400">{item.deliverables}</p>
            <p className="mt-2 text-xs text-slate-600">{item.duration}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function FlashcardsResult({ result }) {
  const [flipped, setFlipped] = useState({});

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {result.cards?.map((card, i) => {
        const isFlipped = flipped[i];
        return (
          <button
            key={card.front}
            type="button"
            onClick={() => setFlipped((prev) => ({ ...prev, [i]: !prev[i] }))}
            className="rounded-xl border border-white/8 bg-white/[0.03] p-5 text-left transition-all duration-200 hover:border-sky-400/25 hover:bg-white/5"
          >
            {!isFlipped ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-400/70">Front</p>
                <h4 className="mt-2 text-sm font-bold text-white">{card.front}</h4>
                <p className="mt-3 text-xs text-slate-600">Tap to reveal back →</p>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-400/70">Back</p>
                <p className="mt-2 text-sm text-slate-300">{card.back}</p>
                <p className="mt-3 text-xs text-slate-600">← Tap to flip back</p>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}

function ExplainerResult({ result }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5">
      <h3 className="text-lg font-bold text-white">{result.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-300">{result.summary}</p>
      <div className="mt-4 space-y-3 text-sm leading-6 text-slate-400">
        {result.explanation?.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}

function BreakdownResult({ result }) {
  return (
    <div className="space-y-3">
      {result.phases?.map((phase) => (
        <div key={phase.name} className="rounded-xl border border-white/8 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-sm font-bold text-white">{phase.name}</h4>
            <span className="rounded-full bg-sky-500/10 px-2.5 py-0.5 text-xs font-semibold text-sky-300 ring-1 ring-inset ring-sky-400/20">
              {phase.estimate}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-400">{phase.goal}</p>
          <ul className="mt-3 space-y-1">
            {phase.tasks?.map((task) => (
              <li key={task} className="flex items-center gap-2 text-xs text-slate-500">
                <ArrowRight className="h-3 w-3 text-sky-400/60" />
                {task}
              </li>
            ))}
          </ul>
        </div>
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
    if (!revealed && answeredCorrectly) setScore((c) => c + 1);
    setRevealed(true);
  }

  async function handleAdvance() {
    if (!question) return;
    const atLast = currentIndex === questions.length - 1;
    if (atLast) {
      const perfectRun = score === questions.length && questions.length > 0;
      setCompleted(true);
      if (perfectRun && !perfectAwarded) {
        setPerfectAwarded(true);
        await onPerfectRun?.();
      }
      return;
    }
    setCurrentIndex((c) => c + 1);
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
    return <p className="text-sm text-slate-500">The quiz is empty. Try generating again.</p>;
  }

  if (completed) {
    const perfectRun = score === questions.length && questions.length > 0;
    return (
      <div className="rounded-xl border border-white/8 bg-white/[0.03] p-6">
        <div className="text-center">
          <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${perfectRun ? "bg-amber-500/15" : "bg-sky-500/10"}`}>
            {perfectRun ? <Trophy className="h-7 w-7 text-amber-300" /> : <CheckCircle2 className="h-7 w-7 text-sky-300" />}
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-sky-400/70">Quiz complete</p>
          <h3 className="mt-2 text-2xl font-bold text-white">{result.title}</h3>
          <p className="mt-2 text-slate-400">{result.summary}</p>
          <div className="mt-5 flex justify-center gap-2">
            <Badge className={perfectRun ? "bg-amber-500/15 text-amber-200 ring-amber-400/25" : "bg-sky-500/15 text-sky-200 ring-sky-400/25"}>
              Score {score}/{questions.length}
            </Badge>
            {perfectRun && <Badge className="bg-emerald-500/15 text-emerald-200 ring-emerald-400/25">Perfect run</Badge>}
          </div>
          <p className="mt-4 text-sm text-slate-400">
            {perfectRun
              ? "You got every question right. Perfect run trophy added to your account."
              : "Review the explanations, then run it back for a cleaner score."}
          </p>
          <Button variant="secondary" onClick={handleRestart} className="mt-5">
            <RefreshCw className="h-4 w-4" />
            Restart quiz
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-400">Question {currentIndex + 1} of {questions.length}</span>
        <Badge className="bg-white/8 text-slate-300 ring-white/10">Score {score}/{questions.length}</Badge>
      </div>

      <div className="rounded-xl border border-white/8 bg-white/[0.03] p-5">
        <h4 className="text-base font-semibold text-white">{question.question}</h4>
        <div className="mt-4 space-y-2">
          {options.map((option) => {
            const selected = selectedAnswer === option;
            const correctOption = normalizeAnswer(question.answer) === normalizeAnswer(option);
            let className = "rounded-xl border px-4 py-3.5 text-left text-sm transition-all duration-150 w-full ";
            if (revealed) {
              if (correctOption) className += "border-emerald-400/35 bg-emerald-500/10 text-emerald-100";
              else if (selected) className += "border-rose-400/30 bg-rose-500/8 text-rose-100";
              else className += "border-white/8 bg-white/[0.02] text-slate-400";
            } else if (selected) {
              className += "border-sky-400/35 bg-sky-500/10 text-sky-100";
            } else {
              className += "border-white/8 bg-white/[0.03] text-slate-300 hover:border-white/14 hover:bg-white/[0.05]";
            }

            return (
              <button
                key={option}
                type="button"
                className={className}
                onClick={() => { if (!revealed) setSelectedAnswer(option); }}
              >
                <div className="flex items-center gap-3">
                  {revealed && correctOption && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />}
                  {revealed && selected && !correctOption && <XCircle className="h-4 w-4 shrink-0 text-rose-400" />}
                  {(!revealed || (!correctOption && !selected)) && (
                    <div className={`h-4 w-4 shrink-0 rounded-full border-2 ${selected ? "border-sky-400 bg-sky-400/20" : "border-white/20"}`} />
                  )}
                  {option}
                </div>
              </button>
            );
          })}
        </div>

        {!revealed ? (
          <Button onClick={handleReveal} disabled={!selectedAnswer} className="mt-5">
            Check answer
          </Button>
        ) : (
          <div className={`mt-5 rounded-xl border p-4 ${answeredCorrectly ? "border-emerald-400/20 bg-emerald-500/8" : "border-rose-400/20 bg-rose-500/8"}`}>
            <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${answeredCorrectly ? "text-emerald-300" : "text-rose-300"}`}>
              {answeredCorrectly ? "Correct!" : "Not quite"}
            </p>
            <p className="mt-1.5 text-sm text-slate-200">
              {answeredCorrectly ? "Good job." : `The correct answer was: ${question.answer}.`}
            </p>
            <p className="mt-1.5 text-sm text-slate-400">{question.explanation}</p>
            <Button onClick={() => void handleAdvance()} className="mt-4" size="sm">
              {currentIndex === questions.length - 1 ? "Finish quiz" : "Next question"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultRenderer({ tool, result, resultKey, onPerfectRun }) {
  if (!result) return null;
  if (tool === "planner") return <PlannerResult result={result} />;
  if (tool === "quiz") return <InteractiveQuizResult key={resultKey} result={result} onPerfectRun={onPerfectRun} />;
  if (tool === "flashcards") return <FlashcardsResult result={result} />;
  if (tool === "explainer") return <ExplainerResult result={result} />;
  return <BreakdownResult result={result} />;
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
  const isPremium = isPremiumPlan(profile);
  const tierName = isPremium
    ? `${profile?.plan?.tier?.[0]?.toUpperCase() || "P"}${profile?.plan?.tier?.slice(1) || "remium"}`
    : "Free";

  const aiUsed = profile?.usage?.aiGenerationsUsed ?? 0;
  const aiLimit = profile?.usage?.aiGenerationsLimit ?? 60;

  useEffect(() => {
    setFormState((current) => {
      const next = { ...current };
      for (const field of activeTool.fields) {
        if (typeof next[field.name] === "undefined") next[field.name] = field.defaultValue ?? "";
      }
      return next;
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
        stats: { ...profile?.stats, perfectQuizRuns: (profile?.stats?.perfectQuizRuns ?? 0) + 1 },
      });
      await refreshProfile();
    } finally {
      setRewardingPerfectRun(false);
    }
  }

  function setField(name) {
    return (event) => setFormState((current) => ({ ...current, [name]: event.target.value }));
  }

  return (
    <div className="space-y-7">
      <SectionHeading
        eyebrow="Premium AI"
        title="AI study tools for real work"
        description="Tight prompts, structured outputs, and cost-aware limits that keep the paid AI tiers credible."
      />

      <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
        {/* Left: plan status + tool list */}
        <div className="space-y-4">
          {/* Plan status */}
          <div className={`rounded-2xl border p-5 ${isPremium ? "border-sky-400/20 bg-gradient-to-br from-sky-500/8 via-white/[0.02] to-teal-400/5" : "border-white/8 bg-white/[0.03]"}`}>
            <div className="flex items-center gap-2">
              <Sparkles className={`h-4 w-4 ${isPremium ? "text-sky-400" : "text-slate-600"}`} />
              <p className="text-xs font-semibold text-slate-400">Plan status</p>
            </div>
            <h2 className="mt-2 text-base font-bold text-white">
              {isPremium ? `${tierName} AI is active` : "Paid AI required"}
            </h2>
            <p className="mt-1.5 text-xs leading-5 text-slate-500">
              {isPremium
                ? "Generate plans, quizzes, flashcards, explainers, and breakdowns."
                : "Upgrade in Billing to unlock all AI tools."}
            </p>
            <div className="mt-4">
              <ProgressBar
                label="Monthly AI credits"
                value={aiUsed}
                max={isPremium ? aiLimit : 60}
                helper={isPremium ? "Credits reset monthly." : "Free plan keeps AI disabled."}
              />
            </div>
            {!isPremium && (
              <LinkButton to="/app/billing" variant="primary" size="sm" className="mt-4 w-full justify-center">
                Upgrade to unlock AI
                <ArrowRight className="h-3.5 w-3.5" />
              </LinkButton>
            )}
          </div>

          {/* Tool picker */}
          <div className="space-y-1.5">
            {AI_TOOLS.map((tool) => {
              const Icon = TOOL_ICONS[tool.key] || Sparkles;
              const isSelected = selectedTool === tool.key;
              return (
                <button
                  key={tool.key}
                  type="button"
                  onClick={() => {
                    setSelectedTool(tool.key);
                    setResultBundle(null);
                  }}
                  className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all duration-150 ${
                    isSelected
                      ? "border-sky-400/25 bg-sky-500/8"
                      : "border-white/7 bg-white/[0.02] hover:border-white/12 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isSelected ? "bg-sky-500/20" : "bg-white/5"}`}>
                    <Icon className={`h-4 w-4 ${isSelected ? "text-sky-400" : "text-slate-500"}`} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold ${isSelected ? "text-sky-200" : "text-slate-300"}`}>
                      {tool.shortLabel}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{tool.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: generator + result */}
        <div className="space-y-5">
          {/* Generator panel */}
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-400/70">Generator</p>
                <h2 className="mt-1.5 text-2xl font-bold text-white">{activeTool.label}</h2>
                <p className="mt-1 text-sm text-slate-400">{activeTool.description}</p>
              </div>
              <Badge className={isPremium ? "bg-emerald-500/15 text-emerald-200 ring-emerald-400/25" : "bg-rose-500/10 text-rose-300 ring-rose-400/20"}>
                {isPremium ? (
                  <><CheckCircle2 className="h-3 w-3" />{tierName} unlocked</>
                ) : (
                  <><Lock className="h-3 w-3" />Locked</>
                )}
              </Badge>
            </div>

            {!isPremium ? (
              <div className="mt-6 rounded-xl border border-rose-400/15 bg-rose-500/5 p-5 text-center">
                <Lock className="mx-auto h-8 w-8 text-rose-400/50" />
                <h3 className="mt-3 text-base font-bold text-white">Upgrade to use AI tools</h3>
                <p className="mt-2 text-sm text-slate-400">
                  AI tools are gated by active Stripe subscription, then rate-limited by monthly usage credits to keep costs controlled.
                </p>
                <LinkButton to="/app/billing" className="mt-5">
                  Open billing
                  <ArrowRight className="h-4 w-4" />
                </LinkButton>
              </div>
            ) : (
              <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
                {activeTool.fields.map((field) => {
                  if (field.type === "textarea") {
                    return (
                      <TextArea
                        key={field.name}
                        label={field.label}
                        placeholder={field.placeholder}
                        value={formState[field.name] ?? ""}
                        onChange={setField(field.name)}
                        required
                      />
                    );
                  }
                  if (field.type === "select") {
                    return (
                      <Select key={field.name} label={field.label} value={formState[field.name] ?? field.defaultValue ?? ""} onChange={setField(field.name)}>
                        {field.options?.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
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
                      onChange={setField(field.name)}
                      required
                    />
                  );
                })}
                {error && <AlertBox variant="error">{error}</AlertBox>}
                <Button type="submit" size="lg" disabled={submitting} className="w-full justify-center">
                  {submitting ? (
                    <><RefreshCw className="h-4 w-4 animate-spin" />Generating...</>
                  ) : (
                    <><Sparkles className="h-4 w-4" />Generate {activeTool.shortLabel}</>
                  )}
                </Button>
              </form>
            )}
          </div>

          {/* Result panel */}
          {resultBundle && (
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-400/70">Result</p>
                  <h2 className="mt-1 text-xl font-bold text-white">{activeTool.label} output</h2>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-300 ring-emerald-400/20">
                  <CheckCircle2 className="h-3 w-3" />
                  Generated
                </Badge>
              </div>
              <ResultRenderer
                tool={selectedTool}
                result={resultBundle.data}
                resultKey={resultBundle.key}
                onPerfectRun={handlePerfectRun}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
