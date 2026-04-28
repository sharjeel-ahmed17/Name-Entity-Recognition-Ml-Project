import { motion } from "framer-motion";
import { Sparkles, Activity } from "lucide-react";
import { ParticleField } from "@/components/common/ParticleField";
import { Typewriter } from "@/components/common/Typewriter";
import { useConnection } from "@/hooks/useNER";

export function Hero() {
  const { isSuccess, isLoading } = useConnection();
  const live = isSuccess;

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-hero text-white shadow-glow-lg">
      <div className="absolute inset-0 opacity-60 mix-blend-soft-light">
        <ParticleField density={50} />
      </div>
      <div
        className="absolute -top-32 -right-32 h-96 w-96 rounded-full blur-3xl opacity-50"
        style={{ background: "radial-gradient(circle, hsl(290 90% 75%), transparent 70%)" }}
      />
      <div
        className="absolute -bottom-40 -left-32 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-40"
        style={{ background: "radial-gradient(circle, hsl(220 90% 70%), transparent 70%)" }}
      />

      <div className="relative px-6 py-16 md:px-14 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold tracking-wider backdrop-blur-md ring-1 ring-white/30">
            <Sparkles className="h-3.5 w-3.5" />
            NEURAL ENTITY RECOGNITION
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur-md ring-1 ring-white/20">
            <span className="relative flex h-2 w-2">
              {live && (
                <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-success" />
              )}
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  live ? "bg-success" : isLoading ? "bg-warning" : "bg-destructive"
                }`}
              />
            </span>
            {live ? "LIVE" : isLoading ? "CONNECTING" : "OFFLINE"}
          </span>
        </motion.div>

        <h1 className="mt-6 max-w-4xl font-sans text-4xl font-extrabold leading-[1.05] tracking-tight md:text-7xl">
          <Typewriter text="Decode meaning from text." />
          <br />
          <motion.span
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.7 }}
            className="bg-gradient-to-r from-white via-fuchsia-200 to-violet-200 bg-clip-text text-transparent"
          >
            Instantly.
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0, duration: 0.6 }}
          className="mt-6 max-w-2xl text-base text-white/85 md:text-lg"
        >
          A premium interface for Named Entity Recognition. Highlight people, places, and
          organizations across single passages or massive batches — with confidence scores,
          tooltips, and silky animations.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.4 }}
          className="mt-8 flex items-center gap-3 text-xs text-white/70"
        >
          <Activity className="h-4 w-4" />
          <span>Press</span>
          <kbd className="rounded-md bg-white/15 px-2 py-1 font-mono text-[10px] ring-1 ring-white/30">⌘ / Ctrl</kbd>
          <span>+</span>
          <kbd className="rounded-md bg-white/15 px-2 py-1 font-mono text-[10px] ring-1 ring-white/30">Enter</kbd>
          <span>to analyze</span>
        </motion.div>
      </div>
    </section>
  );
}
