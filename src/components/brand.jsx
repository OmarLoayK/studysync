import { Link } from "react-router-dom";
import { APP_NAME } from "../lib/constants";
import { cn } from "../lib/utils";

export function BrandMark({ size = "md" }) {
  const sizeClass =
    size === "sm"
      ? "h-10 w-10 rounded-2xl"
      : size === "lg"
        ? "h-14 w-14 rounded-[22px]"
        : "h-12 w-12 rounded-2xl";

  const dotClass = size === "sm" ? "h-1.5 w-1.5" : size === "lg" ? "h-2.5 w-2.5" : "h-2 w-2";

  return (
    <div
      className={cn(
        "relative grid place-items-center overflow-hidden border border-sky-300/20 bg-[radial-gradient(circle_at_30%_25%,rgba(125,211,252,0.92),rgba(34,211,238,0.86)_45%,rgba(8,47,73,0.95)_100%)] text-slate-950 shadow-[0_18px_50px_-18px_rgba(34,211,238,0.55)]",
        sizeClass,
      )}
    >
      <div className="absolute inset-[1px] rounded-[inherit] bg-[linear-gradient(145deg,rgba(255,255,255,0.18),transparent_42%,rgba(15,23,42,0.12))]" />
      <div className="relative flex items-center gap-1">
        <span className="font-black tracking-[-0.12em] text-slate-950">S</span>
        <span className={cn("rounded-full bg-slate-950/80", dotClass)} />
      </div>
    </div>
  );
}

export function BrandLockup({ to = "/", compact = false, subtitle = "Study operating system", className = "" }) {
  return (
    <Link to={to} className={cn("flex items-center gap-3", className)}>
      <BrandMark size={compact ? "sm" : "md"} />
      <div className="min-w-0">
        <p className="font-bold text-white">{APP_NAME}</p>
        <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">{subtitle}</p>
      </div>
    </Link>
  );
}
