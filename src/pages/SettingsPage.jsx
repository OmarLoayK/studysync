import { useEffect, useMemo, useState } from "react";
import { Settings2, Bell, ShieldCheck, Moon, Clock, Target } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { DEFAULT_SETTINGS } from "../lib/constants";
import { AlertBox, Badge, Button, Card, SectionHeading, Select, TextArea, TextInput } from "../components/ui";

function getNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
  return Notification.permission;
}

function SettingSection({ icon: Icon, label, children }) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-4 w-4 text-sky-400" />
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-400/70">{label}</p>
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { profile, saveProfile } = useAuth();
  const startingSettings = useMemo(() => ({ ...DEFAULT_SETTINGS, ...profile?.settings }), [profile?.settings]);
  const [settings, setSettings] = useState(startingSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [notificationPermission, setNotificationPermission] = useState(getNotificationPermission());

  useEffect(() => { setSettings(startingSettings); }, [startingSettings]);

  function setField(field) {
    return (event) => setSettings((current) => ({ ...current, [field]: event.target.value }));
  }

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
    <div className="space-y-7">
      <SectionHeading
        eyebrow="Settings"
        title="Tune how StudySync plans your week"
        description="These preferences shape the dashboard, planning defaults, proof rules, and browser reminders."
      />

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        {/* Main settings form */}
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <Settings2 className="h-4 w-4 text-sky-400" />
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-400/70">Study defaults</p>
          </div>

          <form className="space-y-6" onSubmit={handleSave}>
            <SettingSection icon={Target} label="Focus goal">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput
                  label="Weekly study goal (hours)"
                  type="number"
                  min="1"
                  value={settings.weeklyGoalHours}
                  onChange={setField("weeklyGoalHours")}
                />
                <TextInput
                  label="Deadline reminder lead time (days)"
                  type="number"
                  min="1"
                  max="7"
                  value={settings.deadlineReminderDays}
                  onChange={setField("deadlineReminderDays")}
                />
              </div>
            </SettingSection>

            <div className="h-px bg-white/6" />

            <SettingSection icon={Clock} label="Study window">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextInput
                  label="Preferred study window"
                  placeholder="18:00-20:00"
                  value={settings.preferredStudyWindow}
                  onChange={setField("preferredStudyWindow")}
                  hint="Browser reminders check this window and nudge you once when the app is open."
                />
                <Select
                  label="Reminder style"
                  value={settings.reminderStyle}
                  onChange={setField("reminderStyle")}
                >
                  <option value="focus-first">Focus first</option>
                  <option value="deadline-first">Deadline first</option>
                  <option value="balanced">Balanced</option>
                </Select>
              </div>
              <div className="mt-4">
                <TextArea
                  label="Available study hours"
                  value={settings.availableStudyHours}
                  onChange={setField("availableStudyHours")}
                  hint="Used by AI tools to schedule realistic study blocks. Format: Mon 2h, Tue 3h..."
                />
              </div>
            </SettingSection>

            <div className="h-px bg-white/6" />

            <SettingSection icon={ShieldCheck} label="Proof rules">
              <Select
                label="Completion proof rule"
                value={settings.requireProofBeforeCompletion ? "required" : "optional"}
                onChange={(event) => setSettings((current) => ({ ...current, requireProofBeforeCompletion: event.target.value === "required" }))}
              >
                <option value="required">Require proof before completion</option>
                <option value="optional">Allow completion without proof</option>
              </Select>
            </SettingSection>

            <div className="h-px bg-white/6" />

            <SettingSection icon={Bell} label="Notifications">
              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="Browser reminders"
                  value={settings.browserReminders ? "enabled" : "disabled"}
                  onChange={(event) => setSettings((current) => ({ ...current, browserReminders: event.target.value === "enabled" }))}
                >
                  <option value="disabled">Disabled</option>
                  <option value="enabled">Enabled</option>
                </Select>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-200">Permission status</label>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${notificationPermission === "granted" ? "bg-emerald-500/15 text-emerald-200 ring-emerald-400/25" : "bg-white/8 text-slate-400 ring-white/10"}`}>
                      {notificationPermission}
                    </Badge>
                    {notificationPermission !== "granted" && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => void handleEnableNotifications()}>
                        Enable
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </SettingSection>

            {message && <AlertBox variant={message.includes("not") || message.includes("does not") ? "warning" : "success"}>{message}</AlertBox>}

            <Button type="submit" disabled={saving} className="w-full justify-center">
              {saving ? "Saving..." : "Save settings"}
            </Button>
          </form>
        </Card>

        {/* Info cards */}
        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="h-4 w-4 text-violet-400" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-400/70">Proof workflow</p>
            </div>
            <h2 className="text-lg font-bold text-white">Completion stays accountable</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Proof is collected when the task is finished. Free users verify a Google Doc, while paid plans can upload image proof directly.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge className="bg-violet-500/15 text-violet-200 ring-violet-400/25 text-xs">
                {settings.requireProofBeforeCompletion ? "Proof required" : "Proof optional"}
              </Badge>
              <Badge className="bg-white/8 text-slate-500 ring-white/10 text-xs">
                Image-proof live for paid users
              </Badge>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Bell className="h-4 w-4 text-amber-400" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-400/70">Reminder system</p>
            </div>
            <h2 className="text-lg font-bold text-white">Nudges during your study window</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              StudySync can send browser notifications during your preferred study window and ahead of due dates while the app is open in a browser tab.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge className={`text-xs ${settings.browserReminders ? "bg-emerald-500/15 text-emerald-200 ring-emerald-400/25" : "bg-white/8 text-slate-500 ring-white/10"}`}>
                {settings.browserReminders ? "Reminders on" : "Reminders off"}
              </Badge>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Moon className="h-4 w-4 text-slate-400" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Theme</p>
            </div>
            <h2 className="text-lg font-bold text-white">Dark is the default product language</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              The product is intentionally tuned around a dark, focused workspace so the entire app feels coherent instead of mixing modes.
            </p>
            <Badge className="mt-4 bg-white/8 text-slate-500 ring-white/10 text-xs">Dark mode · Always on</Badge>
          </Card>
        </div>
      </div>
    </div>
  );
}
