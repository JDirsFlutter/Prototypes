"use client";

import { useEffect, useState } from "react";

// Rake-fed growth rate from the source HTML: ~$0.55/sec average,
// modelled as 0.4 + Math.random()*0.5 per second.
const INITIAL = 1_247_892.34;

export function useJackpotTicker(initial: number = INITIAL) {
  const [amount, setAmount] = useState(initial);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setAmount((a) => a + dt * (0.4 + Math.random() * 0.5));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return amount;
}

export function splitAmount(amount: number) {
  const dollars = Math.floor(amount);
  const cents = (amount - dollars).toFixed(2).slice(2);
  return { dollars: dollars.toLocaleString("en-US"), cents };
}
