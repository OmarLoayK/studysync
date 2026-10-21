import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { cn } from "../lib/utils";

/* ─── Buttons ─── */

const buttonVariants = {
  primary:
    "bg-indigo-500 text-white hover:bg-indigo-400 shadow-[0_0_0_1px_rgba(99,102,241,0.4),0_4px_20px_-4px_rgba(99,102,241,0.45)] hover:shadow-[0_0_0_1px_rgba(99,102,241,0.6),0_4px_28px_-4px_rgba(99,102,241,0.65)]",
  secondary:
    "bg-white/[0.06] text-slate-100 hover:bg-white/[0.1] ring-1 ring-inset ring-white/10 hover:ring-white/16",
  ghost:
    "bg-transparent text-slate-300 hover:bg-white/[0.06] hover:text-white",
  danger:
    "bg-rose-500/15 text-rose-200 hover:bg-rose-500/25 ring-1 ring-inset ring-rose-400/25 hover:ring-rose-400/40",
};

export function Button({
  as = "button",
  className,
  children,
  variant = "primary",
  size = "md",
  ...props
}) {
  const Component = as;
  const sizeClass =
    size === "sm"
      ? "h-9 px-4 text-sm gap-1.5"
      : size === "lg"
        ? "h-12 px-7 text-base gap-2.5"
        : "h-10 px-5 text-sm gap-2";

  return (
    <Component
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-50",
        sizeClass,
        buttonVariants[variant],
        className,
      )}
      {...(Component === "button" && !props.type ? { type: "button" } : {})}
      {...props}
    >
      {children}
    </Component>
  );
}

export function LinkButton(props) {
  return <Button as={Link} {...props} />;
}

/* ─── Panel (replaces Card — no hard border, uses gradient wash) ─── */

export function Card({ className, children, hover = false, bordered = false }) {
  return (
    <div
      className={cn(
        "rounded-2xl p-6",
        bordered
          ? "border border-white/[0.06] bg-white/[0.025] shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
          : "bg-white/[0.025]",
        hover && "cursor-pointer transition-all duration-300 hover:bg-white/[0.04]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ─── Flow section (truly borderless content block) ─── */

export function FlowSection({ className, children }) {
  return (
    <div className={cn("rounded-2xl p-6", className)}>
      {children}
    </div>
  );
}

/* ─── Badges ─── */

export function Badge({ className, children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ─── Section Headings ─── */

export function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-400/70">{eyebrow}</p>
        ) : null}
        <h2 className={cn("font-bold text-white", eyebrow ? "mt-2 text-3xl md:text-4xl" : "text-3xl md:text-4xl")}>
          {title}
        </h2>
        {description ? (
          <p className="mt-3 text-base leading-7 text-slate-400">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/* ─── Stat Cards (typographic, no border) ─── */

const accentConfig = {
  sky: {
    text: "text-sky-300",
    label: "text-sky-400/70",
    bg: "bg-gradient-to-b from-sky-500/10 to-transparent",
  },
  indigo: {
    text: "text-indigo-300",
    label: "text-indigo-400/70",
    bg: "bg-gradient-to-b from-indigo-500/10 to-transparent",
  },
  emerald: {
    text: "text-emerald-300",
    label: "text-emerald-400/70",
    bg: "bg-gradient-to-b from-emerald-500/10 to-transparent",
  },
  rose: {
    text: "text-rose-300",
    label: "text-rose-400/70",
    bg: "bg-gradient-to-b from-rose-500/10 to-transparent",
  },
  amber: {
    text: "text-amber-300",
    label: "text-amber-400/70",
    bg: "bg-gradient-to-b from-amber-500/10 to-transparent",
  },
  violet: {
    text: "text-violet-300",
    label: "text-violet-400/70",
    bg: "bg-gradient-to-b from-violet-500/10 to-transparent",
  },
};

export function StatCard({ label, value, helper, accent = "indigo", icon: Icon }) {
  const config = accentConfig[accent] ?? accentConfig.indigo;

  return (
    <div className={cn("relative overflow-hidden rounded-2xl p-5 transition-all duration-300", config.bg)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-400">{label}</p>
        {Icon ? <Icon className={cn("h-4 w-4 opacity-50", config.text)} /> : null}
      </div>
      <p className={cn("mt-3 text-3xl font-bold tracking-tight", config.text)}>{value}</p>
      {helper ? <p className="mt-1.5 text-xs text-slate-500">{helper}</p> : null}
    </div>
  );
}

/* ─── Empty State ─── */

export function EmptyState({ title, copy, action, icon: Icon }) {
  return (
    <div className="px-8 py-14 text-center">
      {Icon ? (
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] text-slate-500">
          <Icon className="h-6 w-6" />
        </div>
      ) : null}
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">{copy}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

/* ─── Progress Bar ─── */

export function ProgressBar({ value, max, label, helper }) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-200">{label}</span>
        <span className="tabular-nums text-slate-400">
          {value} <span className="text-slate-600">/</span> {max}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-1.5 rounded-full bg-gradient-to-r from-indigo-400 to-violet-400 transition-[width] duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      {helper ? <p className="text-xs text-slate-500">{helper}</p> : null}
    </div>
  );
}

/* ─── Form Fields ─── */

export function Field({ label, hint, children }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-slate-200">{label}</span>
      {children}
      {hint ? <span className="text-xs leading-5 text-slate-500">{hint}</span> : null}
    </label>
  );
}

function inputBase(extra = "") {
  return cn(
    "min-h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-slate-100 outline-none transition-all duration-200",
    "placeholder:text-slate-600",
    "focus:border-indigo-400/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-400/15",
    "disabled:cursor-not-allowed disabled:opacity-50",
    extra,
  );
}

export function TextInput({ label, hint, className, ...props }) {
  return (
    <Field label={label} hint={hint}>
      <input className={inputBase(className)} {...props} />
    </Field>
  );
}

export function TextArea({ label, hint, className, ...props }) {
  return (
    <Field label={label} hint={hint}>
      <textarea className={inputBase(cn("min-h-32 resize-y", className))} {...props} />
    </Field>
  );
}

export function Select({ label, hint, className, children, ...props }) {
  return (
    <Field label={label} hint={hint}>
      <select
        className={inputBase(cn("cursor-pointer", className))}
        style={{ colorScheme: "dark" }}
        {...props}
      >
        {children}
      </select>
    </Field>
  );
}

/* ─── Modal ─── */

export function Modal({ open, title, description, onClose, children, size = "md" }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKey(event) {
      if (event.key === "Escape") {
        onClose?.();
        return;
      }
      if (event.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }
      }
    }

    document.addEventListener("keydown", handleKey);
    const firstFocusable = panelRef.current?.querySelector(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
    );
    firstFocusable?.focus();

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = originalOverflow;
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  const maxW = size === "lg" ? "max-w-4xl" : size === "sm" ? "max-w-lg" : "max-w-2xl";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        className={cn(
          "relative w-full rounded-t-3xl sm:rounded-2xl border border-white/[0.08] bg-[#0a0a20] shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset,0_32px_80px_-20px_rgba(0,0,0,0.9)] max-h-[92vh] overflow-y-auto",
          "sm:" + maxW,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] p-6">
          <div>
            <h3 id="modal-title" className="text-xl font-bold text-white">
              {title}
            </h3>
            {description ? <p className="mt-1.5 text-sm text-slate-400">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/[0.06] hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/* ─── Info / Alert Boxes ─── */

export function AlertBox({ variant = "error", className, children }) {
  const styles = {
    error: "border-rose-400/20 bg-rose-500/8 text-rose-200",
    success: "border-emerald-400/20 bg-emerald-500/8 text-emerald-200",
    warning: "border-amber-400/20 bg-amber-500/8 text-amber-200",
    info: "border-indigo-400/20 bg-indigo-500/8 text-indigo-200",
  };
  return (
    <p className={cn("rounded-xl border px-4 py-3 text-sm leading-6", styles[variant], className)}>
      {children}
    </p>
  );
}

/* ─── Divider ─── */

export function Divider({ className }) {
  return <div className={cn("section-divider", className)} />;
}
