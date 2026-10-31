import { createContext, useContext, useEffect, useRef, useState } from "react";
import { EditorView, keymap } from "@codemirror/view";
import { Prec } from "@codemirror/state";
import { basicSetup } from "codemirror";
import { python } from "@codemirror/lang-python";
import { motion } from "framer-motion";
import { ObjectDiagram } from "./ObjectDiagram";
import { useBeat } from "./beats";
import { initRuntime, runCode, useRuntimeStatus, type RunResult } from "./runtime";

// Deck-level store: edited code and last run survive slide navigation.
export type Lab = { codes: Record<string, string>; runs: Record<string, RunResult>;
  setCode: (id: string, c: string) => void; setRun: (id: string, r: RunResult) => void };
export const LabCtx = createContext<Lab>(null as unknown as Lab);

const theme = EditorView.theme({
  "&": { fontSize: "21px", height: "100%", backgroundColor: "#F8F9FA" },
  ".cm-scroller": { fontFamily: "'JetBrains Mono', monospace", lineHeight: "1.4" },
  ".cm-gutters": { backgroundColor: "#F1F3F4", border: "none", color: "#9AA0A6" },
  "&.cm-focused": { outline: "3px solid #4285F4" },
});

export type Callout = { color: "blue" | "red" | "yellow" | "green"; label: string; text: string };
export function CodeLab({ id, initial, callouts = [], side }: { id: string; initial: string; callouts?: Callout[]; side?: React.ReactNode }) {
  const lab = useContext(LabCtx);
  const beat = useBeat();
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const [busy, setBusy] = useState(false);
  const [stepIdx, setStepIdx] = useState<number | null>(null);
  const status = useRuntimeStatus();
  const run = lab.runs[id];
  const latest = useRef<() => void>(() => {});

  useEffect(() => { initRuntime().catch(() => {}); }, []);
  useEffect(() => {
    const v = new EditorView({
      doc: lab.codes[id] ?? initial, parent: host.current!,
      extensions: [basicSetup, python(), theme,
        Prec.highest(keymap.of([{ key: "Mod-Enter", run: () => (latest.current(), true) }])),
        EditorView.updateListener.of((u) => u.docChanged && lab.setCode(id, u.state.doc.toString()))],
    });
    view.current = v;
    return () => v.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const doRun = async () => {
    if (busy) return;
    setBusy(true);
    try { lab.setRun(id, await runCode(view.current!.state.doc.toString())); setStepIdx(null); }
    catch (e: any) { lab.setRun(id, { out: "", err: String(e?.message ?? e), steps: [] }); }
    setBusy(false);
  };
  latest.current = doRun;
  const reset = () => view.current?.dispatch({ changes: { from: 0, to: view.current.state.doc.length, insert: initial } });

  const steps = run?.steps ?? [];
  const cur = stepIdx === null ? steps.length - 1 : Math.min(stepIdx, steps.length - 1);
  const step = steps[cur];
  const shownOut = run ? (run.err ? run.out : step ? run.out.slice(0, step.out_len) : run.out) : "";
  const chip = status.state === "loading" ? "Loading Python…" : status.state === "ready" ? "Python ready" : status.state === "error" ? "Runtime failed" : "Idle";

  return (
    <div className="lab">
      <div className="left">
        <div className="panel editor">
          <div className="panel-bar"><span>PYTHON 3 · editable</span>
            <span className="grow" />
            <button className="ghost" onClick={reset}>Reset</button>
            <button className="run" onClick={doRun} disabled={busy || status.state === "loading" || status.state === "error"}>
              {busy ? "Running…" : status.state === "loading" ? "Loading…" : "Run ▶"}
            </button>
          </div>
          <div className="cm-host" ref={host} />
        </div>
        <div className="panel output">
          <div className="panel-bar"><span>OUTPUT</span><span className="grow" />
            <span className={"status " + status.state}>{chip}</span>
            {status.state === "error" && <button className="ghost" onClick={() => initRuntime().catch(() => {})}>Retry</button>}
          </div>
          <pre>
            {status.state === "error" && <span className="err">{status.error}{"\n"}</span>}
            {shownOut}
            {run?.err && <span className="err">{run.err}</span>}
            {!run && status.state !== "error" && <span className="dim">Ctrl/⌘ + Enter to run</span>}
          </pre>
        </div>
      </div>
      <div className="right">
        {side ? <div className="panel side-panel">{side}</div> : (
        <div className="panel diagram-panel">
          <div className="panel-bar"><span>OBJECT DIAGRAM</span><span className="grow" />
            {steps.length > 1 && (<>
              <button className="ghost" disabled={cur <= 0} onClick={() => setStepIdx(cur - 1)}>◀</button>
              <span className="stepno">after line {step?.line} · {cur + 1}/{steps.length}</span>
              <button className="ghost" disabled={cur >= steps.length - 1} onClick={() => setStepIdx(cur + 1)}>▶</button>
            </>)}
          </div>
          <ObjectDiagram step={step} />
        </div>
        )}
        <div className="callouts" style={{ minHeight: callouts.length * 68 }}>
          {callouts.slice(0, beat).map((c) => (
            <motion.div key={c.label} className={"callout " + c.color} initial={{ opacity: 0, x: 60, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 240, damping: 18 }}><b>{c.label}</b> {c.text}</motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
