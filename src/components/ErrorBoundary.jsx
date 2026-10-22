import { Component } from "react";

const RELOAD_FLAG = "studysync:chunk-reload";

// After a deploy, an open tab may request page files that no longer exist.
function isStaleChunkError(error) {
  const message = `${error?.message || ""}`;
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module/i.test(message);
}

function readFlag() {
  try {
    return window.sessionStorage.getItem(RELOAD_FLAG) === "1";
  } catch {
    return true; // storage blocked: don't risk a reload loop
  }
}

function writeFlag() {
  try {
    window.sessionStorage.setItem(RELOAD_FLAG, "1");
  } catch {
    // ignore
  }
}

export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("StudySync crashed", error, info?.componentStack);
    // Reload once to pick up the new deploy; the flag prevents a loop if that doesn't help.
    if (isStaleChunkError(error) && !readFlag()) {
      writeFlag();
      window.location.reload();
    }
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="grid min-h-screen place-items-center px-6" style={{ background: "#08081a" }}>
        <div className="max-w-md text-center" role="alert">
          <h1 className="text-3xl font-bold text-white">Something went wrong</h1>
          <p className="mt-3 text-slate-400">
            StudySync hit an unexpected error. Your tasks are saved. Reloading usually fixes it.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="h-11 rounded-xl bg-indigo-500 px-6 font-semibold text-white transition hover:bg-indigo-400"
            >
              Reload page
            </button>
            <a href="/" className="inline-flex h-11 items-center rounded-xl px-6 font-semibold text-slate-300 ring-1 ring-inset ring-white/10 transition hover:text-white">
              Go home
            </a>
          </div>
        </div>
      </div>
    );
  }
}
