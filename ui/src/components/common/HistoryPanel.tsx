import { motion, AnimatePresence } from "framer-motion";
import { History, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/useAppStore";
import { EntityBadge } from "@/components/entities/EntityBadge";

export function HistoryPanel() {
  const history = useAppStore((s) => s.history);
  const clear = useAppStore((s) => s.clearHistory);

  if (!history.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
        <History className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">
          Your recent analyses will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Recent Analyses
        </h3>
        <Button variant="ghost" size="sm" onClick={clear} className="gap-2 text-xs text-muted-foreground hover:text-destructive">
          <Trash2 className="h-3.5 w-3.5" /> Clear
        </Button>
      </div>
      <AnimatePresence>
        {history.map((h, i) => {
          const counts: Record<string, number> = {};
          h.entities.forEach((e) => {
            const k = e.label.toUpperCase();
            counts[k] = (counts[k] || 0) + 1;
          });
          return (
            <motion.div
              key={h.id}
              layout
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-card transition-shadow"
            >
              <p className="line-clamp-2 text-sm">{h.text}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {new Date(h.timestamp).toLocaleTimeString()}
                </span>
                {Object.entries(counts).map(([label, count]) => (
                  <EntityBadge key={label} label={label} count={count} size="sm" animated={false} />
                ))}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
