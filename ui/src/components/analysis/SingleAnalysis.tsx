import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, Loader2, Copy, Download, Check, Trash2 } from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { HighlightedText } from "@/components/entities/HighlightedText";
import { EntityCard } from "@/components/entities/EntityCard";
import { EntityBadge } from "@/components/entities/EntityBadge";
import { useRecognize } from "@/hooks/useNER";
import { useAppStore } from "@/stores/useAppStore";
import { toast } from "sonner";
import type { Entity } from "@/types/ner";

const SAMPLE = "Apple was founded by Steve Jobs and Steve Wozniak in Cupertino, California. Today, Tim Cook leads the company alongside Microsoft and Google as part of the global tech industry.";

export function SingleAnalysis() {
  const [text, setText] = useState("");
  const [includeScores, setIncludeScores] = useState(true);
  const [copied, setCopied] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const mutation = useRecognize();
  const addHistory = useAppStore((s) => s.addHistory);
  const hasAnalyzedOnce = useAppStore((s) => s.hasAnalyzedOnce);
  const markAnalyzed = useAppStore((s) => s.markAnalyzed);

  // auto-resize
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 480) + "px";
  }, [text]);

  // ⌘/Ctrl + Enter
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        analyze();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, includeScores]);

  const analyze = () => {
    const t = text.trim();
    if (!t) return toast.error("Please enter some text to analyze");
    mutation.mutate(
      { text: t, include_scores: includeScores },
      {
        onSuccess: (data) => {
          addHistory({ id: crypto.randomUUID(), text: t, entities: data.entities, timestamp: Date.now() });
          if (!hasAnalyzedOnce) {
            markAnalyzed();
            confetti({
              particleCount: 110,
              spread: 75,
              origin: { y: 0.7 },
              colors: ["#667eea", "#764ba2", "#a855f7", "#ec4899"],
            });
          }
          requestAnimationFrame(() =>
            resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
          );
        },
        onError: (e: any) => {
          toast.error("Analysis failed", { description: e?.message ?? "Unable to reach the API" });
        },
      }
    );
  };

  const grouped = useMemo(() => {
    const out: Record<string, Entity[]> = {};
    mutation.data?.entities.forEach((e) => {
      const k = (e.label || "UNKNOWN").toUpperCase();
      (out[k] ||= []).push(e);
    });
    return out;
  }, [mutation.data]);

  const copyJson = async () => {
    if (!mutation.data) return;
    await navigator.clipboard.writeText(JSON.stringify(mutation.data, null, 2));
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadJson = () => {
    if (!mutation.data) return;
    const blob = new Blob([JSON.stringify(mutation.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ner-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-shadow focus-within:shadow-glow"
      >
        <div className="pointer-events-none absolute inset-0 opacity-0 group-focus-within:opacity-100 transition-opacity">
          <div className="absolute inset-0 rounded-2xl bg-gradient-brand p-[1.5px]">
            <div className="h-full w-full rounded-2xl bg-card" />
          </div>
        </div>
        <div className="relative">
          <textarea
            ref={taRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste an article, a paragraph, or a tweet… and watch entities light up."
            className="block w-full resize-none bg-transparent px-6 py-5 text-base leading-relaxed outline-none placeholder:text-muted-foreground/60 min-h-[160px]"
            aria-label="Text to analyze"
          />
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/30 px-4 py-3">
            <div className="flex items-center gap-4">
              <motion.span
                key={text.length}
                initial={{ scale: 1.15, color: "hsl(var(--primary))" }}
                animate={{ scale: 1, color: "hsl(var(--muted-foreground))" }}
                transition={{ duration: 0.3 }}
                className="font-mono text-xs"
              >
                {text.length.toLocaleString()} chars · {text.trim().split(/\s+/).filter(Boolean).length} words
              </motion.span>
              <div className="flex items-center gap-2">
                <Switch id="scores" checked={includeScores} onCheckedChange={setIncludeScores} />
                <Label htmlFor="scores" className="text-xs cursor-pointer">Include scores</Label>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setText(SAMPLE)}
                className="text-xs"
              >
                Try sample
              </Button>
              {text && (
                <Button variant="ghost" size="sm" onClick={() => setText("")} className="text-xs">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                onClick={analyze}
                disabled={mutation.isPending || !text.trim()}
                className="relative overflow-hidden bg-gradient-brand text-primary-foreground shadow-glow hover:shadow-glow-lg transition-shadow"
              >
                <AnimatePresence mode="wait">
                  {mutation.isPending ? (
                    <motion.span
                      key="load"
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 6 }}
                      className="flex items-center gap-2"
                    >
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing
                    </motion.span>
                  ) : (
                    <motion.span
                      key="ready"
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 6 }}
                      className="flex items-center gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      Analyze
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Loading skeleton */}
      <AnimatePresence>
        {mutation.isPending && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid gap-3 md:grid-cols-4"
          >
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl shimmer" />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {mutation.data && !mutation.isPending && (
          <motion.div
            ref={resultsRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Stats */}
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              <StatCard label="Entities" value={mutation.data.entities.length} delay={0} accent="primary" />
              <StatCard label="Persons" value={grouped.PERSON?.length || 0} delay={0.05} accent="person" />
              <StatCard label="Locations" value={grouped.GPE?.length || 0} delay={0.1} accent="gpe" />
              <StatCard label="Organizations" value={grouped.ORG?.length || 0} delay={0.15} accent="org" />
            </div>

            {/* Highlighted text */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Highlighted Text</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyJson} className="gap-2">
                    {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                    JSON
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadJson} className="gap-2">
                    <Download className="h-3.5 w-3.5" /> Export
                  </Button>
                </div>
              </div>
              <HighlightedText text={mutation.data.text} entities={mutation.data.entities} />
            </div>

            {/* Entity list */}
            {mutation.data.entities.length > 0 ? (
              <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Detected Entities
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {mutation.data.entities.map((e, i) => (
                    <EntityCard key={`${e.start}-${e.end}-${i}`} entity={e} index={i} />
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {Object.entries(grouped).map(([k, v]) => (
                    <EntityBadge key={k} label={k} count={v.length} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
                <p className="text-muted-foreground">No entities detected in this text.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({
  label,
  value,
  delay,
  accent,
}: {
  label: string;
  value: number;
  delay: number;
  accent: "primary" | "person" | "gpe" | "org";
}) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const dur = 600;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setDisplay(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const accentClass = {
    primary: "from-primary to-primary-glow",
    person: "from-entity-person-fg to-entity-person-fg/70",
    gpe: "from-entity-gpe-fg to-entity-gpe-fg/70",
    org: "from-entity-org-fg to-entity-org-fg/70",
  }[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 260, damping: 22 }}
      whileHover={{ y: -4 }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card"
    >
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-20 blur-2xl ${accentClass}`} />
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 font-sans text-4xl font-extrabold tabular-nums tracking-tight">
        <span className={`bg-gradient-to-br ${accentClass} bg-clip-text text-transparent`}>{display}</span>
      </div>
    </motion.div>
  );
}
