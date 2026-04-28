import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Layers, Loader2, ChevronDown, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useRecognizeBatch } from "@/hooks/useNER";
import { HighlightedText } from "@/components/entities/HighlightedText";
import { EntityBadge } from "@/components/entities/EntityBadge";
import { toast } from "sonner";

export function BatchAnalysis() {
  const [items, setItems] = useState<string[]>([
    "Barack Obama visited Berlin to meet leaders from the United Nations.",
    "Tesla announced a new factory in Shanghai run by Elon Musk's team.",
  ]);
  const mutation = useRecognizeBatch();

  const update = (i: number, v: string) =>
    setItems((s) => s.map((it, idx) => (idx === i ? v : it)));
  const remove = (i: number) => setItems((s) => s.filter((_, idx) => idx !== i));
  const add = () => setItems((s) => [...s, ""]);

  const run = () => {
    const cleaned = items.map((s) => s.trim()).filter(Boolean);
    if (!cleaned.length) return toast.error("Add at least one non-empty text");
    mutation.mutate(cleaned, {
      onError: (e: any) => toast.error("Batch failed", { description: e?.message }),
    });
  };

  const exportAll = () => {
    if (!mutation.data) return;
    const blob = new Blob([JSON.stringify(mutation.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ner-batch-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalEntities =
    mutation.data?.results.reduce((acc, r) => acc + r.entities.length, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {items.map((it, i) => (
              <motion.div
                key={i}
                layout
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, height: 0 }}
                className="group flex items-start gap-2"
              >
                <span className="mt-3 w-7 shrink-0 text-center font-mono text-xs text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <textarea
                  value={it}
                  onChange={(e) => update(i, e.target.value)}
                  placeholder={`Text #${i + 1}`}
                  rows={2}
                  className="flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition-shadow focus:shadow-glow focus:border-primary"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(i)}
                  className="mt-1 h-8 w-8 opacity-50 hover:opacity-100"
                  aria-label="Remove"
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <Button variant="outline" size="sm" onClick={add} className="gap-2">
            <Plus className="h-4 w-4" /> Add line
          </Button>
          <Button
            onClick={run}
            disabled={mutation.isPending}
            className="gap-2 bg-gradient-brand text-primary-foreground shadow-glow hover:shadow-glow-lg"
          >
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Layers className="h-4 w-4" />}
            {mutation.isPending ? "Processing…" : `Process ${items.filter((s) => s.trim()).length} texts`}
          </Button>
        </div>

        {mutation.isPending && (
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full bg-gradient-brand"
              initial={{ width: "10%" }}
              animate={{ width: ["10%", "90%"] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            />
          </div>
        )}
      </div>

      <AnimatePresence>
        {mutation.data && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-gradient-brand/5 p-5">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Batch Summary</div>
                <div className="mt-1 text-2xl font-extrabold">
                  <span className="gradient-text">{mutation.data.results.length}</span> texts ·{" "}
                  <span className="gradient-text">{totalEntities}</span> entities
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={exportAll} className="gap-2">
                <Download className="h-4 w-4" /> Export JSON
              </Button>
            </div>

            <div className="space-y-2">
              {mutation.data.results.map((r, i) => (
                <BatchResultRow key={i} index={i} text={r.text} entities={r.entities} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BatchResultRow({ index, text, entities }: { index: number; text: string; entities: any[] }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-2xl border border-border bg-card shadow-card overflow-hidden"
    >
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-muted/40 transition-colors">
            <span className="font-mono text-xs text-muted-foreground">#{String(index + 1).padStart(2, "0")}</span>
            <span className="flex-1 truncate text-sm">{text}</span>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {entities.length} {entities.length === 1 ? "entity" : "entities"}
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-3 border-t border-border bg-muted/20 px-5 py-4">
            <HighlightedText text={text} entities={entities} />
            <div className="flex flex-wrap gap-2">
              {entities.map((e, i) => (
                <EntityBadge key={i} label={e.label} count={undefined} animated={false} />
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  );
}
