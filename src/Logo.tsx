import { useState } from "react";

// Drawn approximation of the GDG "< >" mark. To use the official artwork, drop the mark as public/gdg-logo.svg.
export function Mark() {
  return (
    <svg viewBox="0 0 64 40" className="mark" aria-hidden>
      <g fill="none" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 6 L6 20" stroke="#4285F4" /><path d="M6 20 L22 34" stroke="#34A853" />
        <path d="M42 6 L58 20" stroke="#EA4335" /><path d="M58 20 L42 34" stroke="#FBBC04" />
      </g>
    </svg>
  );
}

export function Logo({ big = false }: { big?: boolean }) {
  const [img, setImg] = useState(true);
  return (
    <div className={"logo" + (big ? " big" : "")}>
      {img ? <img className="mark" src="/gdg-logo.svg" alt="" onError={() => setImg(false)} /> : <Mark />}
      <div className="logo-text"><b>Google Developer Groups</b><span>MJCET</span></div>
    </div>
  );
}
