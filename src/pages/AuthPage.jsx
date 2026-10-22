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
import { APP_NAME, LEGAL_VERSION, MINIMUM_AGE } from "../lib/constants";
import { setPendingSignupConsent } from "../services/firestore";
import { AlertBox, Button, TextInput } from "../components/ui";
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

// Firebase's raw messages ("Firebase: Error (auth/...)") aren't meant for students.
const AUTH_ERRORS = {
  "auth/invalid-credential": "That email and password don't match. Check them and try again.",
  "auth/wrong-password": "That email and password don't match. Check them and try again.",
  "auth/user-not-found": "That email and password don't match. Check them and try again.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/missing-email": "Enter your email address.",
  "auth/email-already-in-use": "An account with this email already exists. Try logging in instead.",
  "auth/weak-password": "Choose a password with at least 6 characters.",
  "auth/missing-password": "Enter your password.",
  "auth/too-many-requests": "Too many attempts. Wait a few minutes and try again.",
  "auth/network-request-failed": "Can't reach StudySync. Check your internet connection.",
  "auth/user-disabled": "This account has been disabled. Contact support for help.",
};

function friendlyAuthError(error, fallback) {
  return AUTH_ERRORS[error?.code] || fallback;
}

const HERO_POINTS = [
  { icon: BarChart3,  text: "Command-center dashboard with daily task planning" },
  { icon: ShieldCheck,text: "Proof-backed accountability at completion time" },
  { icon: Sparkles,   text: "Premium AI tools for plans, quizzes, and flashcards" },
];

export default function AuthPage({ mode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshProfile } = useAuth();
  const [form, setForm] = useState({ displayName: "", email: "", password: "" });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [confirmedAge, setConfirmedAge] = useState(false);
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

    if (mode === "signup" && (!acceptedTerms || !confirmedAge)) {
      setError("Please confirm your age and accept the Terms and Privacy Policy to create an account.");
      setSubmitting(false);
      return;
    }

    try {
      if (mode === "signup") {
        setPendingSignupConsent({
          version: LEGAL_VERSION,
          acceptedTermsAndPrivacy: true,
          confirmedMinimumAge: MINIMUM_AGE,
          acceptedAt: new Date().toISOString(),
        });
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
      setError(friendlyAuthError(caughtError, "We could not complete that request."));
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
      setError(friendlyAuthError(caughtError, "We could not send a reset email."));
    } finally {
      setSendingReset(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1fr]" style={{ background: "#08081a" }}>
      {/* Left panel */}
      <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:p-12">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 20% 20%, rgba(99,102,241,0.14) 0%, transparent 55%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(167,139,250,0.1) 0%, transparent 55%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(rgba(148,163,184,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative z-10 flex flex-1 flex-col">
          <BrandLockup to="/" />

          <div className="mt-auto">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              <span className="text-xs font-semibold text-indigo-300">Built for students</span>
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
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/10">
                    <Icon className="h-4 w-4 text-indigo-400" />
                  </div>
                  <span className="text-sm text-slate-300">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            {["Free plan available", "No card to start", "Cancel anytime"].map((item) => (
              <div key={item} className="flex items-center gap-1.5 text-xs text-slate-500">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <main id="main-content" tabIndex={-1} className="flex min-h-screen items-center justify-center px-6 py-12 lg:px-14">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center lg:hidden">
            <BrandLockup to="/" />
          </div>

          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-400">
              {mode === "signup" ? "Start free" : "Secure login"}
            </p>
            <h2 className="mt-2 text-3xl font-bold text-white">{content.title}</h2>
            <p className="mt-2 text-slate-400">{content.subtitle}</p>
          </div>

          <div className="rounded-2xl bg-white/[0.03] p-8 ring-1 ring-inset ring-white/[0.06]">
            <form className="grid gap-4" onSubmit={handleSubmit}>
              {mode === "signup" && (
                <TextInput
                  label="Display name"
                  placeholder="Your name"
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

              {mode === "signup" && (
                <fieldset className="grid gap-3 pt-1">
                  <legend className="sr-only">Required agreements</legend>
                  <label className="flex items-start gap-3 text-sm leading-6 text-slate-300">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 shrink-0 accent-indigo-500"
                      checked={confirmedAge}
                      onChange={(event) => setConfirmedAge(event.target.checked)}
                      required
                    />
                    <span>
                      I am {MINIMUM_AGE} or older. If I am under 18 (or the age of majority where I live), a parent or guardian has agreed to let me use {APP_NAME}.
                    </span>
                  </label>
                  <label className="flex items-start gap-3 text-sm leading-6 text-slate-300">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 shrink-0 accent-indigo-500"
                      checked={acceptedTerms}
                      onChange={(event) => setAcceptedTerms(event.target.checked)}
                      required
                    />
                    <span>
                      I agree to the{" "}
                      <Link to="/terms" target="_blank" className="font-semibold text-indigo-300 underline underline-offset-2">Terms of Service</Link>
                      {" "}and{" "}
                      <Link to="/privacy" target="_blank" className="font-semibold text-indigo-300 underline underline-offset-2">Privacy Policy</Link>.
                    </span>
                  </label>
                </fieldset>
              )}

              {error && <AlertBox variant="error">{error}</AlertBox>}
              {notice && <AlertBox variant="success">{notice}</AlertBox>}

              <Button variant="primary" size="lg" type="submit" disabled={submitting} className="mt-1 w-full justify-center">
                {submitting ? "Working..." : content.button}
              </Button>
            </form>

            {mode === "login" && (
              <button
                type="button"
                className="mt-4 text-sm font-semibold text-indigo-400 transition hover:text-indigo-300"
                onClick={handlePasswordReset}
                disabled={sendingReset}
              >
                {sendingReset ? "Sending..." : "Forgot password?"}
              </button>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            {content.alternate}{" "}
            <Link className="font-semibold text-indigo-400 transition hover:text-indigo-300" to={content.alternateLink}>
              {content.alternateLabel}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
