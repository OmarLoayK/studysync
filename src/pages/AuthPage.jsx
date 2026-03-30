import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile as updateFirebaseProfile,
} from "firebase/auth";
import { auth } from "../firebase/config";
import { useAuth } from "../contexts/AuthContext";
import { APP_NAME } from "../lib/constants";
import { Badge, Button, Card, TextInput } from "../components/ui";

const copy = {
  login: {
    title: "Welcome back",
    subtitle: "Log in to your study operating system.",
    button: "Log in",
    alternate: "Need an account?",
    alternateLink: "/signup",
    alternateLabel: "Create one",
  },
  signup: {
    title: "Create your StudySync account",
    subtitle: "Start free, then unlock premium AI when you need it.",
    button: "Create account",
    alternate: "Already have an account?",
    alternateLink: "/login",
    alternateLabel: "Log in",
  },
};

export default function AuthPage({ mode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshProfile } = useAuth();
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const from = useMemo(() => location.state?.from || "/app", [location.state]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (mode === "signup") {
        const credential = await createUserWithEmailAndPassword(auth, form.email, form.password);
        if (form.displayName.trim()) {
          await updateFirebaseProfile(credential.user, {
            displayName: form.displayName.trim(),
          });
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

  const content = copy[mode];

  return (
    <div className="grid min-h-screen bg-slate-950 px-6 py-10 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-sky-500/15 via-slate-950 to-teal-400/10 p-10 lg:flex lg:flex-col">
        <Badge className="w-fit bg-slate-900/70 text-sky-200 ring-sky-400/20">Student-first SaaS</Badge>
        <h1 className="mt-6 text-5xl font-bold text-white">{APP_NAME} keeps your studying calm, visible, and accountable.</h1>
        <p className="mt-5 max-w-xl text-lg text-slate-300">
          Free users get a polished dashboard and serious task management. Premium adds AI tools, deeper planning, and billing-backed upgrades.
        </p>
      </div>

      <div className="grid place-items-center lg:px-10">
        <Card className="w-full max-w-xl bg-slate-900/80 p-8 md:p-10">
          <Badge className="bg-sky-500/12 text-sky-200 ring-sky-400/20">{mode === "signup" ? "Start free" : "Secure login"}</Badge>
          <h2 className="mt-6 text-4xl font-bold text-white">{content.title}</h2>
          <p className="mt-3 text-slate-400">{content.subtitle}</p>

          <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
            {mode === "signup" ? (
              <TextInput
                label="Display name"
                placeholder="Omar Khalaf"
                value={form.displayName}
                onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
              />
            ) : null}

            <TextInput
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              required
            />
            <TextInput
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              required
            />

            {error ? <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}

            <Button variant="primary" size="lg" type="submit" disabled={submitting}>
              {submitting ? "Working..." : content.button}
            </Button>
          </form>

          <p className="mt-6 text-sm text-slate-400">
            {content.alternate}{" "}
            <Link className="font-semibold text-sky-300 transition hover:text-sky-200" to={content.alternateLink}>
              {content.alternateLabel}
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
