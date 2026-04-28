import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Layers, History as HistoryIcon, WifiOff } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/layout/Hero";
import { SingleAnalysis } from "@/components/analysis/SingleAnalysis";
import { BatchAnalysis } from "@/components/analysis/BatchAnalysis";
import { HistoryPanel } from "@/components/common/HistoryPanel";
import { useAppStore } from "@/stores/useAppStore";

type Tab = "single" | "batch" | "history";

const TABS: { id: Tab; label: string; icon: typeof FileText }[] = [
  { id: "single", label: "Single Text", icon: FileText },
  { id: "batch", label: "Batch", icon: Layers },
  { id: "history", label: "History", icon: HistoryIcon },
];

const Index = () => {
  const theme = useAppStore((s) => s.theme);
  const [tab, setTab] = useState<Tab>("single");
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);

  // hydrate theme class
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // hydrate from share URL (?text=)
  useEffect(() => {
    const url = new URL(window.location.href);
    const shared = url.searchParams.get("text");
    if (shared) {
      // place into single textarea via tab
      setTab("single");
    }
  }, []);

  // online status
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);

  return (
    <div className="relative min-h-screen mesh-bg">
      <Header />

      <AnimatePresence>
        {!online && (
          <motion.div
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            className="sticky top-16 z-30 flex items-center justify-center gap-2 bg-destructive/10 px-4 py-2 text-xs font-medium text-destructive backdrop-blur"
          >
            <WifiOff className="h-3.5 w-3.5" /> You are offline. Reconnect to analyze text.
          </motion.div>
        )}
      </AnimatePresence>

      <main className="container max-w-6xl space-y-10 py-8">
        <Hero />

        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card/60 p-1.5 shadow-sm backdrop-blur w-full sm:w-fit">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                    active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="active-tab"
                      className="absolute inset-0 rounded-xl bg-gradient-brand shadow-glow"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className="relative z-10 h-4 w-4" />
                  <span className="relative z-10">{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab views */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {tab === "single" && <SingleAnalysis />}
              {tab === "batch" && <BatchAnalysis />}
              {tab === "history" && <HistoryPanel />}
            </motion.div>
          </AnimatePresence>
        </div>

        <footer className="pt-12 pb-6 text-center text-xs text-muted-foreground">
          Built with React, Framer Motion & a love for elegant typography.
        </footer>
      </main>
    </div>
  );
};

export default Index;
