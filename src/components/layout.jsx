import { useState } from "react";
import { Outlet, Navigate, NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Sparkles,
  CreditCard,
  User,
  Settings2,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Zap,
} from "lucide-react";
import { APP_NAME, APP_NAV_ITEMS, PLAN_DETAILS } from "../lib/constants";
import { cn, getInitials, isPremiumPlan } from "../lib/utils";
import { useAuth } from "../contexts/AuthContext";
import { useStudyReminders } from "../hooks/useStudyReminders";
import { Badge, Button, LinkButton } from "./ui";
import { BrandLockup, BrandMark } from "./brand";

const NAV_ICONS = {
  LayoutDashboard,
  Sparkles,
  CreditCard,
  User,
  Settings2,
};

export function LoadingScreen({ label }) {
  return (
    <div className="grid min-h-screen place-items-center px-6" style={{ background: "#111113" }}>
      <div className="text-center">
        <div className="mx-auto w-fit animate-[pulse_2.4s_ease-in-out_infinite]">
          <BrandMark size="lg" />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.26em] text-sky-400/60">{APP_NAME}</p>
        <p className="mt-3 text-sm text-zinc-500">{label}</p>
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
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#111113]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <BrandLockup to="/" compact subtitle="Study operating system" />

        <nav className="hidden items-center gap-1 md:flex">
          {[
            { to: "/pricing",   label: "Pricing" },
            { to: "/#features", label: "Features" },
            { to: "/#premium",  label: "Premium AI" },
            { to: "/support",   label: "Support" },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 transition-colors duration-150 hover:bg-white/[0.05] hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <LinkButton to="/app" variant="primary" size="sm">
              Open workspace
            </LinkButton>
          ) : (
            <>
              <LinkButton to="/login" variant="ghost" size="sm" className="hidden md:inline-flex">
                Log in
              </LinkButton>
              <LinkButton to="/signup" variant="primary" size="sm">
                Start free
              </LinkButton>
            </>
          )}
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/[0.05] hover:text-white md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/[0.06] bg-[#111113]/95 px-6 py-4 md:hidden">
          <nav className="grid gap-1">
            {[
              { to: "/pricing",   label: "Pricing" },
              { to: "/#features", label: "Features" },
              { to: "/#premium",  label: "Premium AI" },
              { to: "/support",   label: "Support" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center rounded-xl px-4 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.05] hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            {!user && (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center rounded-xl px-4 py-3 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.05] hover:text-white"
              >
                Log in
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-white/[0.06]" style={{ background: "#111113" }}>
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <BrandLockup to="/" compact />
            <p className="mt-4 text-sm leading-6 text-zinc-500">
              {APP_NAME} helps students plan better, study with consistency, and upgrade into AI-assisted momentum.
            </p>
            <p className="mt-3 text-xs text-zinc-600">omarkhalafbusiness@gmail.com</p>
          </div>
          <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm sm:grid-cols-3">
            <div className="col-span-2 mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-600 sm:col-span-3">
              Product
            </div>
            {[
              { to: "/pricing",   label: "Pricing" },
              { to: "/#features", label: "Features" },
              { to: "/#premium",  label: "Premium AI" },
              { to: "/support",   label: "Support" },
              { to: "/terms",     label: "Terms" },
              { to: "/privacy",   label: "Privacy" },
            ].map((item) => (
              <Link key={item.to} to={item.to} className="text-zinc-500 transition hover:text-zinc-200">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-10 border-t border-white/[0.05] pt-6 text-xs text-zinc-600">
          © {new Date().getFullYear()} {APP_NAME}. Built for serious students.
        </div>
      </div>
    </footer>
  );
}

function SidebarNavItem({ item }) {
  const Icon = NAV_ICONS[item.icon] || LayoutDashboard;

  return (
    <NavLink
      to={item.to}
      end={item.to === "/app"}
      className={({ isActive }) =>
        cn(
          "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
          isActive
            ? "bg-white/[0.08] text-white"
            : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200",
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={cn(
              "h-4 w-4 shrink-0 transition-colors duration-150",
              isActive ? "text-sky-400" : "text-zinc-600 group-hover:text-zinc-400",
            )}
          />
          <span>{item.label}</span>
        </>
      )}
    </NavLink>
  );
}

export function AppShell() {
  const { user, profile, signOutUser } = useAuth();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  useStudyReminders({ user, profile });

  async function handleSignOut() {
    await signOutUser();
    navigate("/");
  }

  const hasPaidPlan = isPremiumPlan(profile);
  const plan = hasPaidPlan
    ? PLAN_DETAILS[profile?.plan?.tier] || PLAN_DETAILS.premium
    : PLAN_DETAILS.free;

  const userInitials = getInitials(profile?.displayName || profile?.email);
  const displayName = profile?.displayName || "Student";
  const tier = profile?.plan?.tier || "free";

  const tierStyles = {
    power:   "bg-amber-500/15 text-amber-200 ring-amber-400/25",
    premium: "bg-sky-500/15 text-sky-200 ring-sky-400/25",
    free:    "bg-white/8 text-zinc-400 ring-white/10",
  };

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between p-5">
        <BrandLockup to="/app" subtitle="For focused students" />
        <button
          type="button"
          className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-200"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="mt-2 px-3">
        <div className="space-y-0.5">
          {APP_NAV_ITEMS.map((item) => (
            <SidebarNavItem key={item.to} item={item} />
          ))}
        </div>
      </nav>

      <div className="mt-4 px-3">
        <div className="rounded-2xl bg-gradient-to-br from-violet-500/10 via-white/[0.02] to-sky-400/8 p-4 ring-1 ring-white/[0.06]">
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-violet-400" />
            <Badge className={cn("text-[10px]", tierStyles[tier])}>{plan.badge}</Badge>
          </div>
          <h3 className="mt-3 text-sm font-semibold leading-snug text-white">
            {hasPaidPlan ? `${plan.name} AI is active` : "Upgrade for AI-powered studying"}
          </h3>
          <p className="mt-1.5 text-xs leading-5 text-zinc-400">
            {hasPaidPlan
              ? `${plan.monthlyAiLimit} monthly AI credits for plans, quizzes, and more.`
              : "Plans start at $5/month for everyday AI tools."}
          </p>
          <div className="mt-3">
            <LinkButton to="/app/billing" variant="secondary" size="sm" className="w-full text-xs">
              {hasPaidPlan ? "Manage plan" : "View plans"}
              <ChevronRight className="h-3 w-3 opacity-60" />
            </LinkButton>
          </div>
        </div>
      </div>

      <div className="mt-auto p-3">
        <div className="rounded-2xl bg-white/[0.04] p-3.5 ring-1 ring-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-sky-500/30 to-violet-400/20 text-sm font-bold text-sky-200">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{displayName}</p>
              <p className="truncate text-xs text-zinc-500">{profile?.email}</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <LinkButton to="/app/account" variant="ghost" size="sm" className="flex-1 text-xs">
              Profile
            </LinkButton>
            <Button variant="ghost" size="sm" className="flex-1 text-xs" onClick={handleSignOut}>
              <LogOut className="h-3 w-3" />
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen text-zinc-100" style={{ background: "#111113" }}>
      <div className="mx-auto flex min-h-screen max-w-[1680px]">
        {/* Desktop sidebar */}
        <aside className="hidden w-[268px] shrink-0 flex-col border-r border-white/[0.06] lg:flex" style={{ background: "rgba(17,17,19,0.92)" }}>
          <div className="sticky top-0 flex h-screen flex-col">
            <SidebarContent />
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <aside className="absolute inset-y-0 left-0 flex w-[280px] flex-col border-r border-white/[0.07] shadow-2xl" style={{ background: "#111113" }}>
              <SidebarContent />
            </aside>
          </div>
        )}

        {/* Main content */}
        <div className="flex min-h-screen flex-1 flex-col overflow-hidden">
          {/* Top bar */}
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/[0.06] bg-[#111113]/90 px-5 py-3.5 backdrop-blur-xl lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/[0.05] hover:text-white lg:hidden"
                onClick={() => setMobileSidebarOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="hidden lg:block">
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-600">Workspace</p>
                <p className="text-sm font-semibold text-white">{displayName}</p>
              </div>
              <div className="lg:hidden">
                <BrandMark size="sm" />
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Badge className={cn("text-xs", tierStyles[tier])}>
                {tier === "free" ? "Free" : plan.name}
              </Badge>
              <div className="hidden h-7 w-7 lg:grid place-items-center rounded-lg bg-gradient-to-br from-sky-500/30 to-violet-400/20 text-xs font-bold text-sky-200">
                {userInitials}
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 px-5 py-7 lg:px-8 lg:py-9">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
