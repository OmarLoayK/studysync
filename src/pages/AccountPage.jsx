import { useState } from "react";
import { updateProfile as updateFirebaseProfile } from "firebase/auth";
import { auth } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext";
import { formatDateTime, isPremiumPlan } from "../lib/utils";
import { Badge, Button, Card, SectionHeading, TextInput } from "../components/ui";

export default function AccountPage() {
  const { profile, refreshProfile, saveProfile, signOutUser } = useAuth();
  const hasPaidPlan = isPremiumPlan(profile);
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      if (auth.currentUser) {
        await updateFirebaseProfile(auth.currentUser, { displayName: displayName.trim() });
      }

      await saveProfile({
        displayName: displayName.trim(),
      });
      await refreshProfile();
      setMessage("Profile updated.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await signOutUser();
  }

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Account"
        title="Identity, plan visibility, and workspace profile"
        description="This page keeps the user system grounded: profile info, subscription status, and the clean sign-out flow back to the landing page."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <p className="text-sm uppercase tracking-[0.24em] text-sky-300/80">Member profile</p>
          <h2 className="mt-2 text-3xl font-bold text-white">{profile?.displayName || "StudySync Student"}</h2>
          <div className="mt-5 grid gap-3 text-slate-300">
            <p>Email: {profile?.email}</p>
            <p>Plan: {hasPaidPlan ? profile?.plan?.tier?.[0]?.toUpperCase() + profile?.plan?.tier?.slice(1) : "Free"}</p>
            <p>Joined: {formatDateTime(profile?.createdAt)}</p>
            <p>Current streak: {profile?.stats?.currentStreak ?? 0} days</p>
            <p>Perfect quiz runs: {profile?.stats?.perfectQuizRuns ?? 0}</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Badge className="bg-slate-950 text-slate-300 ring-white/10">{profile?.plan?.status || "inactive"}</Badge>
            {profile?.plan?.cancelAtPeriodEnd ? (
              <Badge className="bg-amber-500/15 text-amber-200 ring-amber-400/25">Cancels at period end</Badge>
            ) : null}
          </div>
        </Card>

        <Card>
          <p className="text-sm uppercase tracking-[0.24em] text-sky-300/80">Update account</p>
          <h2 className="mt-2 text-3xl font-bold text-white">Keep your profile polished</h2>
          <div className="mt-6 grid gap-4">
            <TextInput label="Display name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
            {message ? <p className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{message}</p> : null}
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </Button>
              <Button variant="secondary" onClick={handleSignOut}>
                Sign out
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
