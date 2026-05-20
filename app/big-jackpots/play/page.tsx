"use client";

import dynamic from "next/dynamic";

// The play page is fully interactive (shuffled deck, randomised AI, RAF tickers)
// and has no meaningful SSR output — anything we render server-side just
// freezes the page until hydration completes. Rendering client-only avoids
// that, and matches how the lobby/win pages behave once they animate.
const PlayClient = dynamic(() => import("./PlayClient"), {
  ssr: false,
  loading: () => (
    <div className="bj-root bj-canvas-host">
      <div className="stage">
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            color: "#6a6a70",
            fontSize: 13,
            letterSpacing: ".14em",
            textTransform: "uppercase",
          }}
        >
          Loading table…
        </div>
      </div>
    </div>
  ),
});

export default function BigJackpotsPlayPage() {
  return <PlayClient />;
}
