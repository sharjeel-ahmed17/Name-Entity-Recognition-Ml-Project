import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { HistoryItem } from "@/types/ner";

interface AppState {
  apiUrl: string;
  setApiUrl: (url: string) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  history: HistoryItem[];
  addHistory: (item: HistoryItem) => void;
  clearHistory: () => void;
  hasAnalyzedOnce: boolean;
  markAnalyzed: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      apiUrl: import.meta.env.VITE_NER_API_URL || "http://localhost:8000",
      setApiUrl: (url) => set({ apiUrl: url.replace(/\/$/, "") }),
      theme: "light",
      toggleTheme: () =>
        set((s) => {
          const next = s.theme === "light" ? "dark" : "light";
          if (typeof document !== "undefined") {
            document.documentElement.classList.toggle("dark", next === "dark");
          }
          return { theme: next };
        }),
      history: [],
      addHistory: (item) =>
        set((s) => ({ history: [item, ...s.history].slice(0, 25) })),
      clearHistory: () => set({ history: [] }),
      hasAnalyzedOnce: false,
      markAnalyzed: () => set({ hasAnalyzedOnce: true }),
    }),
    { name: "ner-app-store" }
  )
);
