import { useState } from "react";
import { Link } from "react-router-dom";
import { Cookie } from "lucide-react";
import { LEGAL_VERSION } from "../lib/constants";
import { Button } from "./ui";

const STORAGE_KEY = "studysync:cookie-notice";

function readDismissed() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === LEGAL_VERSION;
  } catch {
    return false;
  }
}

/*
 * StudySync only uses strictly necessary storage, so this is a notice rather than a
 * consent prompt. If optional cookies (analytics etc.) are ever added, they must stay
 * off until the user opts in here, with "Reject" as prominent as "Accept".
 */
export function CookieNotice() {
  const [dismissed, setDismissed] = useState(readDismissed);

  if (dismissed) return null;

  function handleDismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, LEGAL_VERSION);
    } catch {
      // Storage blocked: the notice will simply show again next visit.
    }
    setDismissed(true);
  }

  return (
    <section
      aria-label="Cookie notice"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-2xl rounded-2xl border border-white/[0.1] bg-[#0f0f28] p-5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)] sm:inset-x-6 sm:bottom-6"
      style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Cookie className="hidden h-6 w-6 shrink-0 text-indigo-300 sm:block" aria-hidden="true" />
        <p className="flex-1 text-sm leading-6 text-slate-300">
          We only use essential browser storage to keep you signed in and remember your settings. No ads, analytics, or tracking.{" "}
          <Link to="/cookies" className="font-semibold text-indigo-300 underline underline-offset-2">
            Cookie Policy
          </Link>
        </p>
        <Button size="sm" onClick={handleDismiss} className="sm:self-center">
          Got it
        </Button>
      </div>
    </section>
  );
}
