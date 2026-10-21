import { useEffect, useRef, useState } from "react";
import { updateProfile as updateFirebaseProfile } from "firebase/auth";
import { User, Mail, Calendar, Flame, Trophy, LogOut, CreditCard, Trash2, AlertTriangle } from "lucide-react";
import { auth } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext";
import { formatDateTime, isPremiumPlan } from "../lib/utils";
import { AlertBox, Badge, Button, LinkButton, SectionHeading, TextInput } from "../components/ui";

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

  // Delete flow — requires typing email + 3-second armed countdown
  const [deleteEmail, setDeleteEmail] = useState("");
  const [deleteCountdown, setDeleteCountdown] = useState(null); // null | 3 | 2 | 1 | 0
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const countdownRef = useRef(null);

  const tier = profile?.plan?.tier || "free";
  const tierName = hasPaidPlan
    ? `${tier[0]?.toUpperCase()}${tier.slice(1)}`
    : "Free";

  const tierBadgeStyle = {
    power:   "bg-amber-500/15 text-amber-200 ring-amber-400/25",
    premium: "bg-indigo-500/15 text-indigo-200 ring-indigo-400/25",
    free:    "bg-white/[0.06] text-slate-400 ring-white/10",
  }[tier] || "bg-white/[0.06] text-slate-400 ring-white/10";

  const emailMatches = deleteEmail.trim().toLowerCase() === (profile?.email || "").toLowerCase();

  // Start countdown when email matches; cancel if it no longer matches
  useEffect(() => {
    if (emailMatches && deleteCountdown === null) {
      setDeleteCountdown(3);
    }
    if (!emailMatches && deleteCountdown !== null) {
      clearInterval(countdownRef.current);
      setDeleteCountdown(null);
    }
  }, [emailMatches]);

  useEffect(() => {
    if (deleteCountdown === null || deleteCountdown === 0) return;
    countdownRef.current = setInterval(() => {
      setDeleteCountdown((c) => {
        if (c <= 1) { clearInterval(countdownRef.current); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(countdownRef.current);
  }, [deleteCountdown === null ? null : deleteCountdown > 0 ? "running" : "done"]);

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
    if (!emailMatches || deleteCountdown !== 0) return;
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
            <StatRow icon={Mail}       label="Email"             value={profile?.email || "—"} />
            <StatRow icon={CreditCard} label="Plan"              value={tierName} />
            <StatRow icon={Calendar}   label="Joined"            value={formatDateTime(profile?.createdAt)} />
            <StatRow icon={Flame}      label="Current streak"    value={`${profile?.stats?.currentStreak ?? 0} days`} />
            <StatRow icon={Trophy}     label="Perfect quiz runs" value={profile?.stats?.perfectQuizRuns ?? 0} />
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
                onChange={(e) => setDisplayName(e.target.value)}
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

          {/* Delete account — harder confirmation */}
          <div className="rounded-2xl bg-rose-500/[0.04] p-6 ring-1 ring-inset ring-rose-400/15">
            <div className="flex items-center gap-2 mb-4">
              <Trash2 className="h-4 w-4 text-rose-400" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-400/70">Danger zone</p>
            </div>

            <h3 className="text-base font-bold text-white">Delete account</h3>

            {/* Consequences list */}
            <div className="mt-3 space-y-1.5">
              {[
                "All your tasks and proof submissions will be deleted",
                "Your account data and profile will be permanently removed",
                "This action cannot be undone",
                hasPaidPlan ? "Cancel your Stripe subscription first to avoid future charges" : null,
              ]
                .filter(Boolean)
                .map((line) => (
                  <div key={line} className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400/60" />
                    <p className="text-xs text-slate-500">{line}</p>
                  </div>
                ))}
            </div>

            <div className="mt-5 space-y-3">
              <TextInput
                label={`Type your email address to confirm: ${profile?.email || ""}`}
                placeholder={profile?.email || "your@email.com"}
                value={deleteEmail}
                onChange={(e) => {
                  setDeleteEmail(e.target.value);
                  setDeleteError("");
                }}
              />

              {/* Countdown status */}
              {emailMatches && deleteCountdown !== null && deleteCountdown > 0 && (
                <p className="text-xs text-rose-400/70 text-center">
                  Delete button arms in {deleteCountdown}s…
                </p>
              )}
              {emailMatches && deleteCountdown === 0 && (
                <p className="text-xs text-rose-300/80 text-center font-medium">
                  Button is now armed. This cannot be undone.
                </p>
              )}

              {deleteError && <AlertBox variant="error">{deleteError}</AlertBox>}

              <Button
                variant="danger"
                onClick={handleDeleteAccount}
                disabled={deleting || !emailMatches || deleteCountdown !== 0}
                className="w-full justify-center"
              >
                <Trash2 className="h-4 w-4" />
                {deleting
                  ? "Deleting account…"
                  : deleteCountdown !== null && deleteCountdown > 0
                    ? `Delete account (${deleteCountdown})`
                    : "Delete my account permanently"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
