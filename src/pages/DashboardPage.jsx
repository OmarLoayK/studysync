import { startTransition, useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { DEFAULT_SETTINGS, PLAN_DETAILS, TASK_TEMPLATES } from "../lib/constants";
import { buildAgenda, buildWeeklyTrend, calculateStreak, formatDateLabel, getCompletionRate, getPriorityTone, getTaskBadges, hasTaskProof, isPremiumPlan, sortTasks, toDateKey } from "../lib/utils";
import { createTask, listTasks, removeTask, updateTask } from "../services/firestore";
import { uploadTaskProofImage } from "../services/storage";
import { Badge, Button, Card, LinkButton, Modal, ProgressBar, SectionHeading, Select, StatCard, TextArea, TextInput } from "../components/ui";

const emptyTask = { title: "", course: "", description: "", dueDate: "", priority: "Medium", estimatedMinutes: 60, proofLink: "", completionNote: "", imageProofUrl: "" };

function normalizeTask(values) {
  return {
    title: values.title.trim(),
    course: values.course.trim(),
    description: values.description.trim(),
    dueDate: values.dueDate,
    priority: values.priority,
    estimatedMinutes: Number(values.estimatedMinutes || 0),
    proofLink: values.proofLink.trim(),
    completionNote: values.completionNote.trim(),
    imageProofUrl: values.imageProofUrl?.trim() || "",
  };
}

function parseStudyWindow(windowValue = "18:00-20:00") {
  const [startValue = "18:00"] = windowValue.split("-");
  const [hour = 18, minute = 0] = startValue.split(":").map(Number);
  return { hour, minute };
}

function formatSlotLabel(startMinutes, duration) {
  const format = (minutes) =>
    new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(2026, 0, 1, Math.floor(minutes / 60), minutes % 60));
  return `${format(startMinutes)} - ${format(startMinutes + duration)}`;
}

function buildTodayPlan(tasks, preferredStudyWindow) {
  const todayKey = toDateKey();
  const ranked = [...tasks]
    .filter((task) => !task.completed)
    .sort((left, right) => {
      const score = (task) => (task.dueDate < todayKey ? 100 : 0) + (task.dueDate === todayKey ? 60 : 0) + (task.priority === "High" ? 25 : task.priority === "Medium" ? 15 : 5);
      const delta = score(right) - score(left);
      if (delta !== 0) return delta;
      return `${left.dueDate ?? ""}`.localeCompare(`${right.dueDate ?? ""}`);
    })
    .slice(0, 3);

  let cursor = parseStudyWindow(preferredStudyWindow).hour * 60 + parseStudyWindow(preferredStudyWindow).minute;
  return ranked.map((task, index) => {
    const duration = Number(task.estimatedMinutes || 45);
    const reason = task.dueDate < todayKey
      ? "This is overdue, so clearing it reduces stress fastest."
      : task.dueDate === todayKey
        ? "This is due today, so it belongs at the front of your plan."
        : task.priority === "High"
          ? "High-priority work deserves a protected block before lighter tasks."
          : "Keep momentum with an upcoming task.";

    const item = { ...task, orderLabel: `Block ${index + 1}`, slot: formatSlotLabel(cursor, duration), reason };
    cursor += duration + 10;
    return item;
  });
}

function ProofUploader({ fileName, previewUrl, onChange, disabled, isPremium }) {
  return (
    <div className="grid gap-3 rounded-[24px] border border-white/10 bg-slate-950/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-200">Image proof</p>
          <p className="text-xs text-slate-500">{isPremium ? "Premium users can upload a screenshot or photo proof with each task." : "Upgrade to premium to unlock image proof uploads."}</p>
        </div>
        <Badge className={isPremium ? "bg-emerald-500/15 text-emerald-200 ring-emerald-400/25" : "bg-slate-900 text-slate-300 ring-white/10"}>{isPremium ? "Premium" : "Locked"}</Badge>
      </div>
      {previewUrl ? <img src={previewUrl} alt="Proof preview" className="max-h-52 rounded-2xl border border-white/10 object-cover" /> : <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-slate-500">No image proof attached yet.</div>}
      <label className={`inline-flex w-fit items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold ${isPremium ? "bg-slate-800 text-slate-100 hover:bg-slate-700" : "bg-slate-900/70 text-slate-500"}`}>
        <input type="file" accept="image/*" className="hidden" disabled={disabled || !isPremium} onChange={onChange} />
        {fileName ? `Selected: ${fileName}` : "Choose image"}
      </label>
    </div>
  );
}

function TaskForm({ form, setForm, onSubmit, onCancel, busy, editing, proofImageName, previewUrl, onProofImageChange, isPremium, requireProof, onApplyTemplate }) {
  return (
    <form className="grid gap-5 md:grid-cols-2" onSubmit={onSubmit}>
      {!editing ? (
        <div className="md:col-span-2">
          <p className="text-sm font-semibold text-slate-200">Start from a quick template</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {TASK_TEMPLATES.map((template) => (
              <button key={template.key} type="button" onClick={() => onApplyTemplate(template)} className="rounded-[22px] border border-white/10 bg-slate-950/70 p-4 text-left transition hover:border-sky-400/30 hover:bg-white/5">
                <p className="font-semibold text-white">{template.label}</p>
                <p className="mt-2 text-sm text-slate-400">{template.description}</p>
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <TextInput label="Task title" placeholder="Finish calculus problem set" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required />
      <TextInput label="Course" placeholder="Math 212" value={form.course} onChange={(event) => setForm((current) => ({ ...current, course: event.target.value }))} required />
      <TextInput label="Due date" type="date" value={form.dueDate} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} required />
      <Select label="Priority" value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}><option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option></Select>
      <TextInput label="Estimated study time (minutes)" type="number" min="15" step="15" value={form.estimatedMinutes} onChange={(event) => setForm((current) => ({ ...current, estimatedMinutes: event.target.value }))} />
      <TextInput label="Proof link" placeholder="https://..." value={form.proofLink} onChange={(event) => setForm((current) => ({ ...current, proofLink: event.target.value }))} hint="Optional, but useful for accountability." />
      <div className="md:col-span-2"><TextArea label="Description" placeholder="Add details, acceptance criteria, or study checklist..." value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} /></div>
      <div className="md:col-span-2"><TextArea label="Completion note" placeholder="Paste what you completed or what to verify before checking this off." value={form.completionNote} onChange={(event) => setForm((current) => ({ ...current, completionNote: event.target.value }))} /></div>
      <div className="md:col-span-2"><ProofUploader fileName={proofImageName} previewUrl={previewUrl} onChange={onProofImageChange} disabled={busy} isPremium={isPremium} /></div>
      <p className="md:col-span-2 text-sm text-slate-400">{requireProof ? (isPremium ? "Completion unlocks when at least one proof signal is present: a proof link, a completion note, or a premium image proof." : "Completion unlocks when at least one proof signal is present: a proof link or a completion note. Premium adds image proof too.") : "Proof is optional right now, but leaving a note, link, or image makes your study history more trustworthy."}</p>
      <div className="md:col-span-2 flex flex-wrap justify-end gap-3">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={busy}>{busy ? "Saving..." : editing ? "Save changes" : "Create task"}</Button>
      </div>
    </form>
  );
}

function TaskCard({ task, onEdit, onDelete, onToggleComplete, requireProof }) {
  const badges = getTaskBadges(task, requireProof);
  const canComplete = !requireProof || hasTaskProof(task);
  return (
    <Card className={task.completed ? "border-emerald-400/20 bg-emerald-500/5" : "bg-slate-900/80"}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={`text-xl font-bold ${task.completed ? "text-slate-400 line-through" : "text-white"}`}>{task.title}</h3>
            <Badge className={`ring-1 ${getPriorityTone(task.priority)}`}>{task.priority}</Badge>
          </div>
          <p className="mt-2 text-sm text-slate-400">{task.course} - Due {formatDateLabel(task.dueDate, { month: "short", day: "numeric", weekday: "short" })}</p>
        </div>
        <div className="flex flex-wrap gap-2">{badges.map((badge) => <Badge key={badge.label} className={`ring-1 ${badge.tone}`}>{badge.label}</Badge>)}</div>
      </div>
      {task.description ? <p className="mt-4 text-slate-300">{task.description}</p> : null}
      <div className="mt-4 grid gap-2 text-sm text-slate-400">
        <p>Estimated focus: {task.estimatedMinutes || 0} minutes</p>
        {task.proofLink ? <a href={task.proofLink} target="_blank" rel="noreferrer" className="text-sky-300 transition hover:text-sky-200">Open proof link</a> : null}
        {task.imageProofUrl ? <a href={task.imageProofUrl} target="_blank" rel="noreferrer" className="text-sky-300 transition hover:text-sky-200">Open image proof</a> : null}
        {task.completionNote ? <p className="text-slate-300">Note: {task.completionNote}</p> : null}
      </div>
      {task.imageProofUrl ? <img src={task.imageProofUrl} alt={`${task.title} proof`} className="mt-4 max-h-52 rounded-2xl border border-white/10 object-cover" /> : null}
      <div className="mt-5 flex flex-wrap gap-3">
        <Button variant={task.completed ? "secondary" : canComplete ? "primary" : "ghost"} onClick={() => onToggleComplete(task)} disabled={!task.completed && !canComplete}>{task.completed ? "Mark incomplete" : canComplete ? "Complete" : "Add proof first"}</Button>
        <Button variant="secondary" onClick={() => onEdit(task)}>Edit</Button>
        <Button variant="danger" onClick={() => onDelete(task.id)}>Delete</Button>
      </div>
    </Card>
  );
}

function GuidedEmptyState({ hasPremium, onCreateTask }) {
  return (
    <Card className="border-dashed border-white/12 bg-slate-950/60">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300/80">First three moves</p>
      <h3 className="mt-4 text-3xl font-bold text-white">Start your system, not just a list.</h3>
      <p className="mt-3 max-w-2xl text-slate-400">The fastest way to make StudySync useful is to set up one real task, shape your study window, and then let the dashboard plan the next move.</p>
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-5"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-300/80">Step 1</p><h4 className="mt-3 text-xl font-bold text-white">Create your first task</h4><p className="mt-2 text-sm text-slate-400">Add one real assignment with a due date and estimated minutes.</p><div className="mt-5"><Button onClick={onCreateTask}>Create task</Button></div></div>
        <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-5"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-300/80">Step 2</p><h4 className="mt-3 text-xl font-bold text-white">Set your study window</h4><p className="mt-2 text-sm text-slate-400">Tell StudySync when you usually study so today’s plan feels personal.</p><div className="mt-5"><LinkButton to="/app/settings" variant="secondary">Open settings</LinkButton></div></div>
        <div className="rounded-[24px] border border-white/10 bg-slate-900/80 p-5"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-300/80">Step 3</p><h4 className="mt-3 text-xl font-bold text-white">{hasPremium ? "Use an AI tool" : "Unlock AI when you need leverage"}</h4><p className="mt-2 text-sm text-slate-400">{hasPremium ? "Generate a study plan or quiz once you have real work in the system." : "Free stays strong, but premium turns your workload into plans, quizzes, and flashcards."}</p><div className="mt-5"><LinkButton to={hasPremium ? "/app/ai" : "/app/billing"} variant={hasPremium ? "secondary" : "primary"}>{hasPremium ? "Open AI tools" : "View plans"}</LinkButton></div></div>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { user, profile, saveProfile } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [proofImageFile, setProofImageFile] = useState(null);
  const [proofImagePreview, setProofImagePreview] = useState("");
  const [formBusy, setFormBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("due");
  const [error, setError] = useState("");
  const deferredSearch = useDeferredValue(search);
  const hasPremium = isPremiumPlan(profile);
  const isPower = profile?.plan?.tier === "power" && ["active", "trialing"].includes(profile?.plan?.status);
  const requireProof = profile?.settings?.requireProofBeforeCompletion ?? true;

  const loadTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      setTasks(await listTasks(user.uid));
    } catch (caughtError) {
      setError(caughtError.message || "Could not load tasks.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const todayKey = toDateKey();
  const dueToday = useMemo(() => tasks.filter((task) => !task.completed && task.dueDate === todayKey), [tasks, todayKey]);
  const overdue = useMemo(() => tasks.filter((task) => !task.completed && task.dueDate < todayKey), [tasks, todayKey]);
  const upcoming = useMemo(() => tasks.filter((task) => !task.completed && task.dueDate > todayKey).sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 5), [tasks, todayKey]);
  const agenda = useMemo(() => buildAgenda(tasks), [tasks]);
  const weeklyTrend = useMemo(() => buildWeeklyTrend(tasks), [tasks]);
  const streak = useMemo(() => calculateStreak(tasks), [tasks]);
  const completionRate = useMemo(() => getCompletionRate(tasks), [tasks]);
  const weeklyCompletedMinutes = useMemo(() => tasks.filter((task) => task.completedAt && (Date.now() - new Date(task.completedAt).getTime()) / 86400000 <= 7).reduce((total, task) => total + Number(task.estimatedMinutes || 0), 0), [tasks]);
  const todayPlan = useMemo(() => buildTodayPlan(tasks, profile?.settings?.preferredStudyWindow), [profile?.settings?.preferredStudyWindow, tasks]);

  const filteredTasks = useMemo(() => {
    const base = tasks.filter((task) => {
      const matchesSearch = `${task.title} ${task.course} ${task.description}`.toLowerCase().includes(deferredSearch.toLowerCase());
      const matchesStatus = statusFilter === "all" ? true : statusFilter === "completed" ? task.completed : statusFilter === "overdue" ? !task.completed && task.dueDate < todayKey : statusFilter === "today" ? !task.completed && task.dueDate === todayKey : !task.completed;
      const matchesPriority = priorityFilter === "all" ? true : task.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
    return sortTasks(base, sortBy);
  }, [deferredSearch, priorityFilter, sortBy, statusFilter, tasks, todayKey]);

  function resetTaskComposer() {
    setTaskForm(emptyTask);
    setProofImageFile(null);
    setProofImagePreview("");
  }

  function applyTemplate(template) {
    setTaskForm((current) => ({ ...current, ...template.values, dueDate: current.dueDate || toDateKey() }));
  }

  function openNewTaskModal() {
    setEditingTask(null);
    setTaskForm({ ...emptyTask, dueDate: toDateKey(), estimatedMinutes: 60, completionNote: requireProof ? "" : "Finished" });
    setProofImageFile(null);
    setProofImagePreview("");
    setTaskModalOpen(true);
  }

  function openEditTaskModal(task) {
    setEditingTask(task);
    setTaskForm({
      title: task.title ?? "",
      course: task.course ?? "",
      description: task.description ?? "",
      dueDate: task.dueDate ?? "",
      priority: task.priority ?? "Medium",
      estimatedMinutes: task.estimatedMinutes ?? 60,
      proofLink: task.proofLink ?? "",
      completionNote: task.completionNote ?? "",
      imageProofUrl: task.imageProofUrl ?? "",
    });
    setProofImageFile(null);
    setProofImagePreview(task.imageProofUrl ?? "");
    setTaskModalOpen(true);
  }

  function handleProofImageChange(event) {
    const nextFile = event.target.files?.[0] || null;
    setProofImageFile(nextFile);
    setProofImagePreview(nextFile ? URL.createObjectURL(nextFile) : taskForm.imageProofUrl || "");
  }

  async function handleTaskSubmit(event) {
    event.preventDefault();
    const payload = normalizeTask(taskForm);
    if (!payload.title || !payload.course || !payload.dueDate) {
      setError("Title, course, and due date are required.");
      return;
    }

    setFormBusy(true);
    setError("");
    try {
      if (proofImageFile) {
        if (!hasPremium) throw new Error("Image proof uploads are available on Premium.");
        payload.imageProofUrl = await uploadTaskProofImage(user.uid, proofImageFile);
      }

      if (editingTask) {
        await updateTask(user.uid, editingTask.id, payload);
      } else {
        await createTask(user.uid, payload);
      }

      startTransition(() => {
        setTaskModalOpen(false);
        setEditingTask(null);
        resetTaskComposer();
      });
      await loadTasks();
    } catch (caughtError) {
      setError(caughtError.message || "We could not save that task.");
    } finally {
      setFormBusy(false);
    }
  }

  async function handleDelete(taskId) {
    await removeTask(user.uid, taskId);
    await loadTasks();
  }

  async function handleToggleComplete(task) {
    if (requireProof && !task.completed && !hasTaskProof(task)) {
      setError("Add a proof link, image proof, or completion note before marking a task complete.");
      return;
    }

    await updateTask(user.uid, task.id, {
      completed: !task.completed,
      completedAt: task.completed ? "" : new Date().toISOString(),
    });

    const nextCompletedCount = task.completed ? Math.max(0, (profile?.stats?.tasksCompleted ?? 1) - 1) : (profile?.stats?.tasksCompleted ?? 0) + 1;
    await saveProfile({
      stats: {
        ...profile?.stats,
        tasksCompleted: nextCompletedCount,
        currentStreak: task.completed ? Math.max(0, (profile?.stats?.currentStreak ?? streak) - 1) : streak,
        longestStreak: Math.max(profile?.stats?.longestStreak ?? 0, streak),
        focusHoursThisWeek: Math.round(weeklyCompletedMinutes / 60),
      },
    });
    await loadTasks();
  }

  const weeklyGoal = profile?.settings?.weeklyGoalHours ?? DEFAULT_SETTINGS.weeklyGoalHours;
  const currentPlan = PLAN_DETAILS[profile?.plan?.tier] || PLAN_DETAILS.free;

  return (
    <div className="space-y-8">
      <SectionHeading eyebrow="Dashboard" title="Your study command center" description="See what matters today, what is drifting, and what your next best move should be." action={<Button size="lg" onClick={openNewTaskModal}>Add task</Button>} />
      {error ? <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Due today" value={dueToday.length} helper="Immediate focus items" accent="sky" />
        <StatCard label="Overdue" value={overdue.length} helper="Needs recovery plan" accent="rose" />
        <StatCard label="Upcoming" value={upcoming.length} helper="Next five deadlines" accent="amber" />
        <StatCard label="Completion rate" value={`${completionRate}%`} helper="Across all tasks" accent="emerald" />
        <StatCard label="Current streak" value={`${streak}d`} helper="Consecutive completion days" accent="violet" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="bg-slate-900/80">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-sky-300/80">Today's plan</p>
              <h2 className="mt-2 text-2xl font-bold text-white">A cleaner answer to what you should do next</h2>
            </div>
            <Badge className="bg-slate-950 text-slate-300 ring-white/10">{profile?.settings?.preferredStudyWindow || DEFAULT_SETTINGS.preferredStudyWindow}</Badge>
          </div>

          <div className="mt-6 grid gap-4">
            {todayPlan.length === 0 ? (
              <GuidedEmptyState hasPremium={hasPremium} onCreateTask={openNewTaskModal} />
            ) : (
              todayPlan.map((item) => (
                <div key={item.id} className="rounded-[24px] border border-white/10 bg-slate-950/60 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm uppercase tracking-[0.18em] text-sky-300/80">{item.orderLabel}</p>
                      <h3 className="mt-2 text-xl font-bold text-white">{item.title}</h3>
                      <p className="mt-2 text-sm text-slate-400">{item.slot} - {item.course} - Due {formatDateLabel(item.dueDate)}</p>
                    </div>
                    <Badge className={`ring-1 ${getPriorityTone(item.priority)}`}>{item.priority}</Badge>
                  </div>
                  <p className="mt-4 text-slate-300">{item.reason}</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Button onClick={() => openEditTaskModal(item)}>Open task</Button>
                    {!item.completed ? <Button variant="secondary" onClick={() => void handleToggleComplete(item)}>Quick complete</Button> : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <p className="text-sm uppercase tracking-[0.24em] text-sky-300/80">Weekly momentum</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Study progress and streak health</h2>
          <div className="mt-6 space-y-5">
            <ProgressBar label="Weekly study hours target" value={Math.round(weeklyCompletedMinutes / 60)} max={weeklyGoal} helper="Based on estimated minutes from completed tasks in the last 7 days." />
            <ProgressBar label="Current monthly AI credits" value={profile?.usage?.aiGenerationsUsed ?? 0} max={profile?.usage?.aiGenerationsLimit ?? currentPlan.monthlyAiLimit} helper={hasPremium ? `${currentPlan.name} credits reset monthly.` : "Upgrade to activate AI credits."} />
          </div>
          <div className="mt-8 grid grid-cols-7 gap-2">
            {weeklyTrend.map((item) => (
              <div key={item.key} className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-center">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                <p className="mt-3 text-2xl font-bold text-white">{item.completed}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="bg-slate-900/80">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-sky-300/80">Task command center</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Sort, filter, and finish work cleanly</h2>
            </div>
            <div className="grid w-full gap-3 lg:grid-cols-2 2xl:grid-cols-[minmax(260px,1.25fr)_repeat(3,minmax(170px,1fr))]">
              <div className="min-w-0 lg:col-span-2 2xl:col-span-1"><TextInput label="Search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks..." /></div>
              <div className="min-w-0"><Select label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All</option><option value="open">Open</option><option value="today">Due today</option><option value="overdue">Overdue</option><option value="completed">Completed</option></Select></div>
              <div className="min-w-0"><Select label="Priority" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}><option value="all">All</option><option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option></Select></div>
              <div className="min-w-0"><Select label="Sort by" value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option value="due">Due date</option><option value="priority">Priority</option><option value="recent">Recently updated</option><option value="title">Title</option></Select></div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? <p className="text-slate-400">Loading tasks...</p> : filteredTasks.length === 0 ? <GuidedEmptyState hasPremium={hasPremium} onCreateTask={openNewTaskModal} /> : filteredTasks.map((task) => <TaskCard key={task.id} task={task} onEdit={openEditTaskModal} onDelete={handleDelete} onToggleComplete={handleToggleComplete} requireProof={requireProof} />)}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <p className="text-sm uppercase tracking-[0.24em] text-sky-300/80">Calendar-style view</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Next 7 days at a glance</h2>
            <div className="mt-6 grid gap-3">
              {agenda.map((entry) => (
                <div key={entry.key} className="flex items-center justify-between rounded-[22px] border border-white/10 bg-slate-950/60 px-4 py-4">
                  <div><p className="font-semibold text-white">{entry.label} - {entry.dayLabel}</p><p className="text-sm text-slate-400">{entry.count === 0 ? "No tasks due" : `${entry.count} task${entry.count > 1 ? "s" : ""} due`}</p></div>
                  <div className="text-right"><p className="text-2xl font-bold text-white">{entry.count}</p><p className="text-xs uppercase tracking-[0.18em] text-slate-500">{entry.priorities} high</p></div>
                </div>
              ))}
            </div>
          </Card>

          <Card className={isPower ? "bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40" : "bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950"}>
            <p className="text-sm uppercase tracking-[0.24em] text-sky-300/80">{isPower ? "Power AI layer" : hasPremium ? "Upgrade path" : "Premium planning layer"}</p>
            <h2 className="mt-2 text-2xl font-bold text-white">{isPower ? "You are on the highest AI tier." : hasPremium ? "Need heavier AI usage?" : "Turn workload into a study plan with AI."}</h2>
            <p className="mt-3 text-slate-300">{isPower ? "Power keeps the best-model study engine and the highest AI limit visible, so your heavier sessions do not hit the wall early." : hasPremium ? "Power is the next step if you want best-model routing, bigger quiz sessions, and higher monthly AI limits." : "Premium users can generate schedules, quizzes, flashcards, explainers, breakdowns, and image proof workflows from one workspace."}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <LinkButton to={hasPremium ? "/app/billing" : "/app/ai"} variant="primary">{hasPremium ? "Compare paid plans" : "Open AI tools"}</LinkButton>
              {!hasPremium ? <LinkButton to="/app/billing" variant="secondary">View premium</LinkButton> : null}
            </div>
          </Card>
        </div>
      </div>

      <Modal open={taskModalOpen} title={editingTask ? "Edit task" : "Create a new task"} description="Capture the task cleanly so the dashboard can sort, badge, and track it properly." onClose={() => setTaskModalOpen(false)}>
        <TaskForm form={taskForm} setForm={setTaskForm} onSubmit={handleTaskSubmit} onCancel={() => setTaskModalOpen(false)} busy={formBusy} editing={Boolean(editingTask)} proofImageName={proofImageFile?.name || ""} previewUrl={proofImagePreview} onProofImageChange={handleProofImageChange} isPremium={hasPremium} requireProof={requireProof} onApplyTemplate={applyTemplate} />
      </Modal>
    </div>
  );
}
