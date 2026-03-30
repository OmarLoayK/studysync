import { useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { DEFAULT_SETTINGS } from "../lib/constants";
import { Badge, Button, Card, SectionHeading, Select, TextArea, TextInput } from "../components/ui";

export default function SettingsPage() {
  const { profile, saveProfile } = useAuth();
  const startingSettings = useMemo(() => ({ ...DEFAULT_SETTINGS, ...profile?.settings }), [profile?.settings]);
  const [settings, setSettings] = useState(startingSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      await saveProfile({
        settings: {
          ...settings,
          weeklyGoalHours: Number(settings.weeklyGoalHours),
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
        description="These preferences shape the dashboard, planning defaults, and premium AI outputs."
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
              StudySync keeps proof link and completion note architecture in place now, while leaving room for premium image proof uploads later.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Badge className="bg-violet-500/15 text-violet-200 ring-violet-400/25">
                {settings.requireProofBeforeCompletion ? "Proof required before completion" : "Proof optional"}
              </Badge>
              <Badge className="bg-slate-950 text-slate-300 ring-white/10">Image-proof ready architecture</Badge>
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
