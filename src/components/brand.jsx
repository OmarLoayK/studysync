import { Link } from "react-router-dom";
import { APP_NAME } from "../lib/constants";
import { cn } from "../lib/utils";

const CLOCK_PROPS = {
  sm: { vb: "0 0 36 36", cx: 18, cy: 18, r: 9,  txt: "text-[10px]" },
  md: { vb: "0 0 44 44", cx: 22, cy: 22, r: 11, txt: "text-[12px]" },
  lg: { vb: "0 0 56 56", cx: 28, cy: 28, r: 14, txt: "text-sm"     },
};

export function BrandMark({ size = "md" }) {
  const sizeClass =
    size === "sm"
      ? "h-9 w-9 rounded-xl"
      : size === "lg"
        ? "h-14 w-14 rounded-2xl"
        : "h-11 w-11 rounded-[14px]";

  const cp = CLOCK_PROPS[size] || CLOCK_PROPS.md;

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
      {/* Clock face — branding element behind the monogram */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.28]"
        viewBox={cp.vb}
        aria-hidden="true"
      >
        <circle cx={cp.cx} cy={cp.cy} r={cp.r} fill="none" stroke="white" strokeWidth="1.2" />
        {/* Minute hand — 12 o'clock */}
        <line x1={cp.cx} y1={cp.cy} x2={cp.cx} y2={cp.cy - cp.r * 0.75}
          stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        {/* Hour hand — ~10 o'clock (dx=-0.52r, dy=-0.30r) */}
        <line x1={cp.cx} y1={cp.cy}
          x2={cp.cx - cp.r * 0.52} y2={cp.cy - cp.r * 0.30}
          stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx={cp.cx} cy={cp.cy} r="1.2" fill="white" />
      </svg>

      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(145deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(0,0,0,0.12) 100%)",
        }}
      />
      <span className={cn("relative z-10 tracking-[-0.13em]", cp.txt)}>SS</span>
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
