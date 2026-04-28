import { useMemo } from "react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getEntityStyle } from "@/utils/entityStyle";
import type { Entity } from "@/types/ner";

interface HighlightedTextProps {
  text: string;
  entities: Entity[];
}

interface Segment {
  type: "text" | "entity";
  content: string;
  entity?: Entity;
  key: string;
}

export function HighlightedText({ text, entities }: HighlightedTextProps) {
  const segments = useMemo<Segment[]>(() => {
    const sorted = [...entities]
      .filter((e) => typeof e.start === "number" && typeof e.end === "number" && e.end > e.start)
      .sort((a, b) => a.start - b.start);

    const out: Segment[] = [];
    let cursor = 0;
    sorted.forEach((e, i) => {
      if (e.start < cursor) return; // skip overlaps
      if (e.start > cursor) {
        out.push({ type: "text", content: text.slice(cursor, e.start), key: `t-${i}-${cursor}` });
      }
      out.push({
        type: "entity",
        content: text.slice(e.start, e.end),
        entity: e,
        key: `e-${i}-${e.start}`,
      });
      cursor = e.end;
    });
    if (cursor < text.length) {
      out.push({ type: "text", content: text.slice(cursor), key: `t-end-${cursor}` });
    }
    return out;
  }, [text, entities]);

  return (
    <TooltipProvider delayDuration={150}>
      <p className="whitespace-pre-wrap break-words text-base leading-relaxed text-foreground">
        {segments.map((seg, i) => {
          if (seg.type === "text") return <span key={seg.key}>{seg.content}</span>;
          const e = seg.entity!;
          const style = getEntityStyle(e.label);
          return (
            <Tooltip key={seg.key}>
              <TooltipTrigger asChild>
                <motion.span
                  initial={{ backgroundColor: "hsl(var(--primary) / 0.4)", scale: 0.95 }}
                  animate={{ backgroundColor: "", scale: 1 }}
                  transition={{ delay: i * 0.02, duration: 0.5, ease: "easeOut" }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className={`relative inline-block cursor-pointer rounded-md px-1.5 py-0.5 mx-0.5 font-semibold ring-1 ${style.bg} ${style.fg} ${style.ring} shadow-sm hover:shadow-md transition-shadow`}
                >
                  {seg.content}
                  <span className={`pointer-events-none absolute -top-1 -right-1 h-1.5 w-1.5 rounded-full ${style.fg.replace("text-", "bg-")}`} />
                </motion.span>
              </TooltipTrigger>
              <TooltipContent side="top" className="font-medium">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wider opacity-70">{style.label}</span>
                  <span className="text-sm">{seg.content}</span>
                  {typeof e.score === "number" && (
                    <span className="mt-1 text-[10px] opacity-60">
                      confidence: {(e.score * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </p>
    </TooltipProvider>
  );
}
