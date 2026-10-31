import { motion } from "framer-motion";

export type SceneName = "title" | "problem" | "blueprint" | "objects" | "state" | "build" | "inherit" | "system" | "wrap";
const B = "#4285F4", R = "#EA4335", Y = "#FBBC04", G = "#34A853";

// Poster kit. Every shape persists for the whole deck; scenes only re-pose it.
// RectPose = [x, y, w, h, rx, rot, fill]  (rx morphs squircle <-> pill <-> block)
// Pose     = [x, y, scale, rot]            (scale 0 = tucked away)
type RectPose = [number, number, number, number, number, number, string];
type Pose = [number, number, number, number];
const _: Pose = [0, 0, 0, 0];
type Scene = { A: RectPose; B: RectPose; C: Pose; D: Pose; E: Pose; F: Pose; G: Pose; H: Pose; I: Pose; J: Pose };

const SCENES: Record<SceneName, Scene> = {
  title:     { A: [1180, -120, 800, 800, 200, 12, B], B: [1250, 800, 820, 220, 110, -24, R], C: [1790, 520, 2.2, 0], D: [1500, 470, 1.6, 15],
               E: [1060, 930, 1.2, -15], F: [1330, 140, .8, 20], G: _, H: [1790, 960, .9, 15], I: _, J: _ },
  problem:   { A: [1640, -170, 620, 620, 170, 15, B], B: [-300, 960, 760, 200, 100, -10, R], C: [1840, 980, 2.4, 180], D: [40, 400, 1.4, 10],
               E: _, F: [1560, 250, .6, 25], G: _, H: [1780, 650, .8, -15], I: _, J: [1860, 440, 1, 0] },
  blueprint: { A: [-430, 250, 700, 560, 120, 0, B], B: [1600, 940, 700, 210, 105, -14, R], C: [1840, 90, 2.6, 90], D: [1850, 520, 1, 20],
               E: [60, 1010, 1.1, 0], F: _, G: _, H: _, I: _, J: [1790, 800, 1, 0] },
  objects:   { A: [-250, -200, 420, 900, 210, 18, B], B: [1650, 910, 560, 200, 100, -20, R], C: [1850, -60, 2.2, 180], D: [60, 990, 1.2, 0],
               E: _, F: _, G: [1840, 520, 1, 15], H: _, I: [1760, 170, 1, 0], J: _ },
  state:     { A: [1580, 900, 820, 260, 130, -8, Y], B: [-380, 60, 560, 200, 100, 50, R], C: [1850, 60, 2.4, 180], D: [1810, 560, 1.3, 0],
               E: _, F: [1840, 800, .7, 20], G: _, H: [60, 940, 1.3, -10], I: _, J: [1850, 330, 1, 0] },
  build:     { A: [1600, -230, 640, 640, 140, -20, G], B: [-300, 940, 720, 200, 100, 6, B], C: [1860, 940, 2.6, 270], D: [30, 540, 1.1, 0],
               E: _, F: [1700, 110, .6, 30], G: [1850, 520, .9, 20], H: _, I: _, J: _ },
  inherit:   { A: [-520, 300, 620, 620, 150, 18, B], B: [1560, -120, 540, 200, 100, 28, R], C: [1860, 960, 2.4, 270], D: _,
               E: [1850, 520, 1.4, 0], F: _, G: _, H: [1840, 280, .9, 10], I: _, J: _ },
  system:    { A: [1560, 870, 700, 260, 130, -10, R], B: [-420, 60, 520, 200, 100, 40, B], C: [1850, 50, 2.6, 180], D: [1830, 420, 1.5, 0],
               E: _, F: [1770, 720, .6, 15], G: [1700, 1000, 1.0, 0], H: _, I: _, J: [1860, 620, 1, 0] },
  wrap:      { A: [1400, -100, 700, 700, 200, 14, B], B: [1300, 900, 900, 230, 115, -22, R], C: [1850, 560, 2.2, 0], D: [1500, 430, 1.4, 15],
               E: [1750, 820, 1.2, 10], F: [1700, 330, .9, 20], G: _, H: _, I: _, J: _ },
};

const spring = (i: number) => ({ type: "spring" as const, stiffness: 55, damping: 15, delay: i * 0.04 });
const own = { transformBox: "fill-box" as const, transformOrigin: "center" };
const KIT: Record<string, React.ReactNode> = {
  C: <path d="M-100 100V-100A200 200 0 0 1 100 100Z" />,                                                   // quarter circle
  D: <path d="M0-100C10-30 30-10 100 0C30 10 10 30 0 100C-10 30-30 10-100 0C-30-10-10-30 0-100Z" />,         // 4-point sparkle
  E: <path d="M-70 100V-30A70 70 0 0 1 70-30V100Z" />,                                                      // arch
  F: <g><rect x="-100" y="-34" width="200" height="68" rx="34" /><rect x="-34" y="-100" width="68" height="200" rx="34" /></g>, // plus
  G: <g>{[[-50, -50], [50, -50], [-50, 50], [50, 50]].map(([x, y]) => <circle key={x + "" + y} cx={x} cy={y} r="50" />)}</g>, // clover
  H: <polygon points="0,-70 70,55 -70,55" strokeWidth="40" strokeLinejoin="round" />,                        // soft triangle
  I: <g fill="none" strokeWidth="24" strokeLinecap="round"><path d="M-100 0A100 100 0 0 1 100 0" stroke={R} /><path d="M-66 0A66 66 0 0 1 66 0" stroke={Y} /><path d="M-32 0A32 32 0 0 1 32 0" stroke={G} /></g>, // rainbow arcs
  J: <g fill="#202124" opacity=".22">{[0, 1, 2, 3, 4].flatMap((r) => [0, 1, 2, 3].map((c) => <circle key={r + "" + c} cx={-88 + c * 58} cy={-100 + r * 50} r="9" />))}</g>, // dot grid
};

export function Geometry({ scene }: { scene: SceneName }) {
  const s = SCENES[scene];
  const drift = (i: number) => ({ animationDuration: `${9 + i * 1.3}s`, animationDelay: `-${i * 2}s` });
  const hue = (i: number, base = 16) => ({ animationDuration: `${base + i}s`, animationDelay: `-${i * 3.3}s` });
  return (
    <>
      <div className="blobs" aria-hidden><i className="blob b1" /><i className="blob b2" /><i className="blob b3" /><i className="blob b4" /></div>
      <svg className="geometry" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" aria-hidden>
        {(["A", "B"] as const).map((k, i) => {
          const [x, y, w, h, rx, rot] = s[k];
          return (
            <g key={k} className="idle" style={drift(i)}>
              <motion.rect className="churn" initial={false} animate={{ x, y, width: w, height: h, rx, rotate: rot }} transition={spring(i)} style={{ ...own, ...hue(i, 18) }} strokeWidth={0} />
            </g>
          );
        })}
        {Object.keys(KIT).map((k, i) => {
          const [x, y, sc, rot] = s[k as keyof Scene] as Pose;
          const churns = !"IJ".includes(k);
          return (
            <motion.g key={k} initial={false} animate={{ x, y, scale: sc, rotate: rot }} transition={spring(i + 2)} style={own}>
              <g className="idle" style={drift(i + 2)}><g className={churns ? "churn" : ""} style={churns ? hue(i + 2) : undefined} strokeWidth={churns ? 0 : undefined}>{KIT[k]}</g></g>
            </motion.g>
          );
        })}
      </svg>
    </>
  );
}
