"use client";

import { useEffect, useRef, useState } from "react";
import { DemoFlowBanner } from "../components/DemoFlowBanner";
import { Star } from "../components/Star";
import { splitAmount } from "../components/useJackpotTicker";
import "../big-jackpots.css";

const AMOUNT = 1_247_892.34;

type Suit = "♥" | "♦" | "♠" | "♣";
const isRed = (s: Suit) => s === "♥" || s === "♦";

function WinCard({ rank, suit, royal, faceDown }: { rank?: string; suit?: Suit; royal?: boolean; faceDown?: boolean }) {
  if (faceDown) {
    return (
      <div
        className="win-card"
        style={{
          background: "radial-gradient(circle at 50% 50%,#b22d2d 0%,#7a1414 55%,#4a0d10 100%)",
          backgroundImage:
            "repeating-linear-gradient(45deg,rgba(0,0,0,.18) 0 2px,transparent 2px 6px),radial-gradient(circle at 50% 50%,#b22d2d 0%,#7a1414 55%,#4a0d10 100%)",
          border: "2px solid #2a0a0a",
        }}
      />
    );
  }
  const cls = `win-card${suit && isRed(suit) ? " red" : ""}${royal ? " royal" : ""}`;
  return (
    <div className={cls}>
      <div className="pip-tl">
        <span className="r">{rank}</span>
        <span className="s">{suit}</span>
      </div>
      <div className="pip-center">{suit}</div>
    </div>
  );
}

function PersonIcon({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
    </svg>
  );
}

type ConfettoPiece = {
  left: number;
  delay: number;
  duration: number;
  color: string;
  width: number;
  height: number;
  sway: number;
  rot0: number;
};

function Confetti({ count }: { count: number }) {
  const [pieces, setPieces] = useState<ConfettoPiece[]>([]);
  useEffect(() => {
    const colors = ["#f0b41a", "#ffd44a", "#fff5c8", "#a07208", "#fff", "#1ec8a5"];
    setPieces(
      Array.from({ length: count }).map(() => ({
        left: Math.random() * 100,
        delay: Math.random() * 4,
        duration: 3 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        width: 5 + Math.random() * 6,
        height: 8 + Math.random() * 10,
        sway: (Math.random() - 0.5) * 80,
        rot0: Math.random() * 360,
      })),
    );
  }, [count]);
  return (
    <div className="confetti">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetto"
          style={{
            left: `${p.left}%`,
            width: p.width,
            height: p.height,
            background: p.color,
            animationDelay: `-${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `translateX(${p.sway}px) rotate(${p.rot0}deg)`,
          }}
        />
      ))}
    </div>
  );
}

function BackgroundTable() {
  const { dollars, cents } = splitAmount(AMOUNT);
  return (
    <>
      <div className="top-chrome">
        <div className="crumb">
          <span className="back">
            <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path d="M15 6l-6 6 6 6" />
            </svg>
            Lobby
          </span>
          <span className="sep">/</span>
          <span>Spin &amp; Go</span>
          <span className="sep">/</span>
          <span style={{ color: "var(--ink-1)" }}>Big Jackpots Hold&apos;em · $5 · #248,402,990</span>
        </div>
        <div className="right">
          <div className="bal"><span className="ccy">US$</span><span className="amt">3,840.00</span></div>
          <span style={{ color: "var(--ink-3)" }}>|</span>
          <span>StaffJamesD</span>
        </div>
      </div>

      <div className="jackpot-bg">
        <div className="star-l"><Star width={28} height={28} /></div>
        <div className="meta">
          <div className="top"><b>Big Jackpots</b> · Royal Flush wins</div>
          <div className="num">${dollars}.{cents}</div>
        </div>
      </div>

      <div className="felt">
        <div className="table-rail">
          <div className="table-felt">
            <div className="table-mark" />

            <div className="seat" style={{ left: 140, top: 28 }}>
              <div className="avatar"><PersonIcon /></div>
              <div className="cards"><div className="mini-back" /><div className="mini-back" /></div>
            </div>
            <div className="seat" style={{ right: 140, top: 28 }}>
              <div className="avatar"><PersonIcon /></div>
              <div className="cards"><div className="mini-back" /><div className="mini-back" /></div>
            </div>

            <div className="community-stage">
              <div className="pot-pill">
                <span className="lbl">Pot</span>
                <span className="amt">$1,020</span>
              </div>
              <div className="community">
                <WinCard rank="A" suit="♥" royal />
                <WinCard rank="K" suit="♥" royal />
                <WinCard rank="7" suit="♣" />
                <WinCard rank="10" suit="♥" royal />
                <WinCard rank="3" suit="♦" />
              </div>
            </div>

            <div className="hero-area">
              <div className="hero-cards">
                <WinCard rank="Q" suit="♥" royal />
                <WinCard rank="J" suit="♥" royal />
              </div>
              <div className="avatar"><PersonIcon size={26} /></div>
              <div className="name-stack">
                <div className="name">StaffJamesD</div>
                <div className="stack">$3,840</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="actions">
        <button className="btn btn-ghost" type="button">Fold</button>
        <button className="btn btn-ghost btn-stack" type="button"><span>Check</span></button>
        <button className="btn btn-teal btn-stack" type="button"><span>Raise</span></button>
      </div>
    </>
  );
}

function StageLayer({ stage, confettiCount }: { stage: number; confettiCount: number }) {
  const { dollars, cents } = splitAmount(AMOUNT);
  return (
    <div className={`stage-layer s${stage}`}>
      <div className="rays" />
      <div className="center-glow" />
      <Confetti count={confettiCount} />

      {stage === 1 && (
        <div className="trigger-overlay">
          <div className="trigger-flash" />
          <div className="trigger-msg">
            <div className="pulse-dot" />
            <div>
              <div className="label">Big Jackpots · trigger detected</div>
              <div className="text">
                You&apos;ve made a Royal Flush
                <small>Hold position, prize reveal incoming…</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {stage >= 2 && (
        <div className="climax">
          <div className="announce">
            <div className="kicker">Big Jackpots · Hold&apos;em</div>
            <div className="title">Royal Flush</div>
            {stage === 2 && <div className="sub">Hearts · 10 J Q K A</div>}
          </div>

          <div className="royal-hand">
            <WinCard rank="10" suit="♥" />
            <WinCard rank="J" suit="♥" />
            <WinCard rank="Q" suit="♥" />
            <WinCard rank="K" suit="♥" />
            <WinCard rank="A" suit="♥" />
          </div>

          {stage >= 3 && (
            <div className="big-num-wrap">
              <div className="you-win">You win</div>
              <div className="big-num">
                <span className="d">$</span>{dollars}<span className="c">.{cents}</span>
              </div>
            </div>
          )}

          {stage === 4 && (
            <div className="collect">
              <div className="ctas">
                <button className="collect-btn primary" type="button">
                  Collect winnings
                  <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
                <button className="collect-btn ghost" type="button">Share win</button>
                <button className="collect-btn ghost" type="button">Replay hand</button>
              </div>
              <div className="meta">
                <span>Posted to your balance · <b>US$ 1,251,732.34</b></span>
                <span>Hand <b>#248,402,990</b></span>
                <span>Cleared in <b>~2 min</b></span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PlayerTag() {
  return (
    <div className="player-tag">
      <div className="avatar"><PersonIcon size={14} /></div>
      <span>StaffJamesD took the jackpot at Spin &amp; Go Big Jackpots Hold&apos;em $5</span>
    </div>
  );
}

export default function BigJackpotsWin() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(3);
  const [confettiCount] = useState(90);
  const replayTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const fit = () => {
      const c = canvasRef.current;
      if (!c) return;
      const s = Math.min(window.innerWidth / 1600, window.innerHeight / 1000);
      c.style.transform = `scale(${s})`;
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  useEffect(() => () => {
    replayTimeoutsRef.current.forEach(clearTimeout);
  }, []);

  const replay = () => {
    replayTimeoutsRef.current.forEach(clearTimeout);
    replayTimeoutsRef.current = [];
    setStage(1);
    const steps: { s: number; t: number }[] = [
      { s: 2, t: 1600 },
      { s: 3, t: 1700 },
      { s: 4, t: 2400 },
    ];
    let acc = 0;
    steps.forEach(({ s, t }) => {
      acc += t;
      replayTimeoutsRef.current.push(setTimeout(() => setStage(s), acc));
    });
  };

  const canvasClass = `canvas${stage >= 2 ? " dim" : ""} s${stage}-active`;

  return (
    <div className="bj-root bj-canvas-host">
      <DemoFlowBanner current="win" floating />
      <div className="stage">
        <div className={canvasClass} ref={canvasRef}>
          <BackgroundTable />
          <StageLayer stage={stage} confettiCount={confettiCount} />
          <PlayerTag />
        </div>
      </div>

      <div className="stage-picker">
        <div className="label">Stage</div>
        <div className="row">
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              type="button"
              className={stage === n ? "active" : ""}
              onClick={() => setStage(n)}
            >
              {n}
            </button>
          ))}
        </div>
        <button type="button" className="replay" onClick={replay}>▸ Replay 1→4</button>
      </div>
    </div>
  );
}
