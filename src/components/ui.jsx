import { Link } from "react-router-dom";
import { cn } from "../lib/utils";

const buttonStyles = {
  primary: "bg-sky-500 text-slate-950 hover:bg-sky-400",
  secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700 ring-1 ring-inset ring-white/10",
  ghost: "bg-transparent text-slate-200 hover:bg-white/6 ring-1 ring-inset ring-white/10",
  danger: "bg-rose-500 text-white hover:bg-rose-400",
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
      ? "h-10 px-4 text-sm"
      : size === "lg"
        ? "h-13 px-6 text-base"
        : "h-11 px-5 text-sm";

  return (
    <Component
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 disabled:cursor-not-allowed disabled:opacity-60",
        sizeClass,
        buttonStyles[variant],
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

export function Card({ className, children }) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-[0_25px_80px_-55px_rgba(14,165,233,0.7)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Badge({ className, children }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset", className)}>
      {children}
    </span>
  );
}

export function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300/80">{eyebrow}</p> : null}
        <h2 className="mt-2 text-3xl font-bold text-white md:text-4xl">{title}</h2>
        {description ? <p className="mt-3 text-base text-slate-400">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, helper, accent = "sky" }) {
  const accents = {
    sky: "from-sky-500/20 to-transparent text-sky-200",
    emerald: "from-emerald-500/20 to-transparent text-emerald-200",
    rose: "from-rose-500/20 to-transparent text-rose-200",
    amber: "from-amber-500/20 to-transparent text-amber-200",
    violet: "from-violet-500/20 to-transparent text-violet-200",
  };

  return (
    <Card className="relative overflow-hidden">
      <div className={cn("absolute inset-x-0 top-0 h-24 bg-gradient-to-b", accents[accent])} />
      <div className="relative">
        <p className="text-sm text-slate-400">{label}</p>
        <p className="mt-4 text-3xl font-bold text-white">{value}</p>
        {helper ? <p className="mt-2 text-sm text-slate-400">{helper}</p> : null}
      </div>
    </Card>
  );
}

export function EmptyState({ title, copy, action }) {
  return (
    <Card className="border-dashed border-white/12 bg-slate-950/60 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300/80">No data yet</p>
      <h3 className="mt-4 text-2xl font-bold text-white">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-slate-400">{copy}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </Card>
  );
}

export function ProgressBar({ value, max, label, helper }) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-200">{label}</span>
        <span className="text-slate-400">
          {value} / {max}
        </span>
      </div>
      <div className="h-3 rounded-full bg-slate-800">
        <div
          className="h-3 rounded-full bg-gradient-to-r from-sky-400 to-teal-300 transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
      {helper ? <p className="text-sm text-slate-500">{helper}</p> : null}
    </div>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-slate-200">{label}</span>
      {children}
      {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}

function inputBase(className = "") {
  return cn(
    "min-h-12 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20 placeholder:text-slate-500",
    className,
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
      <select className={inputBase(className)} {...props}>
        {children}
      </select>
    </Field>
  );
}

export function Modal({ open, title, description, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-[32px] border border-white/10 bg-slate-950/95 p-6 shadow-2xl shadow-sky-950/30">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-white">{title}</h3>
            {description ? <p className="mt-2 text-slate-400">{description}</p> : null}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
