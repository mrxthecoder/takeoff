import { AnimatePresence, motion } from "framer-motion";
import type { Step } from "./runtime";

const pop = { initial: { scale: 0.7, opacity: 0, y: 14 }, animate: { scale: 1, opacity: 1, y: 0 },
  exit: { scale: 0.8, opacity: 0 }, transition: { type: "spring" as const, stiffness: 260, damping: 20 } };

export function ObjectDiagram({ step }: { step?: Step }) {
  if (!step || (!step.classes.length && !step.objects.length))
    return <div className="diagram-empty"><span>Press <b>Run ▶</b> to build the object diagram from your code.</span></div>;
  return (
    <div className="diagram">
      <AnimatePresence>
        {step.classes.map((c) => (
          <motion.div key={"c" + c.name} className="class-wrap" {...pop}>
            {c.bases.length > 0 && <div className="arrow up">▲ inherits from {c.bases.join(", ")}</div>}
            <div className="card class-card">
            <div className="tag blue">CLASS / BLUEPRINT{c.bases.length ? "  ·  extends " + c.bases.join(", ") : ""}</div>
            <div className="card-title">{c.name}</div>
            <div className="chips">
              {c.methods.map((m) => (
                <span key={m} className={"chip " + (m.startsWith("_") && m !== "__init__" ? "internal" : m === "__init__" ? "init" : "public")}>
                  {m}()
                </span>
              ))}
              {c.inherited.filter((m) => !c.methods.includes(m)).map((m) => (<span key={"i" + m} className="chip inherited">{m}() ↑</span>))}
            </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {step.classes.length > 0 && step.objects.length > 0 && <div className="arrow">▼ instantiates</div>}
      <div className="objects">
        <AnimatePresence>
          {step.objects.map((o) => (
            <motion.div key={"o" + o.var} className="card obj-card" {...pop}>
              <div className="tag green">OBJECT / {o.var} · {o.cls}</div>
              {Object.entries(o.attrs).map(([k, v]) => (
                <div className="attr" key={k}>
                  <span className="k">{k}:</span>
                  {/* keyed by value: a changed value re-mounts and flashes yellow = visible state change */}
                  <motion.span key={v} className="v" initial={{ backgroundColor: "#FBBC04" }}
                    animate={{ backgroundColor: "rgba(251,188,4,0)" }} transition={{ duration: 1.4 }}>{v}</motion.span>
                </div>
              ))}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
