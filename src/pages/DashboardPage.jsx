import { startTransition, useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useStudyReminders } from "../hooks/useStudyReminders";
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
  return `${format(startMinutes)} - ${format(startMinutes + duration)}`;
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
        ? "This is overdue, so clearing it reduces stress fastest."
        : task.dueDate === todayKey
          ? "This is due today, so it belongs at the front of your plan."
          : task.priority === "High"
            ? "High-priority work deserves a protected block before lighter tasks."
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

function TaskTemplatePicker({ onApplyTemplate }) {
  return (
    <div className="grid gap-3">
      <div>
        <p className="text-sm font-semibold text-slate-200">Start from a quick template</p>
        <p className="mt-1 text-xs text-slate-500">
          This keeps task creation fast instead of making you fill every field from scratch.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {TASK_TEMPLATES.map((template) => (
          <button
            key={template.key}
            type="button"
            onClick={() => onApplyTemplate(template)}
            className="rounded-[22px] border border-white/10 bg-slate-950/70 p-4 text-left transition hover:border-sky-400/30 hover:bg-white/5"
          >
            <p className="font-semibold text-white">{template.label}</p>
            <p className="mt-2 text-sm text-slate-400">{template.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function TaskForm({ form, setForm, onSubmit, onCancel, busy, editing, onApplyTemplate }) {
  return (
    <form className="grid gap-5 md:grid-cols-2" onSubmit={onSubmit}>
      {!editing ? (
        <div className="md:col-span-2">
          <TaskTemplatePicker onApplyTemplate={onApplyTemplate} />
        </div>
      ) : null}
      <TextInput
        label="Task title"
        placeholder="Finish calculus problem set"
        value={form.title}
        onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
        required
      />
      <TextInput
        label="Course"
        placeholder="Math 212"
        value={form.course}
        onChange={(event) => setForm((current) => ({ ...current, course: event.target.value }))}
        required
      />
      <TextInput
        label="Due date"
        type="date"
        value={form.dueDate}
        onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
        required
      />
      <Select
        label="Priority"
        value={form.priority}
        onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
      >
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </Select>
      <TextInput
        label="Estimated study time (minutes)"
        type="number"
        min="15"
        step="15"
        value={form.estimatedMinutes}
        onChange={(event) => setForm((current) => ({ ...current, estimatedMinutes: event.target.value }))}
      />
      <div className="md:col-span-2">
        <TextArea
          label="Description"
          placeholder="Add details, acceptance criteria, or study checklist..."
          value={form.description}
          onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
        />
      </div>
      <p className="md:col-span-2 text-sm text-slate-400">
        Proof is submitted when you finish the task. That keeps capture fast and puts verification at the right
        moment.
      </p>
      <div className="md:col-span-2 flex flex-wrap justify-end gap-3">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? "Saving..." : editing ? "Save changes" : "Create task"}
        </Button>
      </div>
    </form>
  );
}

function ProofUploader({ fileName, previewUrl, onChange, disabled }) {
  return (
    <div className="grid gap-3 rounded-[24px] border border-white/10 bg-slate-950/40 p-4">
      <div>
        <p className="text-sm font-semibold text-slate-200">Premium image proof</p>
        <p className="text-xs text-slate-500">
          Upload a screenshot or photo and StudySync will attach it as the proof for completion.
        </p>
      </div>
      {previewUrl ? (
        <img src={previewUrl} alt="Proof preview" className="max-h-52 rounded-2xl border border-white/10 object-cover" />
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-slate-500">
          No image selected yet.
        </div>
      )}
      <label className="inline-flex w-fit cursor-pointer items-center justify-center rounded-2xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700">
        <input type="file" accept="image/*" className="hidden" disabled={disabled} onChange={onChange} />
        {fileName ? `Selected: ${fileName}` : "Choose image"}
      </label>
    </div>
  );
}

function CompletionModal({
  open,
  task,
  onClose,
  onSubmit,
  busy,
  error,
  proofState,
  setProofState,
  isPremium,
  requireProof,
  proofImageFileName,
  proofPreviewUrl,
  onProofImageChange,
}) {
  if (!task) return null;

  return (
    <Modal
      open={open}
      title={`Complete ${task.title}`}
      description="Submit proof now so the task can be verified and finished cleanly."
      onClose={onClose}
    >
      <form className="grid gap-5" onSubmit={onSubmit}>
        <Card className="bg-slate-950/60">
          <p className="text-sm uppercase tracking-[0.18em] text-sky-300/80">Task subject</p>
          <h3 className="mt-2 text-xl font-bold text-white">{task.course}</h3>
          <p className="mt-2 text-sm text-slate-400">{task.description || "No extra description on this task."}</p>
        </Card>
        <TextArea
          label="Completion note"
          hint="Optional context about what you finished. This is stored with the completion."
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
            hint="Use a public Google Doc. StudySync reads the doc and checks whether the proof matches the task subject before completing it."
            required={requireProof}
          />
        )}
        <div className="rounded-[24px] border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-400">
          {isPremium
            ? requireProof
              ? "Premium users must upload an image proof before the task can be completed."
              : "Premium users can add an image proof here before completing the task."
            : requireProof
              ? "Free users must submit a Google Doc proof link before the task can be completed."
              : "Free users can optionally submit a Google Doc proof link here before completing the task."}
        </div>
        {error ? (
          <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? "Verifying..." : "Finish task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function TaskCard({ task, onEdit, onDelete, onOpenCompletion, onMarkIncomplete, requireProof }) {
  const badges = getTaskBadges(task, requireProof);

  return (
    <Card className={task.completed ? "border-emerald-400/20 bg-emerald-500/5" : "bg-slate-900/80"}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={`text-xl font-bold ${task.completed ? "text-slate-400 line-through" : "text-white"}`}>
              {task.title}
            </h3>
            <Badge className={`ring-1 ${getPriorityTone(task.priority)}`}>{task.priority}</Badge>
          </div>
          <p className="mt-2 text-sm text-slate-400">
            {task.course} - Due {formatDateLabel(task.dueDate, { month: "short", day: "numeric", weekday: "short" })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => (
            <Badge key={badge.label} className={`ring-1 ${badge.tone}`}>
              {badge.label}
            </Badge>
          ))}
        </div>
      </div>
      {task.description ? <p className="mt-4 text-slate-300">{task.description}</p> : null}
      <div className="mt-4 grid gap-2 text-sm text-slate-400">
        <p>Estimated focus: {task.estimatedMinutes || 0} minutes</p>
        {task.proofLink ? (
          <a href={task.proofLink} target="_blank" rel="noreferrer" className="text-sky-300 transition hover:text-sky-200">
            Open Google Doc proof
          </a>
        ) : null}
        {task.imageProofUrl ? (
          <a href={task.imageProofUrl} target="_blank" rel="noreferrer" className="text-sky-300 transition hover:text-sky-200">
            Open image proof
          </a>
        ) : null}
        {task.completionNote ? <p className="text-slate-300">Completion note: {task.completionNote}</p> : null}
      </div>
      {task.imageProofUrl ? (
        <img src={task.imageProofUrl} alt={`${task.title} proof`} className="mt-4 max-h-52 rounded-2xl border border-white/10 object-cover" />
      ) : null}
      <div className="mt-5 flex flex-wrap gap-3">
        {task.completed ? (
          <Button variant="secondary" onClick={() => onMarkIncomplete(task)}>
            Mark incomplete
          </Button>
        ) : (
          <Button onClick={() => onOpenCompletion(task)}>Submit proof</Button>
        )}
        <Button variant="secondary" onClick={() => onEdit(task)}>
          Edit
        </Button>
        <Button variant="danger" onClick={() => onDelete(task.id)}>
          Delete
        </Button>
      </div>
    </Card>
  );
}

function GuidedEmptyState({ hasPremium, onCreateTask }) {
  return (
    <Card className="border-dashed border-white/12 bg-slate-950/60">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300/80">First three moves</p>
      <h3 className="mt-4 text-3xl font-bold text-white">Start your system, not just a list.</h3>
      <p className="mt-3 max-w-2xl text-slate-400">
        The fastest way to make StudySync useful is to set up one real task, shape your study window, and then let
        the dashboard plan the next move.
      </p>
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-300/80">Step 1</p>
          <h4 className="mt-3 text-xl font-bold text-white">Create your first task</h4>
          <p className="mt-2 text-sm text-slate-400">Add one real assignment with a due date and estimated minutes.</p>
          <div className="mt-5"><Button onClick={onCreateTask}>Create task</Button></div>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-300/80">Step 2</p>
          <h4 className="mt-3 text-xl font-bold text-white">Set your study window</h4>
          <p className="mt-2 text-sm text-slate-400">Tell StudySync when you usually study so today&apos;s plan feels personal.</p>
          <div className="mt-5"><LinkButton to="/app/settings" variant="secondary">Open settings</LinkButton></div>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-300/80">Step 3</p>
          <h4 className="mt-3 text-xl font-bold text-white">{hasPremium ? "Use an AI tool" : "Unlock AI when you need leverage"}</h4>
          <p className="mt-2 text-sm text-slate-400">{hasPremium ? "Generate a study plan or quiz once you have real work in the system." : "Free stays strong, but premium turns your workload into plans, quizzes, and flashcards."}</p>
          <div className="mt-5"><LinkButton to={hasPremium ? "/app/ai" : "/app/billing"} variant={hasPremium ? "secondary" : "primary"}>{hasPremium ? "Open AI tools" : "View plans"}</LinkButton></div>
        </div>
      </div>
    </Card>
  );
}

function TodayPlanCard({ tasks }) {
  return (
    <Card>
      <p className="text-sm uppercase tracking-[0.24em] text-sky-300/80">Today&apos;s plan</p>
      <h3 className="mt-2 text-2xl font-bold text-white">What to study next</h3>
      {tasks.length === 0 ? (
        <p className="mt-4 text-slate-400">No urgent blocks yet. Add a task and StudySync will build today&apos;s plan.</p>
      ) : (
        <div className="mt-6 grid gap-4">
          {tasks.map((task) => (
            <div key={task.id} className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-sky-300/80">{task.orderLabel}</p>
                  <h4 className="mt-2 text-lg font-semibold text-white">{task.title}</h4>
                </div>
                <Badge className={`ring-1 ${getPriorityTone(task.priority)}`}>{task.slot}</Badge>
              </div>
              <p className="mt-3 text-sm text-slate-300">{task.reason}</p>
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

  return (
    <Card>
      <p className="text-sm uppercase tracking-[0.24em] text-sky-300/80">Weekly momentum</p>
      <h3 className="mt-2 text-2xl font-bold text-white">Recent completions</h3>
      <div className="mt-6 flex items-end gap-3">
        {trend.map((item) => (
          <div key={item.key} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-36 w-full items-end rounded-2xl bg-slate-950/60 p-2">
              <div
                className="w-full rounded-xl bg-gradient-to-t from-sky-400 to-teal-300"
                style={{ height: `${Math.max(12, item.completed * 24)}px` }}
              />
            </div>
            <p className="text-xs text-slate-500">{item.label}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-slate-400">
        {completedThisWeek} completed this week against a {weeklyGoalHours}-hour goal.
      </p>
    </Card>
  );
}

function CalendarCard({ agenda }) {
  return (
    <Card>
      <p className="text-sm uppercase tracking-[0.24em] text-sky-300/80">Calendar view</p>
      <h3 className="mt-2 text-2xl font-bold text-white">Next seven days</h3>
      <div className="mt-6 grid gap-3">
        {agenda.map((day) => (
          <div
            key={day.key}
            className="flex items-center justify-between rounded-[22px] border border-white/10 bg-slate-950/60 px-4 py-3"
          >
            <div>
              <p className="text-sm font-semibold text-white">{day.label}</p>
              <p className="text-xs text-slate-500">{day.dayLabel}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-200">{day.count} due</p>
              <p className="text-xs text-slate-500">{day.priorities} high priority</p>
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
      <Card>
        <p className="text-sm uppercase tracking-[0.24em] text-sky-300/80">Power workspace</p>
        <h3 className="mt-2 text-2xl font-bold text-white">Best-model AI is already unlocked</h3>
        <p className="mt-3 text-slate-400">
          You are on the highest StudySync tier, so keep using AI planning, quizzes, and richer breakdowns.
        </p>
        <div className="mt-5">
          <LinkButton to="/app/ai" variant="secondary">
            Open AI tools
          </LinkButton>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <Badge className="bg-sky-500/15 text-sky-200 ring-sky-400/25">{nextPlan.badge}</Badge>
      <h3 className="mt-4 text-2xl font-bold text-white">{nextPlan.name} unlocks stronger proof and AI</h3>
      <p className="mt-3 text-slate-400">
        Move up when you want cleaner proof uploads, more study generations, and better planning help.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <LinkButton to="/app/billing">View billing</LinkButton>
        <LinkButton to="/pricing" variant="secondary">
          Compare plans
        </LinkButton>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  useStudyReminders({ user, profile });

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
      startTransition(() => {
        setTasks(nextTasks.map(normalizeLoadedTask));
      });
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    return () => {
      if (completionProofPreview) {
        URL.revokeObjectURL(completionProofPreview);
      }
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
    if (completionProofPreview) {
      URL.revokeObjectURL(completionProofPreview);
    }
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
    setCompletionProof({
      proofLink: task.proofLink || "",
      completionNote: task.completionNote || "",
    });
    setCompletionProofImage(null);
    if (completionProofPreview) {
      URL.revokeObjectURL(completionProofPreview);
    }
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
    await updateTask(user.uid, task.id, {
      completed: false,
      completedAt: "",
    });
    await loadTasks();
  }

  function handleProofImageChange(event) {
    const file = event.target.files?.[0];
    setCompletionProofImage(file || null);
    if (completionProofPreview) {
      URL.revokeObjectURL(completionProofPreview);
      setCompletionProofPreview("");
    }
    if (file) {
      setCompletionProofPreview(URL.createObjectURL(file));
    }
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
      <Card>
        <p className="text-slate-300">Loading your workspace...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Task command center"
        title="Sort, filter, and finish work cleanly"
        description="Capture quickly, let the dashboard suggest the next move, and submit proof only when the work is actually done."
        action={<Button onClick={openNewTaskModal}>Create task</Button>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Due today" value={stats.dueToday} helper="Work that needs attention before tonight." />
        <StatCard label="Overdue" value={stats.overdue} helper="Backlog that should be cleared first." accent="rose" />
        <StatCard
          label="Completed"
          value={stats.completed}
          helper={`${stats.completionRate}% of all tracked tasks`}
          accent="emerald"
        />
        <StatCard
          label="Streak"
          value={`${stats.streak} day${stats.streak === 1 ? "" : "s"}`}
          helper="Days with at least one completion."
          accent="amber"
        />
        <StatCard
          label="Focus this week"
          value={formatMinutesAsHours(stats.focusMinutes)}
          helper={`${weeklyGoalHours}h weekly goal`}
          accent="violet"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <TodayPlanCard tasks={todayPlan} />
        <WeeklyMomentumCard tasks={tasks} weeklyGoalHours={weeklyGoalHours} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
        <div className="space-y-6">
          <Card>
            <div className="flex flex-col gap-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <TextInput
                  label="Search"
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <Select label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                  <option value="all">All</option>
                  <option value="open">Open</option>
                  <option value="today">Due today</option>
                  <option value="overdue">Overdue</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                </Select>
                <Select
                  label="Priority"
                  value={priorityFilter}
                  onChange={(event) => setPriorityFilter(event.target.value)}
                >
                  <option value="all">All</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </Select>
                <Select label="Sort by" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                  <option value="dueDate">Due date</option>
                  <option value="priority">Priority</option>
                  <option value="recent">Recently updated</option>
                  <option value="title">Title</option>
                </Select>
              </div>

              {loading ? (
                <p className="text-slate-400">Loading tasks...</p>
              ) : tasks.length === 0 ? (
                <GuidedEmptyState hasPremium={hasPremium} onCreateTask={openNewTaskModal} />
              ) : filteredTasks.length === 0 ? (
                <Card className="border-dashed border-white/12 bg-slate-950/60 text-center">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300/80">No matches</p>
                  <h3 className="mt-4 text-2xl font-bold text-white">Nothing fits this filter right now.</h3>
                  <p className="mx-auto mt-3 max-w-xl text-slate-400">
                    Try widening the search or clearing a filter to bring tasks back into view.
                  </p>
                </Card>
              ) : (
                <div className="grid gap-4">
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
          </Card>
        </div>

        <div className="space-y-6">
          <CalendarCard agenda={agenda} />
          <Card>
            <p className="text-sm uppercase tracking-[0.24em] text-sky-300/80">Goal progress</p>
            <h3 className="mt-2 text-2xl font-bold text-white">Weekly focus target</h3>
            <div className="mt-6">
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

      <Modal
        open={taskModalOpen}
        title={editingTask ? "Edit task" : "Create task"}
        description={
          editingTask ? "Refine the task details." : "Capture the work now, then submit proof at completion time."
        }
        onClose={() => {
          setTaskModalOpen(false);
          resetTaskComposer();
        }}
      >
        <TaskForm
          form={taskForm}
          setForm={setTaskForm}
          onSubmit={handleTaskSubmit}
          onCancel={() => {
            setTaskModalOpen(false);
            resetTaskComposer();
          }}
          busy={savingTask}
          editing={Boolean(editingTask)}
          onApplyTemplate={(template) => {
            setTaskForm((current) => ({
              ...current,
              ...template.values,
            }));
          }}
        />
        {taskError ? (
          <p className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {taskError}
          </p>
        ) : null}
      </Modal>

      <CompletionModal
        open={completionModalOpen}
        task={completionTask}
        onClose={() => {
          setCompletionModalOpen(false);
          resetCompletionComposer();
        }}
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
