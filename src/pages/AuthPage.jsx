import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile as updateFirebaseProfile,
} from "firebase/auth";
import { BarChart3, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { auth } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext";
import { APP_NAME } from "../lib/constants";
import { AlertBox, Button, Card, TextInput } from "../components/ui";
import { BrandLockup } from "../components/brand";

const copy = {
  login: {
    title: "Welcome back",
    subtitle: "Log in to your study workspace.",
    button: "Log in",
    alternate: "Need an account?",
    alternateLink: "/signup",
    alternateLabel: "Create one free",
  },
  signup: {
    title: "Create your account",
    subtitle: "Start free, upgrade to AI when you need it.",
    button: "Create account",
    alternate: "Already have an account?",
    alternateLink: "/login",
    alternateLabel: "Log in",
  },
};

const HERO_POINTS = [
  { icon: BarChart3, text: "Command-center dashboard with daily task planning" },
  { icon: ShieldCheck, text: "Proof-backed accountability at completion time" },
  { icon: Sparkles, text: "Premium AI tools for plans, quizzes, and flashcards" },
];

export default function AuthPage({ mode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshProfile } = useAuth();
  const [form, setForm] = useState({ displayName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  const from = useMemo(() => location.state?.from || "/app", [location.state]);
  const content = copy[mode];

  function setField(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      if (mode === "signup") {
        const credential = await createUserWithEmailAndPassword(auth, form.email, form.password);
        if (form.displayName.trim()) {
          await updateFirebaseProfile(credential.user, { displayName: form.displayName.trim() });
        }
      } else {
        await signInWithEmailAndPassword(auth, form.email, form.password);
      }

      await refreshProfile();
      navigate(from, { replace: true });
    } catch (caughtError) {
      setError(caughtError.message || "We could not complete that request.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePasswordReset() {
    if (!form.email.trim()) {
      setError("Enter your email first, then request a password reset.");
      return;
    }

    setSendingReset(true);
    setError("");
    setNotice("");

    try {
      await sendPasswordResetEmail(auth, form.email.trim());
      setNotice("Password reset email sent. Check your inbox and spam folder.");
    } catch (caughtError) {
      setError(caughtError.message || "We could not send a reset email.");
    } finally {
      setSendingReset(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1fr]" style={{ background: "#07071c" }}>
      {/* Left panel — only on desktop */}
      <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:p-12">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 20% 20%, rgba(56,189,248,0.14) 0%, transparent 55%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(20,184,166,0.1) 0%, transparent 55%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(rgba(148,163,184,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative z-10 flex flex-1 flex-col">
          <BrandLockup to="/" />

          <div className="mt-auto">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-4 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              <span className="text-xs font-semibold text-sky-300">Student-first SaaS</span>
            </div>

            <h1 className="text-5xl font-bold leading-tight tracking-tight text-white">
              {APP_NAME} keeps your studying calm, visible, and accountable.
            </h1>

            <p className="mt-5 text-lg leading-8 text-slate-400">
              Free users get a polished dashboard and serious task management. Premium adds AI tools, deeper planning, and billing-backed upgrades.
            </p>

            <ul className="mt-10 space-y-4">
              {HERO_POINTS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-sky-400/20 bg-sky-500/10">
                    <Icon className="h-4 w-4 text-sky-400" />
                  </div>
                  <span className="text-sm text-slate-300">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom trust strip */}
          <div className="mt-10 flex flex-wrap gap-4">
            {["Free forever core", "No card to start", "Cancel anytime"].map((item) => (
              <div key={item} className="flex items-center gap-1.5 text-xs text-slate-500">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500/70" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex min-h-screen items-center justify-center px-6 py-12 lg:px-14">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="mb-8 flex justify-center lg:hidden">
            <BrandLockup to="/" />
          </div>

          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-400/70">
              {mode === "signup" ? "Start free" : "Secure login"}
            </p>
            <h2 className="mt-2 text-3xl font-bold text-white">{content.title}</h2>
            <p className="mt-2 text-slate-400">{content.subtitle}</p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-8">
            <form className="grid gap-4" onSubmit={handleSubmit}>
              {mode === "signup" && (
                <TextInput
                  label="Display name"
                  placeholder="Omar Khalaf"
                  autoComplete="name"
                  value={form.displayName}
                  onChange={setField("displayName")}
                />
              )}
              <TextInput
                label="Email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={form.email}
                onChange={setField("email")}
                required
              />
              <TextInput
                label="Password"
                type="password"
                placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={form.password}
                onChange={setField("password")}
                required
              />

              {error && <AlertBox variant="error">{error}</AlertBox>}
              {notice && <AlertBox variant="success">{notice}</AlertBox>}

              <Button variant="primary" size="lg" type="submit" disabled={submitting} className="mt-1 w-full justify-center">
                {submitting ? "Working..." : content.button}
              </Button>
            </form>

            {mode === "login" && (
              <button
                type="button"
                className="mt-4 text-sm font-semibold text-sky-400 transition hover:text-sky-300"
                onClick={handlePasswordReset}
                disabled={sendingReset}
              >
                {sendingReset ? "Sending..." : "Forgot password?"}
              </button>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            {content.alternate}{" "}
            <Link className="font-semibold text-sky-400 transition hover:text-sky-300" to={content.alternateLink}>
              {content.alternateLabel}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
