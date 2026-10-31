import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Geometry } from "./Geometry";
import { LabCtx, type Lab } from "./CodeLab";
import { BeatCtx } from "./beats";
import { Logo } from "./Logo";
import { SLIDES } from "./slides";
import type { RunResult } from "./runtime";

type Pos = { i: number; beat: number };
const beatsOf = (i: number) => SLIDES[i].beats ?? 0;
const nextPos = (p: Pos): Pos => p.beat < beatsOf(p.i) ? { i: p.i, beat: p.beat + 1 } : p.i < SLIDES.length - 1 ? { i: p.i + 1, beat: 0 } : p;
const prevPos = (p: Pos): Pos => p.beat > 0 ? { i: p.i, beat: p.beat - 1 } : p.i > 0 ? { i: p.i - 1, beat: beatsOf(p.i - 1) } : p;
const chan = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("gdg-takeoff") : null;
const COLORS = ["#4285F4", "#EA4335", "#FBBC04", "#34A853"];

function Burst({ onDone }: { onDone: () => void }) {
  const bits = useMemo(() => Array.from({ length: 26 }, (_, k) => {
    const a = (k / 26) * Math.PI * 2 + Math.random() * 0.4, d = 380 + Math.random() * 560, w = 28 + Math.random() * 46, kind = k % 3;
    return { k, x: Math.cos(a) * d, y: Math.sin(a) * d, r: Math.random() * 540 - 270, c: COLORS[k % 4], w, h: kind === 1 ? w * 2.4 : kind === 2 ? w * 0.5 : w };
  }), []);
  useEffect(() => { const t = setTimeout(onDone, 1600); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="burst">{bits.map((b) => (
      <motion.span key={b.k} className="bit" style={{ background: b.c, width: b.w, height: b.h }} initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
        animate={{ x: b.x, y: b.y, scale: [0, 1.3, 1], rotate: b.r, opacity: [1, 1, 0] }} transition={{ duration: 1.4, ease: "easeOut" }} />))}
    </div>
  );
}

function Presenter() {
  const [pos, setPos] = useState<Pos>({ i: 0, beat: 0 });
  const [t0] = useState(Date.now()); const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!chan) return;
    chan.onmessage = (e) => e.data?.type === "state" && setPos({ i: e.data.i, beat: e.data.beat });
    chan.postMessage({ type: "hello" });
    const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id);
  }, []);
  const s = SLIDES[pos.i], nx = SLIDES[Math.min(SLIDES.length - 1, pos.i + 1)];
  const mm = Math.floor((now - t0) / 60000), ss = String(Math.floor(((now - t0) % 60000) / 1000)).padStart(2, "0");
  const cues = ["Slide opens — " + s.say, ...(s.script ?? [])];
  return (
    <div className="presenter">
      <div className="p-top"><b>{String(pos.i + 1).padStart(2, "0")} / {SLIDES.length}</b><span>{s.kicker || "TITLE"}</span><em>{mm}:{ss}</em></div>
      <ol>{cues.map((c, k) => (<li key={k} className={k === pos.beat ? "now" : k < pos.beat ? "done" : ""}>{c}</li>))}</ol>
      <div className="p-next">NEXT SLIDE: {nx.kicker || "—"} — {nx.say}</div>
      <div className="p-btns"><button onClick={() => chan?.postMessage({ cmd: "prev" })}>← Back</button><button onClick={() => chan?.postMessage({ cmd: "burst" })}>✦ Burst</button><button onClick={() => chan?.postMessage({ cmd: "next" })}>Next →</button></div>
    </div>
  );
}

function Deck() {
  const [pos, setPos] = useState<Pos>(() => ({ i: Math.min(SLIDES.length - 1, Math.max(0, (parseInt(location.hash.slice(1)) || 1) - 1)), beat: 0 }));
  const [scale, setScale] = useState(1);
  const [bursts, setBursts] = useState<number[]>([]);
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [runs, setRuns] = useState<Record<string, RunResult>>({});
  const lab = useMemo<Lab>(() => ({ codes, runs,
    setCode: (id, c) => setCodes((s) => ({ ...s, [id]: c })), setRun: (id, r) => setRuns((s) => ({ ...s, [id]: r })) }), [codes, runs]);
  const prevI = useRef(pos.i); const dir = pos.i >= prevI.current ? 1 : -1;
  useEffect(() => { prevI.current = pos.i; location.hash = String(pos.i + 1); chan?.postMessage({ type: "state", ...pos }); }, [pos]);

  const next = useCallback(() => setPos(nextPos), []); const prev = useCallback(() => setPos(prevPos), []);
  const burst = useCallback(() => setBursts((b) => [...b, Date.now() + Math.random()]), []);
  const fullscreen = () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen());
  useEffect(() => {
    const fit = () => setScale(Math.min(innerWidth / 1920, innerHeight / 1080));
    fit(); addEventListener("resize", fit); return () => removeEventListener("resize", fit);
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest?.(".cm-editor") || e.metaKey || e.ctrlKey || e.altKey) return; // typing in the editor never moves the deck
      if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); next(); }
      else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); prev(); }
      else if (e.key === " ") { e.preventDefault(); (document.activeElement as HTMLElement)?.blur?.(); burst(); }
      else if (e.key === "Home") setPos({ i: 0, beat: 0 }); else if (e.key === "End") setPos({ i: SLIDES.length - 1, beat: 0 });
      else if (e.key.toLowerCase() === "f") fullscreen();
    };
    addEventListener("keydown", onKey); return () => removeEventListener("keydown", onKey);
  }, [next, prev, burst]);
  useEffect(() => { // presenter window can drive the deck
    if (!chan) return;
    chan.onmessage = (e) => { const d = e.data; if (d?.cmd === "next") next(); else if (d?.cmd === "prev") prev(); else if (d?.cmd === "burst") burst();
      else if (d?.type === "hello") chan.postMessage({ type: "state", ...pos }); };
  }, [next, prev, burst, pos]);

  const s = SLIDES[pos.i], beats = beatsOf(pos.i);
  return (
    <LabCtx.Provider value={lab}>
      <BeatCtx.Provider value={pos.beat}>
        <div className="letterbox">
          <div className="stage" data-beat={pos.beat} data-beats={beats} style={{ transform: `translate(-50%,-50%) scale(${scale})` }}>
            <Geometry scene={s.scene} />
            <div className="ribbon" />
            <AnimatePresence mode="wait">
              <motion.section key={s.id} className="slide" initial={{ opacity: 0, x: 80 * dir }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 * dir }} transition={{ duration: 0.28, ease: "easeOut" }}>
                {!s.bare && (<header><div className="kicker">{s.kicker}</div>
                  <div className="meta">{s.mins ? `${s.mins} MIN / 90-MIN WORKSHOP` : ""}
                    {s.phase !== undefined && <span className="phases">{["PROBLEM", "MODEL", "OBJECTS", "WORKING SYSTEM"].map((n, k) => (<i key={n} className={k === s.phase ? "on" : ""}>{n}</i>))}</span>}</div>
                  <h2>{s.title}</h2></header>)}
                {s.body}
              </motion.section>
            </AnimatePresence>
            {bursts.map((id) => (<Burst key={id} onDone={() => setBursts((b) => b.filter((x) => x !== id))} />))}
            <footer className="nav">
              <Logo />
              <div className="dots">{SLIDES.map((d, k) => (<button key={d.id} aria-label={`Slide ${k + 1}`} className={k === pos.i ? "on" : k < pos.i ? "done" : ""} onClick={() => setPos({ i: k, beat: 0 })} />))}</div>
              {beats > 0 && <span className="beats" aria-label={`Beat ${pos.beat} of ${beats}`}>{Array.from({ length: beats }, (_, k) => (<i key={k} className={k < pos.beat ? "on" : ""} />))}</span>}
              <span className="count">{String(pos.i + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}</span>
              <button className="navbtn" onClick={prev} disabled={pos.i === 0 && pos.beat === 0} aria-label="Previous">←</button>
              <button className="navbtn" onClick={next} disabled={pos.i === SLIDES.length - 1 && pos.beat === beats} aria-label="Next">→</button>
              <button className="navbtn" onClick={fullscreen} aria-label="Toggle fullscreen" title="Fullscreen (F)">⛶</button>
            </footer>
          </div>
        </div>
      </BeatCtx.Provider>
    </LabCtx.Provider>
  );
}

export default function App() { return location.search.includes("presenter") ? <Presenter /> : <Deck />; }
