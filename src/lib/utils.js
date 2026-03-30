const priorityOrder = {
  High: 3,
  Medium: 2,
  Low: 1,
};

export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function toDateKey(date = new Date()) {
  const value = date instanceof Date ? date : new Date(date);
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(value) {
  if (!value) return null;
  return new Date(`${value}T12:00:00`);
}

export function formatDateLabel(value, options = { month: "short", day: "numeric" }) {
  const parsed = parseDateKey(value);
  if (!parsed) return "No date";
  return new Intl.DateTimeFormat("en-US", options).format(parsed);
}

export function formatDateTime(value) {
  if (!value) return "Not available";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Not available";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed);
}

export function getPriorityTone(priority) {
  if (priority === "High") return "bg-rose-500/15 text-rose-200 ring-rose-400/25";
  if (priority === "Medium") return "bg-amber-500/15 text-amber-200 ring-amber-400/25";
  return "bg-emerald-500/15 text-emerald-200 ring-emerald-400/25";
}

export function hasTaskProof(task) {
  return Boolean(task?.proofLink?.trim() || task?.imageProofUrl?.trim());
}

export function getTaskBadges(task, requireProof = true) {
  const today = toDateKey();
  const completed = Boolean(task.completed);
  const hasProof = hasTaskProof(task);
  const badges = [];

  if (completed) {
    badges.push({ label: "Completed", tone: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/25" });
  } else if (task.dueDate && task.dueDate < today) {
    badges.push({ label: "Overdue", tone: "bg-rose-500/15 text-rose-200 ring-rose-400/25" });
  }

  if (!completed) {
    badges.push({
      label: !requireProof || hasProof ? "Ready to Complete" : "Proof Needed",
      tone: !requireProof || hasProof
        ? "bg-sky-500/15 text-sky-200 ring-sky-400/25"
        : "bg-violet-500/15 text-violet-200 ring-violet-400/25",
    });
  }

  return badges;
}

export function sortTasks(tasks, sortBy) {
  const items = [...tasks];
  items.sort((left, right) => {
    if (sortBy === "priority") return priorityOrder[right.priority] - priorityOrder[left.priority];
    if (sortBy === "recent") return `${right.updatedAt ?? ""}`.localeCompare(`${left.updatedAt ?? ""}`);
    if (sortBy === "title") return left.title.localeCompare(right.title);
    return `${left.dueDate ?? ""}`.localeCompare(`${right.dueDate ?? ""}`);
  });
  return items;
}

export function buildAgenda(tasks, totalDays = 7) {
  const base = new Date();
  return Array.from({ length: totalDays }, (_, index) => {
    const current = new Date(base);
    current.setDate(base.getDate() + index);
    const key = toDateKey(current);
    const due = tasks.filter((task) => task.dueDate === key && !task.completed);
    return {
      key,
      label: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(current),
      dayLabel: formatDateLabel(key),
      count: due.length,
      priorities: due.filter((task) => task.priority === "High").length,
    };
  });
}

export function buildWeeklyTrend(tasks) {
  const base = new Date();
  return Array.from({ length: 7 }, (_, offset) => {
    const current = new Date(base);
    current.setDate(base.getDate() - (6 - offset));
    const key = toDateKey(current);
    const completed = tasks.filter((task) => task.completedAt?.slice(0, 10) === key).length;
    return {
      key,
      label: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(current),
      completed,
    };
  });
}

export function calculateStreak(tasks) {
  const completionDays = Array.from(
    new Set(
      tasks
        .filter((task) => task.completedAt)
        .map((task) => task.completedAt.slice(0, 10))
        .sort((left, right) => right.localeCompare(left)),
    ),
  );

  if (completionDays.length === 0) return 0;

  let streak = 0;
  let cursor = new Date();

  while (true) {
    const key = toDateKey(cursor);
    if (completionDays.includes(key)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }

    if (streak === 0) {
      cursor.setDate(cursor.getDate() - 1);
      const yesterdayKey = toDateKey(cursor);
      if (completionDays.includes(yesterdayKey)) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
        continue;
      }
    }

    break;
  }

  return streak;
}

export function getCompletionRate(tasks) {
  if (tasks.length === 0) return 0;
  return Math.round((tasks.filter((task) => task.completed).length / tasks.length) * 100);
}

export function getInitials(name = "") {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "SS";
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase() ?? "").join("");
}

export function isPremiumPlan(profile) {
  return ["premium", "power"].includes(profile?.plan?.tier) && ["active", "trialing"].includes(profile?.plan?.status);
}
