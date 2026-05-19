import { Fragment } from "react";
import Link from "next/link";

type Step = "lobby" | "play" | "win";

const STEPS: { key: Step; label: string; href: string }[] = [
  { key: "lobby", label: "★ Lobby", href: "/big-jackpots" },
  { key: "play", label: "In-game HUD", href: "/big-jackpots/play" },
  { key: "win", label: "Win moment", href: "/big-jackpots/win" },
];

export function DemoFlowBanner({ current, floating = false }: { current: Step; floating?: boolean }) {
  return (
    <div className={`demo-flow${floating ? " floating" : ""}`}>
      {STEPS.map((s, i) => {
        const here = s.key === current;
        const labelText = here && s.key === current && i === 0 ? s.label : s.label.replace(/^★ /, "");
        return (
          <Fragment key={s.key}>
            {i > 0 && <span className="arrow">→</span>}
            {here ? (
              <span className="step here">{i === 0 ? labelText : `★ ${labelText}`}</span>
            ) : (
              <span className="step">
                <Link href={s.href}>{labelText}</Link>
              </span>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
