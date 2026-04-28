import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings2, Wifi, WifiOff, RefreshCw, Loader2, Server } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EntityBadge } from "@/components/entities/EntityBadge";
import { useAppStore } from "@/stores/useAppStore";
import { useConnection, useLabels } from "@/hooks/useNER";
import { ENTITY_LABELS } from "@/utils/entityStyle";
import { toast } from "sonner";

export function ApiSidebar() {
  const apiUrl = useAppStore((s) => s.apiUrl);
  const setApiUrl = useAppStore((s) => s.setApiUrl);
  const [draft, setDraft] = useState(apiUrl);
  const conn = useConnection();
  const labelsQ = useLabels();

  const status: "connected" | "loading" | "error" = conn.isLoading
    ? "loading"
    : conn.isSuccess
    ? "connected"
    : "error";

  const apply = () => {
    let v = draft.trim();
    if (!v) return toast.error("API URL cannot be empty");
    if (!/^https?:\/\//.test(v)) v = "http://" + v;
    try {
      new URL(v);
    } catch {
      return toast.error("Invalid URL");
    }
    setApiUrl(v);
    setDraft(v);
    toast.success("API endpoint updated");
  };

  const labels = labelsQ.data?.labels?.length ? labelsQ.data.labels : [...ENTITY_LABELS];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 rounded-full border-border bg-card/80 backdrop-blur-md hover:shadow-glow"
        >
          <Settings2 className="h-4 w-4" />
          <span className="hidden sm:inline">API</span>
          <span className="relative flex h-2 w-2">
            {status === "connected" && (
              <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-success" />
            )}
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                status === "connected"
                  ? "bg-success"
                  : status === "loading"
                  ? "bg-warning"
                  : "bg-destructive"
              }`}
            />
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" /> API Connection
          </SheetTitle>
          <SheetDescription>
            Configure the FastAPI backend powering entity recognition.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="api-url">Endpoint URL</Label>
            <div className="flex gap-2">
              <Input
                id="api-url"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="http://localhost:8000"
                className="font-mono text-sm"
                onKeyDown={(e) => e.key === "Enter" && apply()}
              />
              <Button onClick={apply} className="bg-gradient-brand hover:opacity-90 shadow-glow">
                Apply
              </Button>
            </div>
          </div>

          <motion.div
            layout
            className={`relative overflow-hidden rounded-2xl border p-4 ${
              status === "connected"
                ? "border-success/30 bg-success/5"
                : status === "loading"
                ? "border-warning/30 bg-warning/5"
                : "border-destructive/30 bg-destructive/5"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AnimatePresence mode="wait">
                  {status === "connected" ? (
                    <motion.div key="ok" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <Wifi className="h-5 w-5 text-success" />
                    </motion.div>
                  ) : status === "loading" ? (
                    <motion.div key="load" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <Loader2 className="h-5 w-5 animate-spin text-warning" />
                    </motion.div>
                  ) : (
                    <motion.div key="err" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <WifiOff className="h-5 w-5 text-destructive" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <div>
                  <div className="text-sm font-semibold">
                    {status === "connected" ? "Connected" : status === "loading" ? "Connecting…" : "Disconnected"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {conn.data?.model ? `Model: ${conn.data.model}` : conn.error ? "Check the URL & CORS" : "Live status"}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => conn.refetch()}
                aria-label="Retry connection"
                className="h-8 w-8"
              >
                <RefreshCw className={`h-4 w-4 ${conn.isFetching ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </motion.div>

          <div>
            <Label className="mb-3 block">Available Entity Types</Label>
            <div className="flex flex-wrap gap-2">
              {labels.map((l, i) => (
                <motion.div
                  key={l}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <EntityBadge label={l} animated={false} />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
            <div className="mb-1 font-semibold text-foreground">Endpoints</div>
            <ul className="space-y-1 font-mono">
              <li>GET /health</li>
              <li>GET /labels</li>
              <li>POST /recognize</li>
              <li>POST /recognize/batch</li>
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
