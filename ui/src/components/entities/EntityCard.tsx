import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { getEntityStyle } from "@/utils/entityStyle";
import type { Entity } from "@/types/ner";

interface EntityCardProps {
  entity: Entity;
  index: number;
}

export function EntityCard({ entity, index }: EntityCardProps) {
  const style = getEntityStyle(entity.label);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(entity.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, type: "spring", stiffness: 260, damping: 24 }}
      whileHover={{ y: -2, scale: 1.01 }}
      className="group relative flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm hover:shadow-card transition-shadow"
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-bold ${style.bg} ${style.fg}`}>
        {entity.text.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-semibold text-foreground">{entity.text}</span>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider ${style.bg} ${style.fg}`}>
            {style.label.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="font-mono">[{entity.start}–{entity.end}]</span>
          {typeof entity.score === "number" && (
            <span className="flex items-center gap-1">
              <span className="h-1 w-12 overflow-hidden rounded-full bg-muted">
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: `${entity.score * 100}%` }}
                  transition={{ delay: index * 0.04 + 0.2, duration: 0.6 }}
                  className="block h-full bg-gradient-brand"
                />
              </span>
              {(entity.score * 100).toFixed(0)}%
            </span>
          )}
        </div>
      </div>
      <button
        onClick={copy}
        aria-label="Copy entity text"
        className="opacity-0 group-hover:opacity-100 transition-opacity rounded-md p-2 hover:bg-muted text-muted-foreground hover:text-foreground"
      >
        {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
      </button>
    </motion.div>
  );
}
