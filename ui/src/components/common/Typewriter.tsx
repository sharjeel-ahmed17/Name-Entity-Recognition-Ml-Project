import { useEffect, useState } from "react";

export function Typewriter({ text, speed = 55, className }: { text: string; speed?: number; className?: string }) {
  const [out, setOut] = useState("");
  useEffect(() => {
    setOut("");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setOut(text);
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  return (
    <span className={className}>
      {out}
      <span className="ml-0.5 inline-block w-[3px] h-[0.9em] -mb-1 bg-current animate-blink" aria-hidden />
    </span>
  );
}
