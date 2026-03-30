import { useEffect } from "react";
import { listTasks } from "../services/firestore";
import { toDateKey } from "../lib/utils";

const CHECK_INTERVAL_MS = 5 * 60 * 1000;

function supportsBrowserNotifications() {
  return typeof window !== "undefined" && "Notification" in window;
}

function parseWindow(windowValue = "") {
  const [start = "18:00", end = "20:00"] = windowValue.split("-");
  const [startHour = 18, startMinute = 0] = start.split(":").map(Number);
  const [endHour = 20, endMinute = 0] = end.split(":").map(Number);

  return {
    startMinutes: startHour * 60 + startMinute,
    endMinutes: endHour * 60 + endMinute,
  };
}

function isWithinPreferredWindow(windowValue, now = new Date()) {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const { startMinutes, endMinutes } = parseWindow(windowValue);
  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}

function reminderKey(uid, scope, dateKey) {
  return `studysync:reminder:${uid}:${scope}:${dateKey}`;
}

function hasSentReminder(uid, scope, dateKey) {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(reminderKey(uid, scope, dateKey)) === "sent";
}

function markReminderSent(uid, scope, dateKey) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(reminderKey(uid, scope, dateKey), "sent");
}

function sendReminder(uid, scope, dateKey, title, body) {
  if (!supportsBrowserNotifications() || Notification.permission !== "granted") return;
  if (hasSentReminder(uid, scope, dateKey)) return;

  const notification = new Notification(title, {
    body,
    tag: `studysync-${scope}-${dateKey}`,
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };

  markReminderSent(uid, scope, dateKey);
}

function getFocusReminderMessage(style, tasks) {
  const overdueCount = tasks.filter((task) => task.dueDate < toDateKey()).length;
  const nextTask = [...tasks]
    .sort((left, right) => `${left.dueDate ?? ""}`.localeCompare(`${right.dueDate ?? ""}`))[0];

  if (style === "deadline-first" && overdueCount > 0) {
    return `You have ${overdueCount} overdue task${overdueCount > 1 ? "s" : ""}. Open StudySync and clean up the backlog.`;
  }

  if (style === "balanced" && nextTask) {
    return `${tasks.length} open task${tasks.length > 1 ? "s" : ""} waiting. Start with ${nextTask.title} next.`;
  }

  return nextTask
    ? `Your study window is open. Start with ${nextTask.title} and keep the streak alive.`
    : "Your study window is open. A short review session now keeps tomorrow calmer.";
}

export function useStudyReminders({ user, profile }) {
  useEffect(() => {
    if (!user?.uid) return undefined;
    if (!profile?.settings?.browserReminders) return undefined;
    if (!supportsBrowserNotifications() || Notification.permission !== "granted") return undefined;

    let cancelled = false;
    let running = false;

    async function checkReminders() {
      if (running) return;
      running = true;

      try {
        const tasks = await listTasks(user.uid);
        if (cancelled) return;

        const openTasks = tasks.filter((task) => !task.completed);
        if (openTasks.length === 0) return;

        const now = new Date();
        const todayKey = toDateKey(now);
        const leadDays = Number(profile?.settings?.deadlineReminderDays || 1);
        const reminderTarget = new Date(now);
        reminderTarget.setDate(reminderTarget.getDate() + leadDays);
        const targetDateKey = toDateKey(reminderTarget);
        const dueSoon = openTasks.filter((task) => task.dueDate === targetDateKey);

        if (dueSoon.length > 0) {
          sendReminder(
            user.uid,
            `deadline-${leadDays}`,
            targetDateKey,
            leadDays === 1 ? "Assignment due tomorrow" : "Upcoming due date",
            `${dueSoon.length} task${dueSoon.length > 1 ? "s are" : " is"} due ${leadDays === 1 ? "tomorrow" : `in ${leadDays} days`}.`,
          );
        }

        if (isWithinPreferredWindow(profile?.settings?.preferredStudyWindow, now)) {
          sendReminder(
            user.uid,
            "study-window",
            todayKey,
            "StudySync focus hour",
            getFocusReminderMessage(profile?.settings?.reminderStyle, openTasks),
          );
        }
      } finally {
        running = false;
      }
    }

    void checkReminders();
    const intervalId = window.setInterval(() => {
      void checkReminders();
    }, CHECK_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [
    profile?.settings?.browserReminders,
    profile?.settings?.deadlineReminderDays,
    profile?.settings?.preferredStudyWindow,
    profile?.settings?.reminderStyle,
    user?.uid,
  ]);
}
