"use client";

import { useEffect, useRef } from "react";
import { DemoFlowBanner } from "../components/DemoFlowBanner";
import { Star } from "../components/Star";
import { useJackpotTicker, splitAmount } from "../components/useJackpotTicker";
import "../big-jackpots.css";

type Suit = "♥" | "♦" | "♠" | "♣";
const isRed = (s: Suit) => s === "♥" || s === "♦";

function Card({ rank, suit, faceDown, lg }: { rank?: string; suit?: Suit; faceDown?: boolean; lg?: boolean }) {
  const cls = `card${lg ? " lg" : ""}${faceDown ? " face-down" : ""}${!faceDown && suit ? (isRed(suit) ? " red" : " black") : ""}`;
  if (faceDown) return <div className={cls} />;
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

function MiniCard({ rank, suit }: { rank: string; suit: Suit }) {
  return (
    <div className="mini-card" style={{ color: isRed(suit) ? "#c81e1e" : "#0a0a0a" }}>
      <span>{rank}</span>
      <span className="pip">{suit}</span>
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

function Jackpot({ amount }: { amount: number }) {
  const { dollars, cents } = splitAmount(amount);
  return (
    <div className="jackpot pulse">
      <span className="lzg-spark s1">✦</span>
      <span className="lzg-spark s2">✦</span>
      <div className="lzg-mark">
        <div className="lzg-star"><Star width={28} height={28} /></div>
        <div className="lzg-meta">
          <div className="top">
            <b>Big Jackpots</b><span className="sep" />Royal Flush wins
          </div>
          <div className="lzg-num">
            <span className="dollar">$</span>{dollars}<span className="cents">.{cents}</span>
          </div>
        </div>
      </div>
      <div className="lzg-cards">
        <MiniCard rank="10" suit="♥" />
        <MiniCard rank="J" suit="♥" />
        <MiniCard rank="Q" suit="♥" />
        <MiniCard rank="K" suit="♥" />
        <MiniCard rank="A" suit="♥" />
      </div>
    </div>
  );
}

type SeatProps = {
  left?: number;
  right?: number;
  top?: number;
  name: string;
  stack: number;
  acting?: boolean;
  bet?: number;
  fold?: boolean;
};

function Seat({ left, right, top, name, stack, acting, bet, fold }: SeatProps) {
  const pos = right != null ? { right, top } : { left, top };
  return (
    <div className={`seat${acting ? " acting" : ""}`} style={{ ...pos, opacity: fold ? 0.4 : 1 }}>
      <div className="avatar"><PersonIcon /></div>
      <div className="cards">
        {!fold && (
          <>
            <Card faceDown />
            <Card faceDown />
          </>
        )}
      </div>
      <div className="name-stack">
        <div className="name">{name}</div>
        <div className="stack">{stack.toLocaleString()}</div>
      </div>
      {bet != null && (
        <div className="bet" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: -28 }}>
          <span className="coin" />{bet.toLocaleString()}
        </div>
      )}
    </div>
  );
}

function Crawler() {
  const items = [
    { who: "lucky_lou", amt: "$1,108,420", when: "2d ago" },
    { who: "pocket_kings", amt: "$842,150", when: "8d ago" },
    { who: "flush_doctor", amt: "$2,201,008", when: "14d ago" },
    { who: "rivermonkey", amt: "$674,330", when: "21d ago" },
    { who: "allinanne", amt: "$1,540,200", when: "32d ago" },
  ];
  const all = [...items, ...items];
  return (
    <div className="crawl">
      <div className="crawl-track">
        <span className="item"><span style={{ color: "#f0b41a" }}>RECENT WINNERS</span></span>
        {all.map((it, i) => (
          <span className="item" key={i}>
            <span className="dot" />
            <b>{it.amt}</b>
            <span>{it.who}</span>
            <span style={{ color: "var(--ink-3)" }}>· {it.when}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function TopChrome() {
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
          <div className="icon-btn">
            <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </div>
          <div className="icon-btn">
            <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </div>
        </div>
      </div>

      <div className="contrib">
        <Star width={12} height={12} />
        You&apos;ve added <span className="amt">$0.34</span> to the jackpot this session
      </div>
    </>
  );
}

function Table() {
  return (
    <>
      <div className="table-meta">
        <span>Spin &amp; Go · Hold&apos;em</span>
        <span className="dot" />
        <span className="blinds">$10 / $20</span>
        <span className="dot" />
        <span className="level">Level 4 · 0:42</span>
      </div>
      <div className="table-meta-r">
        <span className="pill">Hand #248,402,990</span>
      </div>

      <div className="felt">
        <div className="table-rail">
          <div className="table-felt">
            <div className="table-mark" />

            <Seat left={140} top={28} name="lucky_lou" stack={2340} bet={200} />
            <Seat right={140} top={28} name="rivermonkey" stack={1820} acting bet={400} />

            <div className="table-center">
              <div className="pot-pill">
                <span className="lbl">Pot</span>
                <span className="amt">$1,020</span>
              </div>
              <div className="community">
                <Card rank="A" suit="♥" lg />
                <Card rank="K" suit="♥" lg />
                <Card rank="7" suit="♣" lg />
                <div className="slot-empty" />
                <div className="slot-empty" />
              </div>
              <div className="chips">
                <div className="chip-stack">
                  <div className="chip" />
                  <div className="chip" />
                  <div className="chip" />
                  <div className="chip" />
                </div>
              </div>
            </div>

            <div className="dealer-btn" style={{ left: "36%", top: "36%" }}>D</div>

            <div className="hero-seat">
              <div style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
                <div className="cards">
                  <Card rank="Q" suit="♥" lg />
                  <Card rank="J" suit="♥" lg />
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div className="avatar"><PersonIcon size={26} /></div>
                  <div className="name-stack">
                    <div className="name">StaffJamesD</div>
                    <div className="stack">$3,840</div>
                  </div>
                </div>
                <div className="cards" style={{ opacity: 0, pointerEvents: "none" }}>
                  <Card faceDown lg />
                </div>
              </div>
              <div className="bet" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", top: -38 }}>
                <span className="coin" />400
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Chat() {
  return (
    <div className="chat">
      <div className="chat-head">
        <span>Table chat</span>
        <span style={{ color: "var(--ink-3)" }}>3</span>
      </div>
      <div className="chat-body">
        <div className="chat-msg sys">
          <div className="who">SYSTEM</div>
          <div className="what">Big Jackpots round — Royal Flush wins $1,247,892</div>
        </div>
        <div className="chat-msg">
          <div className="who">lucky_lou</div>
          <div className="what">gl all</div>
        </div>
        <div className="chat-msg">
          <div className="who">rivermonkey</div>
          <div className="what">come on hearts 🤞</div>
        </div>
        <div className="chat-msg sys">
          <div className="who">DEALER</div>
          <div className="what">Flop: A♥ K♥ 7♣</div>
        </div>
      </div>
      <div className="chat-input">Type a message…</div>
    </div>
  );
}

function ActionBar() {
  return (
    <div className="actions">
      <button className="btn btn-ghost" type="button">Fold</button>
      <button className="btn btn-ghost btn-stack" type="button">
        <span>Check</span>
        <span className="sub">no bet to call</span>
      </button>
      <button className="btn btn-teal btn-stack" type="button">
        <span>Raise</span>
        <span className="sub">to $800</span>
      </button>
      <div className="bet-controls">
        <span className="label">Bet</span>
        <button className="step-btn" type="button">−</button>
        <span className="val">$800</span>
        <button className="step-btn" type="button">+</button>
        <div className="quick">
          <button type="button">½ pot</button>
          <button type="button">pot</button>
          <button type="button">all-in</button>
        </div>
      </div>
    </div>
  );
}

export default function BigJackpotsPlay() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const amount = useJackpotTicker();

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

  return (
    <div className="bj-root bj-canvas-host">
      <DemoFlowBanner current="play" floating />
      <div className="stage">
        <div className="canvas" ref={canvasRef}>
          <TopChrome />
          <Jackpot amount={amount} />
          <Table />
          <Crawler />
          <Chat />
          <ActionBar />
        </div>
      </div>
    </div>
  );
}
