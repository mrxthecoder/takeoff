import { useSyncExternalStore } from "react";
import HELPER from "./gdg_helper.py?raw";

export type Snap = {
  classes: { name: string; bases: string[]; methods: string[]; inherited: string[] }[];
  objects: { var: string; cls: string; attrs: Record<string, string> }[];
};
export type Step = Snap & { line: number; out_len: number };
export type RunResult = { out: string; err: string | null; steps: Step[] };
export type Status = { state: "idle" | "loading" | "ready" | "error"; error?: string };

const BASE: string =
  (import.meta.env.VITE_PYODIDE_URL as string | undefined) ??
  "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";

let status: Status = { state: "idle" };
let promise: Promise<any> | null = null; // ONE shared Pyodide runtime for the whole deck
const listeners = new Set<() => void>();
const set = (s: Status) => { status = s; listeners.forEach((l) => l()); };

function loadScript(src: string) {
  return new Promise<void>((res, rej) => {
    if ((window as any).loadPyodide) return res();
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => res();
    s.onerror = () => rej(new Error("Could not download the Python runtime (" + src + "). Check your connection."));
    document.head.appendChild(s);
  });
}

export function initRuntime() {
  if (!promise) {
    set({ state: "loading" });
    promise = (async () => {
      await loadScript(BASE + "pyodide.js");
      const py = await (window as any).loadPyodide({ indexURL: BASE });
      py.runPython(HELPER);
      return py;
    })();
    promise.then(
      () => set({ state: "ready" }),
      (e) => { promise = null; set({ state: "error", error: String(e?.message ?? e) }); }
    );
  }
  return promise;
}

export async function runCode(code: string): Promise<RunResult> {
  const py = await initRuntime();
  const fn = py.globals.get("gdg_run");
  try { return JSON.parse(fn(code)); } finally { fn.destroy?.(); }
}

export const useRuntimeStatus = () =>
  useSyncExternalStore((cb) => (listeners.add(cb), () => listeners.delete(cb)), () => status);
