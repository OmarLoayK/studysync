import { Outlet, Navigate, NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { APP_NAME, APP_NAV_ITEMS, PLAN_DETAILS } from "../lib/constants";
import { cn, getInitials, isPremiumPlan } from "../lib/utils";
import { useAuth } from "../contexts/AuthContext";
import { useStudyReminders } from "../hooks/useStudyReminders";
import { Badge, Button, LinkButton } from "./ui";

export function LoadingScreen({ label }) {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-950 px-6">
      <div className="text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl border border-sky-400/20 bg-sky-500/10 p-3 text-sky-200 shadow-lg shadow-sky-950/40">
          <div className="h-full w-full animate-pulse rounded-xl bg-gradient-to-br from-sky-400 to-teal-300" />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.24em] text-sky-300/80">{APP_NAME}</p>
        <p className="mt-3 text-slate-400">{label}</p>
      </div>
    </div>
  );
}

export function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen label="Checking your session..." />;
  if (user) return <Navigate to="/app" replace />;
  return children;
}

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen label="Preparing your workspace..." />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

export function PublicHeader() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 to-teal-300 text-slate-950">
            <span className="font-black">S</span>
          </div>
          <div>
            <p className="font-bold text-white">{APP_NAME}</p>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Study operating system</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          <Link to="/pricing" className="transition hover:text-white">
            Pricing
          </Link>
          <Link to="/support" className="transition hover:text-white">
            Support
          </Link>
          <a href="#features" className="transition hover:text-white">
            Features
          </a>
          <a href="#premium" className="transition hover:text-white">
            Premium AI
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <LinkButton to="/app" variant="primary" size="sm">
              Open dashboard
            </LinkButton>
          ) : (
            <>
              <LinkButton to="/login" variant="ghost" size="sm">
                Log in
              </LinkButton>
              <LinkButton to="/signup" variant="primary" size="sm">
                Start free
              </LinkButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/80">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <p>{APP_NAME} helps students plan better, study with consistency, and upgrade into AI-assisted momentum.</p>
          <p className="mt-2 text-xs text-slate-600">Support: omarkhalafbusiness@gmail.com</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link to="/pricing" className="transition hover:text-slate-200">
            Pricing
          </Link>
          <Link to="/terms" className="transition hover:text-slate-200">
            Terms
          </Link>
          <Link to="/privacy" className="transition hover:text-slate-200">
            Privacy
          </Link>
          <Link to="/support" className="transition hover:text-slate-200">
            Support
          </Link>
          <Link to="/login" className="transition hover:text-slate-200">
            Login
          </Link>
        </div>
      </div>
    </footer>
  );
}

export function AppShell() {
  const { user, profile, signOutUser } = useAuth();
  const navigate = useNavigate();
  useStudyReminders({ user, profile });

  async function handleSignOut() {
    await signOutUser();
    navigate("/");
  }

  const hasPaidPlan = isPremiumPlan(profile);
  const plan = hasPaidPlan ? (PLAN_DETAILS[profile?.plan?.tier] || PLAN_DETAILS.premium) : PLAN_DETAILS.free;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-[290px] shrink-0 border-r border-white/10 bg-slate-950/80 p-6 lg:flex lg:flex-col">
          <Link to="/app" className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 to-teal-300 text-slate-950 shadow-lg shadow-sky-950/40">
              <span className="font-black">S</span>
            </div>
            <div>
              <p className="font-bold text-white">{APP_NAME}</p>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Built for focused students</p>
            </div>
          </Link>

          <nav className="mt-10 grid gap-2">
            {APP_NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/app"}
                className={({ isActive }) =>
                  cn(
                    "rounded-2xl px-4 py-3 text-sm font-semibold transition",
                    isActive
                      ? "bg-sky-500/10 text-sky-200 ring-1 ring-inset ring-sky-400/25"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-100",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-10 rounded-[28px] border border-sky-400/15 bg-gradient-to-br from-sky-500/12 via-slate-900 to-teal-400/10 p-5">
            <Badge className="bg-slate-900/70 text-sky-200 ring-sky-400/20">{plan.badge}</Badge>
            <h3 className="mt-4 text-xl font-bold text-white">
              {hasPaidPlan ? `${plan.name} AI is unlocked` : "Upgrade when you want more leverage"}
            </h3>
            <p className="mt-3 text-sm text-slate-400">
              {hasPaidPlan
                ? `Use your monthly AI credits for planning, quizzes, flashcards, and explainers with the ${plan.name} tier.`
                : "Move into AI planning, better analytics, and premium workflows for $5/month."}
            </p>
            <div className="mt-5">
              <LinkButton to="/app/billing" variant="secondary" size="sm">
                {hasPaidPlan ? "Manage plan" : "View plans"}
              </LinkButton>
            </div>
          </div>

          <div className="mt-auto rounded-[28px] border border-white/10 bg-slate-900/80 p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-800 text-sm font-bold text-white">
                {getInitials(profile?.displayName || profile?.email)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white">{profile?.displayName || "StudySync Student"}</p>
                <p className="break-all text-xs leading-5 text-slate-400">{profile?.email}</p>
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <LinkButton to="/app/account" variant="ghost" size="sm" className="flex-1">
                Profile
              </LinkButton>
              <Button variant="secondary" size="sm" className="flex-1" onClick={handleSignOut}>
                Sign out
              </Button>
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="border-b border-white/10 bg-slate-950/80 px-6 py-4 backdrop-blur-xl lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Workspace</p>
                <p className="text-lg font-semibold text-white">
                  {profile?.displayName || "Student"} - {plan.name}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Badge className="bg-slate-900/80 text-sky-200 ring-sky-400/20">
                  {hasPaidPlan ? plan.name : "Free"}
                </Badge>
              </div>
            </div>
          </header>
          <main className="flex-1 px-6 py-8 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
