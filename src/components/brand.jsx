import { Link } from "react-router-dom";
import { APP_NAME } from "../lib/constants";
import { cn } from "../lib/utils";

export function BrandMark({ size = "md" }) {
  const sizeClass =
    size === "sm"
      ? "h-9 w-9 rounded-xl text-sm"
      : size === "lg"
        ? "h-14 w-14 rounded-2xl text-lg"
        : "h-11 w-11 rounded-[14px] text-base";

  return (
    <div
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden font-black text-white",
        sizeClass,
      )}
      style={{
        background: "radial-gradient(circle at 35% 30%, #818cf8, #6366f1 40%, #4338ca 100%)",
        boxShadow: "0 0 0 1px rgba(99,102,241,0.35), 0 8px 32px -8px rgba(99,102,241,0.6), inset 0 1px 0 rgba(255,255,255,0.25)",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(145deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(0,0,0,0.12) 100%)",
        }}
      />
      <span className="relative z-10 tracking-[-0.1em]">S</span>
    </div>
  );
}

export function BrandLockup({
  to = "/",
  compact = false,
  subtitle = "Study operating system",
  className = "",
}) {
  return (
    <Link to={to} className={cn("group flex items-center gap-3", className)}>
      <BrandMark size={compact ? "sm" : "md"} />
      <div className="min-w-0">
        <p className="font-bold leading-none text-white transition group-hover:text-indigo-100">{APP_NAME}</p>
        <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.28em] text-slate-500">{subtitle}</p>
      </div>
    </Link>
  );
}
