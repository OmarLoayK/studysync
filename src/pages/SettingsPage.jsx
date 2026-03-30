import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { DEFAULT_SETTINGS } from "../lib/constants";
import { Badge, Button, Card, SectionHeading, Select, TextArea, TextInput } from "../components/ui";

function getNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  return Notification.permission;
}

export default function SettingsPage() {
  const { profile, saveProfile } = useAuth();
  const startingSettings = useMemo(() => ({ ...DEFAULT_SETTINGS, ...profile?.settings }), [profile?.settings]);
  const [settings, setSettings] = useState(startingSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [notificationPermission, setNotificationPermission] = useState(getNotificationPermission());

  useEffect(() => {
    setSettings(startingSettings);
  }, [startingSettings]);

  async function handleEnableNotifications() {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setMessage("This browser does not support notifications.");
      return;
    }

    const result = await Notification.requestPermission();
    setNotificationPermission(result);

    if (result === "granted") {
      setSettings((current) => ({ ...current, browserReminders: true }));
      setMessage("Browser notifications enabled. Save settings to keep reminders on.");
      return;
    }

    setMessage("Notification permission was not granted.");
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      await saveProfile({
        settings: {
          ...settings,
          weeklyGoalHours: Number(settings.weeklyGoalHours),
          deadlineReminderDays: Number(settings.deadlineReminderDays),
        },
      });
      setMessage("Settings saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Settings"
        title="Tune how StudySync plans your week"
        description="These preferences shape the dashboard, planning defaults, proof rules, and browser reminders."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <p className="text-sm uppercase tracking-[0.24em] text-sky-300/80">Study defaults</p>
          <h2 className="mt-2 text-3xl font-bold text-white">Preferences that travel through the product</h2>

          <form className="mt-6 grid gap-4" onSubmit={handleSave}>
            <TextInput
              label="Weekly study goal (hours)"
              type="number"
              min="1"
              value={settings.weeklyGoalHours}
              onChange={(event) => setSettings((current) => ({ ...current, weeklyGoalHours: event.target.value }))}
            />
            <TextInput
              label="Preferred study window"
              placeholder="18:00-20:00"
              value={settings.preferredStudyWindow}
              onChange={(event) => setSettings((current) => ({ ...current, preferredStudyWindow: event.target.value }))}
              hint="Browser reminders check this window and nudge you once when the app is open."
            />
            <TextArea
              label="Available study hours"
              value={settings.availableStudyHours}
              onChange={(event) => setSettings((current) => ({ ...current, availableStudyHours: event.target.value }))}
            />
            <Select
              label="Reminder style"
              value={settings.reminderStyle}
              onChange={(event) => setSettings((current) => ({ ...current, reminderStyle: event.target.value }))}
            >
              <option value="focus-first">Focus first</option>
              <option value="deadline-first">Deadline first</option>
              <option value="balanced">Balanced</option>
            </Select>
            <Select
              label="Completion proof rule"
              value={settings.requireProofBeforeCompletion ? "required" : "optional"}
              onChange={(event) => setSettings((current) => ({ ...current, requireProofBeforeCompletion: event.target.value === "required" }))}
            >
              <option value="required">Require proof before completion</option>
              <option value="optional">Allow completion without proof</option>
            </Select>
            <Select
              label="Browser reminders"
              value={settings.browserReminders ? "enabled" : "disabled"}
              onChange={(event) => setSettings((current) => ({ ...current, browserReminders: event.target.value === "enabled" }))}
            >
              <option value="disabled">Disabled</option>
              <option value="enabled">Enabled</option>
            </Select>
            <TextInput
              label="Deadline reminder lead time (days)"
              type="number"
              min="1"
              max="7"
              value={settings.deadlineReminderDays}
              onChange={(event) => setSettings((current) => ({ ...current, deadlineReminderDays: event.target.value }))}
            />

            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-slate-950 text-slate-300 ring-white/10">Notification permission: {notificationPermission}</Badge>
              <Button type="button" variant="secondary" onClick={() => void handleEnableNotifications()}>
                Enable notifications
              </Button>
            </div>

            {message ? <p className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{message}</p> : null}

            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save settings"}
            </Button>
          </form>
        </Card>

        <div className="space-y-6">
          <Card>
            <p className="text-sm uppercase tracking-[0.24em] text-sky-300/80">Proof workflow</p>
            <h2 className="mt-2 text-3xl font-bold text-white">Completion remains accountable</h2>
            <p className="mt-3 text-slate-400">
              Proof is now collected when the task is finished. Free users verify a Google Doc, while paid plans can upload image proof directly.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Badge className="bg-violet-500/15 text-violet-200 ring-violet-400/25">
                {settings.requireProofBeforeCompletion ? "Proof required before completion" : "Proof optional"}
              </Badge>
              <Badge className="bg-slate-950 text-slate-300 ring-white/10">Image-proof architecture live</Badge>
            </div>
          </Card>

          <Card>
            <p className="text-sm uppercase tracking-[0.24em] text-sky-300/80">Reminder system</p>
            <h2 className="mt-2 text-3xl font-bold text-white">Preferred-hour nudges are now built in</h2>
            <p className="mt-3 text-slate-400">
              StudySync can now send browser notifications during your preferred study window and ahead of due dates while the app is open in a browser tab.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Badge className={settings.browserReminders ? "bg-emerald-500/15 text-emerald-200 ring-emerald-400/25" : "bg-slate-950 text-slate-300 ring-white/10"}>
                {settings.browserReminders ? "Reminders on" : "Reminders off"}
              </Badge>
              <Badge className="bg-sky-500/15 text-sky-200 ring-sky-400/25">Due-date lead time configurable</Badge>
            </div>
          </Card>

          <Card>
            <p className="text-sm uppercase tracking-[0.24em] text-sky-300/80">Theme</p>
            <h2 className="mt-2 text-3xl font-bold text-white">Dark theme is the default product language</h2>
            <p className="mt-3 text-slate-400">
              The product is intentionally tuned around a dark, focused workspace so the entire app feels coherent instead of mixing modes.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
