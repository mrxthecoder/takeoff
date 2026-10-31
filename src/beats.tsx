import { createContext, useContext, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

// The current "beat" of the slide. The presenter advances it with → / ←; <Reveal at={n}> pops in on command.
export const BeatCtx = createContext(0);
export const useBeat = () => useContext(BeatCtx);

export function Reveal({ at, children, className }: { at: number; children: ReactNode; className?: string }) {
  const beat = useBeat();
  return (
    <AnimatePresence>
      {beat >= at && (
        <motion.div className={className} initial={{ opacity: 0, scale: 0.8, y: 36, rotate: -2 }} animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.9 }} transition={{ type: "spring", stiffness: 240, damping: 17 }}>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
