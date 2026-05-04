import { startTransition, useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  SlidersHorizontal,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Clock,
  Flame,
  Target,
  CalendarDays,
  BarChart3,
  Upload,
  FileText,
  Trash2,
  Pencil,
  ArrowRight,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { DEFAULT_SETTINGS, PLAN_DETAILS, TASK_TEMPLATES } from "../lib/constants";
import {
  buildAgenda,
  buildWeeklyTrend,
  calculateStreak,
  formatDateLabel,
  getCompletionRate,
  getPriorityTone,
  getTaskBadges,
  isPremiumPlan,
  sortTasks,
  toDateKey,
} from "../lib/utils";
import { createTask, listTasks, removeTask, updateTask } from "../services/firestore";
import { verifyTaskProof } from "../services/api";
import { uploadTaskProofImage } from "../services/storage";
import {
  AlertBox,
  Badge,
  Button,
  Card,
  LinkButton,
  Modal,
  ProgressBar,
  SectionHeading,
  Select,
  StatCard,
  TextArea,
  TextInput,
} from "../components/ui";

const emptyTask = {
  title: "",
  course: "",
  description: "",
  dueDate: "",
  priority: "Medium",
  estimatedMinutes: 60,
};

const emptyCompletionProof = {
  proofLink: "",
  completionNote: "",
};

function normalizeTask(values) {
  return {
    title: values.title.trim(),
    course: values.course.trim(),
    description: values.description.trim(),
    dueDate: values.dueDate,
    priority: values.priority,
    estimatedMinutes: Number(values.estimatedMinutes || 0),
  };
}

function normalizeLoadedTask(task) {
  return {
    ...task,
    estimatedMinutes: Number(task.estimatedMinutes || 0),
    completionNote: task.completionNote || "",
    proofLink: task.proofLink || "",
    imageProofUrl: task.imageProofUrl || "",
    proofVerification: task.proofVerification || null,
  };
}

function parseStudyWindow(windowValue = "18:00-20:00") {
  const [startValue = "18:00"] = windowValue.split("-");
  const [hour = 18, minute = 0] = startValue.split(":").map(Number);
  return { hour, minute };
}

function formatSlotLabel(startMinutes, duration) {
  const format = (minutes) =>
    new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(
      new Date(2026, 0, 1, Math.floor(minutes / 60), minutes % 60),
    );
  return `${format(startMinutes)} – ${format(startMinutes + duration)}`;
}

function buildTodayPlan(tasks, preferredStudyWindow) {
  const todayKey = toDateKey();
  const ranked = [...tasks]
    .filter((task) => !task.completed)
    .sort((left, right) => {
      const score = (task) =>
        (task.dueDate < todayKey ? 100 : 0) +
        (task.dueDate === todayKey ? 60 : 0) +
        (task.priority === "High" ? 25 : task.priority === "Medium" ? 15 : 5);
      const delta = score(right) - score(left);
      if (delta !== 0) return delta;
      return `${left.dueDate ?? ""}`.localeCompare(`${right.dueDate ?? ""}`);
    })
    .slice(0, 3);

  const { hour, minute } = parseStudyWindow(preferredStudyWindow);
  let cursor = hour * 60 + minute;

  return ranked.map((task, index) => {
    const duration = Number(task.estimatedMinutes || 45);
    const reason =
      task.dueDate < todayKey
        ? "Overdue — clearing this reduces stress fastest."
        : task.dueDate === todayKey
          ? "Due today — belongs at the front of your plan."
          : task.priority === "High"
            ? "High priority — deserves a protected block before lighter tasks."
            : "Keep momentum with an upcoming task.";

    const next = {
      ...task,
      orderLabel: `Block ${index + 1}`,
      slot: formatSlotLabel(cursor, duration),
      reason,
    };
    cursor += duration + 10;
    return next;
  });
}

function getWeekFocusMinutes(tasks) {
  const now = new Date();
  const earliest = new Date(now);
  earliest.setDate(now.getDate() - 6);
  earliest.setHours(0, 0, 0, 0);

  return tasks.reduce((total, task) => {
    if (!task.completedAt) return total;
    const completedAt = new Date(task.completedAt);
    if (Number.isNaN(completedAt.getTime()) || completedAt < earliest) return total;
    return total + Number(task.estimatedMinutes || 0);
  }, 0);
}

function formatMinutesAsHours(totalMinutes) {
  const hours = totalMinutes / 60;
  if (hours >= 10) return `${Math.round(hours)}h`;
  return `${hours.toFixed(1)}h`;
}

/* ─── Sub-components ─── */

function TaskTemplatePicker({ onApplyTemplate }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold text-slate-200">Quick templates</p>
        <p className="mt-0.5 text-xs text-slate-500">Pick one to pre-fill the form.</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {TASK_TEMPLATES.map((template) => (
          <button
            key={template.key}
            type="button"
            onClick={() => onApplyTemplate(template)}
            className="rounded-xl border border-white/8 bg-white/[0.03] p-4 text-left transition hover:border-sky-400/25 hover:bg-white/5"
          >
            <p className="text-sm font-semibold text-white">{template.label}</p>
            <p className="mt-1 text-xs text-slate-500">{template.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function TaskForm({ form, setForm, onSubmit, onCancel, busy, editing, onApplyTemplate }) {
  function setField(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  }

  return (
    <form className="grid gap-5 md:grid-cols-2" onSubmit={onSubmit}>
      {!editing && (
        <div className="md:col-span-2">
          <TaskTemplatePicker onApplyTemplate={onApplyTemplate} />
        </div>
      )}
      <TextInput label="Task title" placeholder="Finish calculus problem set" value={form.title} onChange={setField("title")} required />
      <TextInput label="Course" placeholder="Math 212" value={form.course} onChange={setField("course")} required />
      <TextInput label="Due date" type="date" value={form.dueDate} onChange={setField("dueDate")} required />
      <Select label="Priority" value={form.priority} onChange={setField("priority")}>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </Select>
      <TextInput label="Estimated time (minutes)" type="number" min="15" step="15" value={form.estimatedMinutes} onChange={setField("estimatedMinutes")} />
      <div className="md:col-span-2">
        <TextArea label="Description" placeholder="Add details, acceptance criteria, or study checklist..." value={form.description} onChange={setField("description")} />
      </div>
      <p className="md:col-span-2 text-xs text-slate-500">
        Proof is submitted when you finish the task — keeps capture fast.
      </p>
      <div className="md:col-span-2 flex flex-wrap justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={busy}>
          {busy ? "Saving..." : editing ? "Save changes" : "Create task"}
        </Button>
      </div>
    </form>
  );
}

function ProofUploader({ fileName, previewUrl, onChange, disabled }) {
  return (
    <div className="space-y-3 rounded-xl border border-white/8 bg-white/[0.03] p-4">
      <div className="flex items-center gap-2">
        <Upload className="h-4 w-4 text-sky-400" />
        <div>
          <p className="text-sm font-semibold text-slate-200">Premium image proof</p>
          <p className="text-xs text-slate-500">Upload a screenshot or photo as proof of completion.</p>
        </div>
      </div>
      {previewUrl ? (
        <img src={previewUrl} alt="Proof preview" className="max-h-52 w-full rounded-xl border border-white/8 object-cover" />
      ) : (
        <div className="flex items-center justify-center rounded-xl border border-dashed border-white/10 py-8 text-sm text-slate-600">
          No image selected yet
        </div>
      )}
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-white/6 px-4 py-2.5 text-sm font-semibold text-slate-200 ring-1 ring-inset ring-white/10 transition hover:bg-white/10">
        <input type="file" accept="image/*" className="hidden" disabled={disabled} onChange={onChange} />
        {fileName ? `✓ ${fileName}` : "Choose image"}
      </label>
    </div>
  );
}

function CompletionModal({
  open, task, onClose, onSubmit, busy, error,
  proofState, setProofState, isPremium, requireProof,
  proofImageFileName, proofPreviewUrl, onProofImageChange,
}) {
  if (!task) return null;

  return (
    <Modal open={open} title={`Complete: ${task.title}`} description="Submit proof now so the task can be verified and finished cleanly." onClose={onClose}>
      <form className="grid gap-5" onSubmit={onSubmit}>
        <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-400/70">Task subject</p>
          <h3 className="mt-1.5 text-lg font-bold text-white">{task.course}</h3>
          <p className="mt-1 text-sm text-slate-400">{task.description || "No extra description on this task."}</p>
        </div>

        <TextArea
          label="Completion note"
          hint="Optional — stored with the completion record."
          placeholder="What did you finish, review, or turn in?"
          value={proofState.completionNote}
          onChange={(event) => setProofState((current) => ({ ...current, completionNote: event.target.value }))}
        />

        {isPremium ? (
          <ProofUploader
            fileName={proofImageFileName}
            previewUrl={proofPreviewUrl}
            onChange={onProofImageChange}
            disabled={busy}
          />
        ) : (
          <TextInput
            label="Google Docs proof link"
            placeholder="https://docs.google.com/document/d/..."
            value={proofState.proofLink}
            onChange={(event) => setProofState((current) => ({ ...current, proofLink: event.target.value }))}
            hint="Must be a public Google Doc that includes a picture or screenshot tied to the task subject. StudySync checks the content before completing."
            required={requireProof}
          />
        )}

        <div className="rounded-xl border border-white/7 bg-white/[0.02] p-3.5 text-xs leading-5 text-slate-500">
          {isPremium
            ? requireProof
              ? "Premium: image proof required before completion."
              : "Premium: add an image proof before completing the task."
            : requireProof
              ? "Free: a public Google Doc with subject-related proof is required."
              : "Free: optionally submit a public Google Doc proof before completing."}
        </div>

        {error && <AlertBox variant="error">{error}</AlertBox>}

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={busy}>
            {busy ? "Verifying..." : "Finish task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

const PRIORITY_CONFIG = {
  High: { dot: "bg-rose-400", text: "text-rose-300", badge: "bg-rose-500/12 text-rose-200 ring-rose-400/20" },
  Medium: { dot: "bg-amber-400", text: "text-amber-300", badge: "bg-amber-500/12 text-amber-200 ring-amber-400/20" },
  Low: { dot: "bg-slate-500", text: "text-slate-400", badge: "bg-white/6 text-slate-400 ring-white/10" },
};

function TaskCard({ task, onEdit, onDelete, onOpenCompletion, onMarkIncomplete, requireProof }) {
  const badges = getTaskBadges(task, requireProof);
  const priorityCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.Medium;

  return (
    <div className={`group rounded-2xl border p-5 transition-all duration-200 ${task.completed ? "border-emerald-400/15 bg-emerald-500/[0.04]" : "border-white/8 bg-white/[0.03] hover:border-white/12 hover:bg-white/[0.05]"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0">
            {task.completed
              ? <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              : <Circle className="h-5 w-5 text-slate-600" />
            }
          </div>
          <div>
            <h3 className={`text-base font-semibold leading-snug ${task.completed ? "text-slate-500 line-through" : "text-white"}`}>
              {task.title}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>{task.course}</span>
              <span>·</span>
              <span>Due {formatDateLabel(task.dueDate, { month: "short", day: "numeric", weekday: "short" })}</span>
              <span>·</span>
              <span>{task.estimatedMinutes || 0} min</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${priorityCfg.badge}`}>
            <div className={`h-1.5 w-1.5 rounded-full ${priorityCfg.dot}`} />
            {task.priority}
          </div>
          {badges.slice(0, 2).map((badge) => (
            <Badge key={badge.label} className={`ring-1 text-[11px] ${badge.tone}`}>
              {badge.label}
            </Badge>
          ))}
        </div>
      </div>

      {task.description && (
        <p className="mt-3 pl-8 text-sm leading-6 text-slate-400">{task.description}</p>
      )}

      {(task.proofLink || task.completionNote) && (
        <div className="mt-3 pl-8 space-y-1">
          {task.proofLink && (
            <a href={task.proofLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition">
              <FileText className="h-3.5 w-3.5" />
              Open Google Doc proof
            </a>
          )}
          {task.imageProofUrl && (
            <a href={task.imageProofUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition">
              <Upload className="h-3.5 w-3.5" />
              Open image proof
            </a>
          )}
          {task.completionNote && (
            <p className="text-xs text-slate-400">Note: {task.completionNote}</p>
          )}
        </div>
      )}

      {task.imageProofUrl && (
        <img src={task.imageProofUrl} alt={`${task.title} proof`} className="mt-3 ml-8 max-h-44 rounded-xl border border-white/8 object-cover" />
      )}

      <div className="mt-4 flex flex-wrap gap-2 pl-8">
        {task.completed ? (
          <Button variant="secondary" size="sm" onClick={() => onMarkIncomplete(task)}>
            Mark incomplete
          </Button>
        ) : (
          <Button size="sm" onClick={() => onOpenCompletion(task)}>
            <CheckCircle2 className="h-3.5 w-3.5" />
            Submit proof
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={() => onEdit(task)}>
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
        <Button variant="danger" size="sm" onClick={() => onDelete(task.id)}>
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
      </div>
    </div>
  );
}

function GuidedEmptyState({ hasPremium, onCreateTask }) {
  const steps = [
    {
      number: "01",
      title: "Create your first task",
      desc: "Add one real assignment with a due date and estimated minutes.",
      action: <Button onClick={onCreateTask} size="sm"><Plus className="h-4 w-4" />Create task</Button>,
    },
    {
      number: "02",
      title: "Set your study window",
      desc: "Tell StudySync when you usually study so today's plan feels personal.",
      action: <LinkButton to="/app/settings" variant="secondary" size="sm"><ArrowRight className="h-4 w-4" />Open settings</LinkButton>,
    },
    {
      number: "03",
      title: hasPremium ? "Use an AI tool" : "Unlock AI when ready",
      desc: hasPremium
        ? "Generate a study plan or quiz once you have real work in the system."
        : "Premium turns your workload into plans, quizzes, and flashcards for $5/month.",
      action: <LinkButton to={hasPremium ? "/app/ai" : "/app/billing"} variant={hasPremium ? "secondary" : "primary"} size="sm">
        <Sparkles className="h-4 w-4" />
        {hasPremium ? "Open AI tools" : "View plans"}
      </LinkButton>,
    },
  ];

  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.04]">
          <Target className="h-6 w-6 text-slate-500" />
        </div>
        <h3 className="mt-4 text-2xl font-bold text-white">Start your system, not just a list.</h3>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-400">
          The fastest way to make StudySync useful is to set up one real task, shape your study window, and let the dashboard plan the next move.
        </p>
      </div>
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {steps.map((step) => (
          <div key={step.number} className="rounded-xl border border-white/8 bg-white/[0.03] p-5">
            <p className="text-xs font-bold tracking-[0.2em] text-sky-400/60">{step.number}</p>
            <h4 className="mt-3 text-base font-bold text-white">{step.title}</h4>
            <p className="mt-1.5 text-sm text-slate-400">{step.desc}</p>
            <div className="mt-4">{step.action}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TodayPlanCard({ tasks }) {
  const priorityCfg = PRIORITY_CONFIG;

  return (
    <Card>
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-sky-400" />
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-400/70">Today's plan</p>
      </div>
      <h3 className="mt-2 text-xl font-bold text-white">What to study next</h3>

      {tasks.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">
          No urgent blocks yet. Add a task and StudySync will build today's plan.
        </p>
      ) : (
        <div className="mt-5 space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 shrink-0 rounded-full ${(priorityCfg[task.priority] || priorityCfg.Medium).dot}`} />
                  <p className="text-xs font-semibold text-slate-400">{task.orderLabel}</p>
                </div>
                <span className="rounded-lg bg-sky-500/10 px-2 py-0.5 text-xs font-medium text-sky-300 ring-1 ring-inset ring-sky-400/20">
                  {task.slot}
                </span>
              </div>
              <h4 className="mt-2.5 text-sm font-semibold text-white">{task.title}</h4>
              <p className="mt-1 text-xs leading-5 text-slate-500">{task.reason}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function WeeklyMomentumCard({ tasks, weeklyGoalHours }) {
  const trend = buildWeeklyTrend(tasks);
  const completedThisWeek = trend.reduce((sum, item) => sum + item.completed, 0);
  const maxBar = Math.max(...trend.map((item) => item.completed), 1);

  return (
    <Card>
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-sky-400" />
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-400/70">Weekly momentum</p>
      </div>
      <h3 className="mt-2 text-xl font-bold text-white">Recent completions</h3>

      <div className="mt-5 flex items-end gap-2">
        {trend.map((item) => {
          const height = Math.max(8, Math.round((item.completed / maxBar) * 80));
          return (
            <div key={item.key} className="group flex flex-1 flex-col items-center gap-2">
              <div className="relative flex h-24 w-full items-end">
                <div
                  className={`w-full rounded-lg transition-all duration-500 ${item.completed > 0 ? "bg-gradient-to-t from-sky-500 to-teal-400" : "bg-white/5"}`}
                  style={{ height: `${height}px` }}
                />
                {item.completed > 0 && (
                  <div className="absolute inset-x-0 -top-6 hidden text-center text-xs font-semibold text-sky-300 group-hover:block">
                    {item.completed}
                  </div>
                )}
              </div>
              <p className="text-[10px] font-medium text-slate-600">{item.label}</p>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-slate-500">
        {completedThisWeek} completed this week · {weeklyGoalHours}h weekly goal
      </p>
    </Card>
  );
}

function CalendarCard({ agenda }) {
  return (
    <Card>
      <div className="flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-sky-400" />
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-400/70">7-day calendar</p>
      </div>
      <h3 className="mt-2 text-xl font-bold text-white">Next seven days</h3>

      <div className="mt-5 space-y-2">
        {agenda.map((day) => (
          <div
            key={day.key}
            className="flex items-center justify-between rounded-xl border border-white/7 bg-white/[0.02] px-4 py-3"
          >
            <div>
              <p className="text-sm font-semibold text-white">{day.label}</p>
              <p className="text-xs text-slate-600">{day.dayLabel}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-300">{day.count} due</p>
              {day.priorities > 0 && (
                <p className="text-xs text-rose-400">{day.priorities} high priority</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function UpsellCard({ profile }) {
  const currentTier = profile?.plan?.tier || "free";
  const isPower = currentTier === "power";
  const nextPlan = currentTier === "free" ? PLAN_DETAILS.premium : PLAN_DETAILS.power;

  if (isPower) {
    return (
      <div className="rounded-2xl border border-amber-400/15 bg-gradient-to-br from-amber-500/8 via-white/[0.02] to-orange-400/5 p-5">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-amber-400" />
          <p className="text-xs font-semibold text-amber-400/80">Power workspace</p>
        </div>
        <h3 className="mt-2 text-base font-bold text-white">Best-model AI is active</h3>
        <p className="mt-1.5 text-sm text-slate-400">You're on the highest StudySync tier. Use AI planning, quizzes, and richer breakdowns.</p>
        <div className="mt-4">
          <LinkButton to="/app/ai" variant="secondary" size="sm" className="w-full justify-center">
            Open AI tools
            <ChevronRight className="h-3.5 w-3.5" />
          </LinkButton>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-sky-400/15 bg-gradient-to-br from-sky-500/8 via-white/[0.02] to-teal-400/5 p-5">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-sky-400" />
        <Badge className="bg-sky-500/15 text-sky-200 ring-sky-400/25 text-[10px]">{nextPlan.badge}</Badge>
      </div>
      <h3 className="mt-2 text-base font-bold text-white">{nextPlan.name} unlocks stronger proof and AI</h3>
      <p className="mt-1.5 text-sm text-slate-400">
        Cleaner proof uploads, more AI generations, and smarter planning help.
      </p>
      <div className="mt-4 flex gap-2">
        <LinkButton to="/app/billing" size="sm" className="flex-1 justify-center">View billing</LinkButton>
        <LinkButton to="/pricing" variant="secondary" size="sm" className="flex-1 justify-center">Compare</LinkButton>
      </div>
    </div>
  );
}

/* ─── Main page ─── */

export default function DashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [completionTask, setCompletionTask] = useState(null);
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [completionProof, setCompletionProof] = useState(emptyCompletionProof);
  const [completionProofImage, setCompletionProofImage] = useState(null);
  const [completionProofPreview, setCompletionProofPreview] = useState("");
  const [savingTask, setSavingTask] = useState(false);
  const [completionBusy, setCompletionBusy] = useState(false);
  const [taskError, setTaskError] = useState("");
  const [completionError, setCompletionError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");

  const deferredSearch = useDeferredValue(search);
  const settings = profile?.settings || DEFAULT_SETTINGS;
  const hasPremium = isPremiumPlan(profile);
  const requireProof = settings.requireProofBeforeCompletion !== false;
  const weeklyGoalHours = Number(settings.weeklyGoalHours || DEFAULT_SETTINGS.weeklyGoalHours);

  const loadTasks = useCallback(async () => {
    if (!user?.uid) {
      startTransition(() => {
        setTasks([]);
        setLoading(false);
      });
      return;
    }

    setLoading(true);

    try {
      const nextTasks = await listTasks(user.uid);
      startTransition(() => setTasks(nextTasks.map(normalizeLoadedTask)));
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => { void loadTasks(); }, [loadTasks]);

  useEffect(() => {
    return () => {
      if (completionProofPreview) URL.revokeObjectURL(completionProofPreview);
    };
  }, [completionProofPreview]);

  const stats = useMemo(() => {
    const todayKey = toDateKey();
    const openTasks = tasks.filter((task) => !task.completed);
    return {
      dueToday: openTasks.filter((task) => task.dueDate === todayKey).length,
      overdue: openTasks.filter((task) => task.dueDate < todayKey).length,
      completed: tasks.filter((task) => task.completed).length,
      streak: calculateStreak(tasks),
      completionRate: getCompletionRate(tasks),
      focusMinutes: getWeekFocusMinutes(tasks),
    };
  }, [tasks]);

  const todayPlan = useMemo(
    () => buildTodayPlan(tasks, settings.preferredStudyWindow || DEFAULT_SETTINGS.preferredStudyWindow),
    [settings.preferredStudyWindow, tasks],
  );
  const agenda = useMemo(() => buildAgenda(tasks), [tasks]);

  const filteredTasks = useMemo(() => {
    const todayKey = toDateKey();
    const query = deferredSearch.trim().toLowerCase();
    const nextTasks = tasks.filter((task) => {
      if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
      if (statusFilter === "today" && (task.completed || task.dueDate !== todayKey)) return false;
      if (statusFilter === "overdue" && (task.completed || task.dueDate >= todayKey)) return false;
      if (statusFilter === "upcoming" && (task.completed || task.dueDate <= todayKey)) return false;
      if (statusFilter === "completed" && !task.completed) return false;
      if (statusFilter === "open" && task.completed) return false;
      if (!query) return true;
      return [task.title, task.course, task.description].join(" ").toLowerCase().includes(query);
    });
    return sortTasks(nextTasks, sortBy);
  }, [deferredSearch, priorityFilter, sortBy, statusFilter, tasks]);

  function resetTaskComposer() {
    setTaskForm(emptyTask);
    setEditingTask(null);
    setTaskError("");
  }

  function resetCompletionComposer() {
    setCompletionProof(emptyCompletionProof);
    setCompletionProofImage(null);
    if (completionProofPreview) URL.revokeObjectURL(completionProofPreview);
    setCompletionProofPreview("");
    setCompletionTask(null);
    setCompletionError("");
  }

  function openNewTaskModal() {
    resetTaskComposer();
    setTaskModalOpen(true);
  }

  function openEditTaskModal(task) {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      course: task.course,
      description: task.description || "",
      dueDate: task.dueDate,
      priority: task.priority,
      estimatedMinutes: Number(task.estimatedMinutes || 60),
    });
    setTaskError("");
    setTaskModalOpen(true);
  }

  function openCompletionModal(task) {
    setCompletionTask(task);
    setCompletionProof({ proofLink: task.proofLink || "", completionNote: task.completionNote || "" });
    setCompletionProofImage(null);
    if (completionProofPreview) URL.revokeObjectURL(completionProofPreview);
    setCompletionProofPreview(task.imageProofUrl || "");
    setCompletionError("");
    setCompletionModalOpen(true);
  }

  async function handleTaskSubmit(event) {
    event.preventDefault();
    if (!user?.uid) return;

    const payload = normalizeTask(taskForm);
    if (!payload.title || !payload.course || !payload.dueDate) {
      setTaskError("Title, course, and due date are required.");
      return;
    }

    setSavingTask(true);
    setTaskError("");

    try {
      if (editingTask) {
        await updateTask(user.uid, editingTask.id, payload);
      } else {
        await createTask(user.uid, payload);
      }
      setTaskModalOpen(false);
      resetTaskComposer();
      await loadTasks();
    } catch (error) {
      setTaskError(error.message || "StudySync could not save that task.");
    } finally {
      setSavingTask(false);
    }
  }

  async function handleDelete(taskId) {
    if (!user?.uid) return;
    if (!window.confirm("Delete this task?")) return;
    await removeTask(user.uid, taskId);
    await loadTasks();
  }

  async function handleMarkIncomplete(task) {
    if (!user?.uid) return;
    await updateTask(user.uid, task.id, { completed: false, completedAt: "" });
    await loadTasks();
  }

  function handleProofImageChange(event) {
    const file = event.target.files?.[0];
    setCompletionProofImage(file || null);
    if (completionProofPreview) {
      URL.revokeObjectURL(completionProofPreview);
      setCompletionProofPreview("");
    }
    if (file) setCompletionProofPreview(URL.createObjectURL(file));
  }

  async function handleCompletionSubmit(event) {
    event.preventDefault();
    if (!user?.uid || !completionTask) return;

    setCompletionBusy(true);
    setCompletionError("");

    try {
      let imageProofUrl = completionTask.imageProofUrl || "";
      let proofVerification = completionTask.proofVerification || null;

      if (hasPremium) {
        if (requireProof && !completionProofImage && !imageProofUrl) {
          throw new Error("Upload an image proof before completing this task.");
        }
        if (completionProofImage) {
          imageProofUrl = await uploadTaskProofImage(user.uid, completionProofImage);
        }
      } else if (completionProof.proofLink.trim()) {
        const response = await verifyTaskProof(user, {
          taskTitle: completionTask.title,
          course: completionTask.course,
          description: completionTask.description,
          proofLink: completionProof.proofLink.trim(),
        });
        proofVerification = response.verification;

        if (!proofVerification?.matches) {
          throw new Error(proofVerification?.reason || "That proof does not match the task subject closely enough.");
        }
      } else if (requireProof) {
        throw new Error("Add a Google Doc proof link before completing this task.");
      }

      await updateTask(user.uid, completionTask.id, {
        completed: true,
        completedAt: new Date().toISOString(),
        completionNote: completionProof.completionNote.trim(),
        proofLink: hasPremium ? "" : completionProof.proofLink.trim(),
        imageProofUrl: hasPremium ? imageProofUrl : "",
        proofVerification,
      });

      setCompletionModalOpen(false);
      resetCompletionComposer();
      await loadTasks();
    } catch (error) {
      setCompletionError(error.message || "StudySync could not complete that task.");
    } finally {
      setCompletionBusy(false);
    }
  }

  if (authLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-slate-500">Loading your workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <SectionHeading
        eyebrow="Task command center"
        title="Sort, filter, and finish work cleanly"
        description="Capture quickly, let the dashboard suggest what's next, and submit proof only when the work is actually done."
        action={
          <Button onClick={openNewTaskModal}>
            <Plus className="h-4 w-4" />
            Create task
          </Button>
        }
      />

      {/* Stats row */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Due today" value={stats.dueToday} helper="Needs attention before tonight." accent="sky" icon={Clock} />
        <StatCard label="Overdue" value={stats.overdue} helper="Backlog to clear first." accent="rose" icon={AlertTriangle} />
        <StatCard label="Completed" value={stats.completed} helper={`${stats.completionRate}% of all tasks`} accent="emerald" icon={CheckCircle2} />
        <StatCard label="Streak" value={`${stats.streak}d`} helper="Days with at least one completion." accent="amber" icon={Flame} />
        <StatCard label="Focus this week" value={formatMinutesAsHours(stats.focusMinutes)} helper={`${weeklyGoalHours}h weekly goal`} accent="violet" icon={Target} />
      </div>

      {/* Plan + momentum row */}
      <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <TodayPlanCard tasks={todayPlan} />
        <WeeklyMomentumCard tasks={tasks} weeklyGoalHours={weeklyGoalHours} />
      </div>

      {/* Task list + sidebar */}
      <div className="grid gap-5 xl:grid-cols-[1.45fr_0.95fr]">
        {/* Task list */}
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-40">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
              <input
                className="h-10 w-full rounded-xl border border-white/8 bg-white/[0.03] pl-9 pr-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-sky-400/40 focus:bg-white/5 focus:ring-1 focus:ring-sky-400/15"
                placeholder="Search tasks..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="h-4 w-4 shrink-0 text-slate-600" />
              <select
                className="h-10 rounded-xl border border-white/8 bg-white/[0.03] px-3 text-sm text-slate-300 outline-none transition focus:border-sky-400/40 cursor-pointer"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">All status</option>
                <option value="open">Open</option>
                <option value="today">Due today</option>
                <option value="overdue">Overdue</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
              </select>
              <select
                className="h-10 rounded-xl border border-white/8 bg-white/[0.03] px-3 text-sm text-slate-300 outline-none transition focus:border-sky-400/40 cursor-pointer"
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value)}
              >
                <option value="all">All priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <select
                className="h-10 rounded-xl border border-white/8 bg-white/[0.03] px-3 text-sm text-slate-300 outline-none transition focus:border-sky-400/40 cursor-pointer"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                <option value="dueDate">Sort: Due date</option>
                <option value="priority">Sort: Priority</option>
                <option value="recent">Sort: Recent</option>
                <option value="title">Sort: Title</option>
              </select>
            </div>
          </div>

          {/* Task list body */}
          <div>
            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <p className="text-sm text-slate-500">Loading tasks...</p>
              </div>
            ) : tasks.length === 0 ? (
              <GuidedEmptyState hasPremium={hasPremium} onCreateTask={openNewTaskModal} />
            ) : filteredTasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-14 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">No matches</p>
                <h3 className="mt-3 text-xl font-bold text-white">Nothing fits this filter.</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                  Try widening the search or clearing a filter to bring tasks back into view.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={openEditTaskModal}
                    onDelete={handleDelete}
                    onOpenCompletion={openCompletionModal}
                    onMarkIncomplete={handleMarkIncomplete}
                    requireProof={requireProof}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          <CalendarCard agenda={agenda} />

          <Card>
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-sky-400" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-400/70">Goal progress</p>
            </div>
            <h3 className="mt-2 text-xl font-bold text-white">Weekly focus target</h3>
            <div className="mt-5">
              <ProgressBar
                value={Math.round(stats.focusMinutes / 60)}
                max={weeklyGoalHours}
                label="Tracked focus hours"
                helper="Completed task estimates count toward your weekly target."
              />
            </div>
          </Card>

          <UpsellCard profile={profile} />
        </div>
      </div>

      {/* Task modal */}
      <Modal
        open={taskModalOpen}
        title={editingTask ? "Edit task" : "Create task"}
        description={editingTask ? "Refine the task details." : "Capture the work now, then submit proof at completion time."}
        onClose={() => { setTaskModalOpen(false); resetTaskComposer(); }}
        size="lg"
      >
        <TaskForm
          form={taskForm}
          setForm={setTaskForm}
          onSubmit={handleTaskSubmit}
          onCancel={() => { setTaskModalOpen(false); resetTaskComposer(); }}
          busy={savingTask}
          editing={Boolean(editingTask)}
          onApplyTemplate={(template) => setTaskForm((current) => ({ ...current, ...template.values }))}
        />
        {taskError && <AlertBox variant="error" className="mt-4">{taskError}</AlertBox>}
      </Modal>

      {/* Completion modal */}
      <CompletionModal
        open={completionModalOpen}
        task={completionTask}
        onClose={() => { setCompletionModalOpen(false); resetCompletionComposer(); }}
        onSubmit={handleCompletionSubmit}
        busy={completionBusy}
        error={completionError}
        proofState={completionProof}
        setProofState={setCompletionProof}
        isPremium={hasPremium}
        requireProof={requireProof}
        proofImageFileName={completionProofImage?.name || ""}
        proofPreviewUrl={completionProofPreview}
        onProofImageChange={handleProofImageChange}
      />
    </div>
  );
}
