import { useState } from "react";
import { updateProfile as updateFirebaseProfile } from "firebase/auth";
import { User, Mail, Calendar, Flame, Trophy, LogOut, CreditCard, Trash2 } from "lucide-react";
import { auth } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext";
import { formatDateTime, isPremiumPlan } from "../lib/utils";
import { AlertBox, Badge, Button, Card, LinkButton, SectionHeading, TextInput } from "../components/ui";

function StatRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-white/[0.05] last:border-0">
      <div className="flex items-center gap-2.5 text-sm text-slate-400">
        <Icon className="h-4 w-4 text-slate-600" />
        {label}
      </div>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

export default function AccountPage() {
  const { profile, refreshProfile, saveProfile, signOutUser, deleteAccount } = useAuth();
  const hasPaidPlan = isPremiumPlan(profile);
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const tier = profile?.plan?.tier || "free";
  const tierName = hasPaidPlan
    ? `${tier[0]?.toUpperCase()}${tier.slice(1)}`
    : "Free";

  const tierBadgeStyle = {
    power: "bg-amber-500/15 text-amber-200 ring-amber-400/25",
    premium: "bg-indigo-500/15 text-indigo-200 ring-indigo-400/25",
    free: "bg-white/[0.06] text-slate-400 ring-white/10",
  }[tier] || "bg-white/[0.06] text-slate-400 ring-white/10";

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      if (auth.currentUser) {
        await updateFirebaseProfile(auth.currentUser, { displayName: displayName.trim() });
      }
      await saveProfile({ displayName: displayName.trim() });
      await refreshProfile();
      setMessage("Profile updated.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await signOutUser();
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== "DELETE") {
      setDeleteError('Type DELETE (in capitals) to confirm.');
      return;
    }
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteAccount();
    } catch (error) {
      setDeleting(false);
      setDeleteError(error.message || "Could not delete your account. If your session is old, sign out and sign back in first.");
    }
  }

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Account"
        title="Profile, plan, and workspace"
        description="Your identity, subscription status, and account controls."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        {/* Profile overview */}
        <div className="space-y-px">
          <div className="flex items-start gap-4 rounded-t-2xl bg-white/[0.025] px-6 pt-6 pb-5">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500/30 to-violet-400/20 text-xl font-bold text-indigo-200">
              {(profile?.displayName || profile?.email || "?")[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-white truncate">
                {profile?.displayName || "StudySync Student"}
              </h2>
              <p className="mt-1 text-sm text-slate-400 truncate">{profile?.email}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge className={tierBadgeStyle}>{tierName} plan</Badge>
                <Badge className={`text-[10px] ${profile?.plan?.status === "active" ? "bg-emerald-500/15 text-emerald-200 ring-emerald-400/25" : "bg-white/[0.06] text-slate-500 ring-white/10"}`}>
                  {profile?.plan?.status || "inactive"}
                </Badge>
                {profile?.plan?.cancelAtPeriodEnd && (
                  <Badge className="bg-amber-500/15 text-amber-200 ring-amber-400/25 text-[10px]">
                    Cancels at period end
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white/[0.02] px-6 py-2">
            <StatRow icon={Mail}     label="Email"          value={profile?.email || "—"} />
            <StatRow icon={CreditCard} label="Plan"          value={tierName} />
            <StatRow icon={Calendar} label="Joined"         value={formatDateTime(profile?.createdAt)} />
            <StatRow icon={Flame}    label="Current streak" value={`${profile?.stats?.currentStreak ?? 0} days`} />
            <StatRow icon={Trophy}   label="Perfect quiz runs" value={profile?.stats?.perfectQuizRuns ?? 0} />
          </div>

          <div className="rounded-b-2xl bg-white/[0.025] px-6 pt-4 pb-6">
            <div className="flex flex-wrap gap-2">
              {!hasPaidPlan && (
                <LinkButton to="/app/billing" variant="primary" size="sm">
                  Upgrade to Premium
                </LinkButton>
              )}
              <LinkButton to="/app/billing" variant={hasPaidPlan ? "secondary" : "ghost"} size="sm">
                Manage billing
              </LinkButton>
            </div>
          </div>
        </div>

        {/* Edit panel */}
        <div className="space-y-4">
          {/* Update profile */}
          <div className="rounded-2xl bg-white/[0.025] p-6">
            <div className="flex items-center gap-2 mb-5">
              <User className="h-4 w-4 text-indigo-400" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-400/70">Update profile</p>
            </div>
            <div className="space-y-4">
              <TextInput
                label="Display name"
                placeholder="Your name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
              />
              {message && <AlertBox variant="success">{message}</AlertBox>}
              <Button onClick={handleSave} disabled={saving} className="w-full justify-center">
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </div>

          {/* Sign out */}
          <div className="rounded-2xl bg-white/[0.025] p-6">
            <h3 className="text-base font-bold text-white">Sign out</h3>
            <p className="mt-1.5 text-sm text-slate-400">
              Your tasks and plan status will be waiting when you return.
            </p>
            <div className="mt-4">
              <Button variant="secondary" onClick={handleSignOut} className="w-full justify-center">
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </div>
          </div>

          {/* Delete account */}
          <div className="rounded-2xl bg-rose-500/[0.04] p-6 ring-1 ring-inset ring-rose-400/15">
            <div className="flex items-center gap-2 mb-3">
              <Trash2 className="h-4 w-4 text-rose-400" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-400/70">Danger zone</p>
            </div>
            <h3 className="text-base font-bold text-white">Delete account</h3>
            <p className="mt-1.5 text-sm text-slate-400">
              Permanently deletes your account, all tasks, and data. This cannot be undone.
              {hasPaidPlan && " Cancel your Stripe subscription first via the billing portal to avoid future charges."}
            </p>
            <div className="mt-4 space-y-3">
              <TextInput
                label='Type DELETE to confirm'
                placeholder="DELETE"
                value={deleteConfirm}
                onChange={(e) => { setDeleteConfirm(e.target.value); setDeleteError(""); }}
              />
              {deleteError && <AlertBox variant="error">{deleteError}</AlertBox>}
              <Button
                variant="danger"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="w-full justify-center"
              >
                <Trash2 className="h-4 w-4" />
                {deleting ? "Deleting account..." : "Delete my account permanently"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
