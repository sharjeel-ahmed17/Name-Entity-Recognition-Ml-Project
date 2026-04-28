import { Moon, Sun, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/useAppStore";
import { ApiSidebar } from "./ApiSidebar";

export function Header() {
  const theme = useAppStore((s) => s.theme);
  const toggle = useAppStore((s) => s.toggleTheme);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <a href="/" className="group flex items-center gap-2.5">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand shadow-glow">
            <Sparkles className="h-5 w-5 text-white" />
            <span className="absolute inset-0 rounded-xl bg-gradient-brand opacity-50 blur-md group-hover:opacity-80 transition-opacity" />
          </span>
          <div className="leading-tight">
            <div className="font-extrabold tracking-tight">NER<span className="gradient-text">.studio</span></div>
            <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Entity Recognition
            </div>
          </div>
        </a>

        <div className="flex items-center gap-2">
          <ApiSidebar />
          <Button
            variant="outline"
            size="icon"
            onClick={toggle}
            aria-label="Toggle theme"
            className="rounded-full bg-card/80 backdrop-blur"
          >
            <AnimatePresence mode="wait" initial={false}>
              {theme === "dark" ? (
                <motion.span
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                >
                  <Sun className="h-4 w-4" />
                </motion.span>
              ) : (
                <motion.span
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                >
                  <Moon className="h-4 w-4" />
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </div>
    </header>
  );
}
