import { useState } from "react";
import { updateProfile as updateFirebaseProfile } from "firebase/auth";
import { User, Mail, Calendar, Flame, Trophy, LogOut, CreditCard } from "lucide-react";
import { auth } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext";
import { formatDateTime, isPremiumPlan } from "../lib/utils";
import { AlertBox, Badge, Button, Card, LinkButton, SectionHeading, TextInput } from "../components/ui";

function StatRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/6 last:border-0">
      <div className="flex items-center gap-2.5 text-sm text-slate-400">
        <Icon className="h-4 w-4 text-slate-600" />
        {label}
      </div>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

export default function AccountPage() {
  const { profile, refreshProfile, saveProfile, signOutUser } = useAuth();
  const hasPaidPlan = isPremiumPlan(profile);
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const tier = profile?.plan?.tier || "free";
  const tierName = hasPaidPlan
    ? `${tier[0]?.toUpperCase()}${tier.slice(1)}`
    : "Free";

  const tierBadgeStyle = {
    power: "bg-amber-500/15 text-amber-200 ring-amber-400/25",
    premium: "bg-sky-500/15 text-sky-200 ring-sky-400/25",
    free: "bg-white/8 text-slate-400 ring-white/10",
  }[tier] || "bg-white/8 text-slate-400 ring-white/10";

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

  return (
    <div className="space-y-7">
      <SectionHeading
        eyebrow="Account"
        title="Profile, plan, and workspace"
        description="Your identity, subscription status, and the clean sign-out flow back to the landing page."
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        {/* Profile overview */}
        <Card>
          <div className="flex items-start gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-sky-500/30 to-teal-400/20 text-xl font-bold text-sky-200">
              {(profile?.displayName || profile?.email || "?")[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-white truncate">
                {profile?.displayName || "StudySync Student"}
              </h2>
              <p className="mt-1 text-sm text-slate-400 truncate">{profile?.email}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge className={tierBadgeStyle}>{tierName} plan</Badge>
                <Badge className={`text-[10px] ${profile?.plan?.status === "active" ? "bg-emerald-500/15 text-emerald-200 ring-emerald-400/25" : "bg-white/8 text-slate-500 ring-white/10"}`}>
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

          <div className="mt-6">
            <StatRow icon={Mail} label="Email" value={profile?.email || "—"} />
            <StatRow icon={CreditCard} label="Plan" value={tierName} />
            <StatRow icon={Calendar} label="Joined" value={formatDateTime(profile?.createdAt)} />
            <StatRow icon={Flame} label="Current streak" value={`${profile?.stats?.currentStreak ?? 0} days`} />
            <StatRow icon={Trophy} label="Perfect quiz runs" value={profile?.stats?.perfectQuizRuns ?? 0} />
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {!hasPaidPlan && (
              <LinkButton to="/app/billing" variant="primary" size="sm">
                Upgrade to Premium
              </LinkButton>
            )}
            <LinkButton to="/app/billing" variant={hasPaidPlan ? "secondary" : "ghost"} size="sm">
              Manage billing
            </LinkButton>
          </div>
        </Card>

        {/* Edit panel */}
        <div className="space-y-5">
          <Card>
            <div className="flex items-center gap-2 mb-5">
              <User className="h-4 w-4 text-sky-400" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-400/70">Update profile</p>
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
          </Card>

          <Card>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">Danger zone</p>
            <h3 className="mt-2 text-base font-bold text-white">Sign out of StudySync</h3>
            <p className="mt-1.5 text-sm text-slate-400">
              You can sign back in at any time. Your tasks and plan status will be waiting.
            </p>
            <div className="mt-4">
              <Button variant="danger" onClick={handleSignOut} className="w-full justify-center">
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
