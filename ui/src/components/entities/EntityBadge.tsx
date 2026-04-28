import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getEntityStyle } from "@/utils/entityStyle";
import type { EntityLabel } from "@/types/ner";

interface EntityBadgeProps {
  label: EntityLabel;
  count?: number;
  size?: "sm" | "md";
  className?: string;
  animated?: boolean;
}

export function EntityBadge({ label, count, size = "md", className, animated = true }: EntityBadgeProps) {
  const style = getEntityStyle(label);
  const Comp = animated ? motion.span : "span";
  const motionProps = animated
    ? {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        whileHover: { scale: 1.06, y: -2 },
        transition: { type: "spring" as const, stiffness: 400, damping: 22 },
      }
    : {};

  return (
    <Comp
      {...motionProps}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold tracking-wide",
        "ring-1 transition-shadow",
        style.bg,
        style.fg,
        style.ring,
        size === "sm" ? "px-2.5 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {style.label.toUpperCase()}
      {typeof count === "number" && (
        <span className="ml-1 rounded-full bg-current/15 px-1.5 py-0.5 text-[10px] tabular-nums">
          {count}
        </span>
      )}
    </Comp>
  );
}
