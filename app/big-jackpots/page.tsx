"use client";

import { useState } from "react";
import Link from "next/link";
import { DemoFlowBanner } from "./components/DemoFlowBanner";
import { Star } from "./components/Star";
import { useJackpotTicker, splitAmount } from "./components/useJackpotTicker";
import "./big-jackpots.css";

type Stake = { buyIn: string; topPrize: string; selected?: boolean };

const STAKES: Stake[] = [
  { buyIn: "$0.50", topPrize: "$5,000", selected: true },
  { buyIn: "$1", topPrize: "$10,000" },
  { buyIn: "$2", topPrize: "$20,000" },
  { buyIn: "$5", topPrize: "$50,000" },
  { buyIn: "$10", topPrize: "$100,000" },
  { buyIn: "$25", topPrize: "$250,000" },
  { buyIn: "$50", topPrize: "$500,000" },
  { buyIn: "$100", topPrize: "$1,000,000" },
];

const RECENT_WINNERS = [
  { amt: "$1,108,420", who: "lucky_lou", when: "2d ago" },
  { amt: "$842,150", who: "pocket_kings", when: "8d ago" },
  { amt: "$2,201,008", who: "flush_doctor", when: "14d ago" },
  { amt: "$674,330", who: "rivermonkey", when: "21d ago" },
  { amt: "$1,540,200", who: "allinanne", when: "32d ago" },
];

const SUB_NAV = [
  "Home",
  "Anniversary Series",
  "Spin & Go",
  "Big Jackpots",
  "Power Path",
  "Cash Games",
  "All-In Poker",
  "MTTs",
  "PokerStars Learn",
  "How to Play",
  "Tournaments",
  "Home Games",
];

function InfoIcon() {
  return <div className="info-i">i</div>;
}

function JackpotTag() {
  return (
    <div className="jp-tag">
      <Star width={9} height={9} />
      JACKPOT
    </div>
  );
}

function MiniCard({ rank, p }: { rank: string; p: string }) {
  return (
    <div className="mc">
      {rank}
      <span className="p">{p}</span>
    </div>
  );
}

function PersonIcon({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
    </svg>
  );
}

export default function BigJackpotsLobby() {
  const [variant, setVariant] = useState<"holdem" | "omaha">("holdem");
  const amount = useJackpotTicker();
  const { dollars, cents } = splitAmount(amount);
  const tileJackpotText = `$${dollars}`;

  return (
    <div className="bj-root" style={{ minHeight: "100vh" }}>
      <DemoFlowBanner current="lobby" />

      {/* Utility strip */}
      <div className="utility">
        <div className="l">
          <a href="#">Promotions</a>
          <a href="#">PokerStars Rewards</a>
          <a href="#">Challenges</a>
          <a href="#">Store</a>
        </div>
        <div className="r">
          <a href="#">Set Limits</a>
          <a href="#">Responsible Gaming</a>
          <a href="#">Help</a>
        </div>
      </div>

      {/* Brand bar */}
      <div className="brand">
        <div className="brand-left">
          <div className="star">★</div>
          <div className="brand-nav">
            <a href="#" className="active">POKER</a>
            <a href="#">CASINO</a>
            <a href="#">SPORTS</a>
          </div>
        </div>

        <div />

        <div className="brand-right">
          <div className="rewards-widget">
            <div className="wm">★ POKERSTARS <span className="label">REWARDS</span></div>
            <div className="progress">Start</div>
          </div>
          <div className="bal">
            <span className="ccy">US$</span>
            <span className="amt">3,840</span>
            <span className="cents">.00</span>
          </div>
          <div className="acct">
            <span className="av">●</span>
            <span>StaffJamesD</span>
          </div>
          <button className="deposit" type="button">Deposit</button>
        </div>
      </div>

      {/* Sub-nav */}
      <nav className="sub-nav">
        {SUB_NAV.map((label) => {
          const isBigJackpots = label === "Big Jackpots";
          return (
            <a key={label} href="#" className={`tab${isBigJackpots ? " active" : ""}`}>
              {isBigJackpots && <span className="play-badge">PLAY</span>}
              {label}
            </a>
          );
        })}
      </nav>

      {/* Filter row */}
      <div className="filter-row">
        <button
          className={`pill${variant === "holdem" ? " active" : ""}`}
          type="button"
          onClick={() => setVariant("holdem")}
        >
          Hold&apos;em
        </button>
        <button
          className={`pill${variant === "omaha" ? " active" : ""}`}
          type="button"
          onClick={() => setVariant("omaha")}
        >
          Omaha
        </button>
      </div>

      <main className="lobby-main">
        {/* Jackpot hero */}
        <section className="hero">
          <div className="hero-mark">
            <Star className="hero-star" width={54} height={54} />
            <div className="text">
              <div className="small">Progressive · Live</div>
              <div className="big">Big Jackpots</div>
            </div>
          </div>

          <div className="hero-num">
            <div className="label">Current jackpot</div>
            <div className="num">
              <span className="d">$</span>
              <span>{dollars}</span>
              <span className="c">.<span>{cents}</span></span>
            </div>
          </div>

          <div className="hero-trigger">
            <div className="row">
              <span className="lbl">Trigger</span>
              <span className="hand">Royal Flush</span>
            </div>
            <div className="cards">
              <MiniCard rank="10" p="♥" />
              <MiniCard rank="J" p="♥" />
              <MiniCard rank="Q" p="♥" />
              <MiniCard rank="K" p="♥" />
              <MiniCard rank="A" p="♥" />
            </div>
            <div className="stat">
              Rake-fed · grows ~<b>$0.55/sec</b>
              <br />4 winners this month · avg <b>$1.1M</b>
            </div>
          </div>
        </section>

        {/* Recent winners marquee */}
        <div className="recent">
          <span className="lbl">Recent winners</span>
          <div className="track">
            {[...RECENT_WINNERS, ...RECENT_WINNERS].map((w, i) => (
              <span className="item" key={i}>
                <b>{w.amt}</b>
                <span>{w.who} · {w.when}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="content">
          <div>
            <div className="stake-head">
              <h2>Pick your stake</h2>
              <div className="meta">
                All buy-ins share the same jackpot · <b>+${dollars}</b>
              </div>
            </div>

            <div className="tile-grid">
              {STAKES.map((s) => (
                <Link
                  key={s.buyIn}
                  href="/big-jackpots/play"
                  className={`tile${s.selected ? " selected" : ""}`}
                >
                  <div className="top">
                    <InfoIcon />
                    <JackpotTag />
                  </div>
                  <div>
                    <div className="row">
                      <div className="lbl">Buy-In</div>
                      <div className="val">{s.buyIn}</div>
                    </div>
                    <div className="row" style={{ marginTop: 14 }}>
                      <div className="lbl">Top Prize</div>
                      <div className="val">{s.topPrize}</div>
                    </div>
                  </div>
                  <div className="jp-strip">
                    <span className="l">+ Royal Flush</span>
                    <span className="v gold-num-mini">{tileJackpotText}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <aside className="promo">
            <div className="logo">
              <Star className="star-l" width={42} height={42} />
              <div className="wm">
                <div className="s">Progressive · Hold&apos;em</div>
                <div className="b">Big Jackpots</div>
              </div>
            </div>

            <p className="copy">
              A new Spin &amp; Go variant with a shared rake-fed jackpot that pays out whenever
              any player hits a <b style={{ color: "#fff" }}>Royal Flush</b>. Same fast-paced
              3-handed format. Same buy-ins you know. One growing prize. <a href="#">How it works.</a>
            </p>

            <div className="how">
              <h3>— How the jackpot works</h3>
              <div className="step">
                <div className="n">1</div>
                <div className="t">
                  <b>Sit down at any stake</b>
                  A small slice of every rake feeds the live jackpot — you&apos;ll see your
                  contribution at the table.
                </div>
              </div>
              <div className="step">
                <div className="n">2</div>
                <div className="t">
                  <b>Make a Royal Flush</b>
                  Combine your hole cards with the board to make 10♥ J♥ Q♥ K♥ A♥ in any suit.
                </div>
              </div>
              <div className="step">
                <div className="n">3</div>
                <div className="t">
                  <b>Collect the pot</b>
                  Your hand wins the round AND the full progressive jackpot — straight to your balance.
                </div>
              </div>
            </div>

            <div className="cta-block">
              <Link className="play-cta" href="/big-jackpots/play">
                Play Now
                <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <div className="sub-cta">
                Selecting <b>$0.50 Big Jackpots Hold&apos;em</b> · 3 players · ~6 min hands
              </div>
            </div>

            <div className="winners-list">
              <h3>
                Recent winners <a href="#">View all →</a>
              </h3>
              {[
                { who: "lucky_lou", note: "$0.50 Big Jackpots · 2 days ago", amt: "$1,108,420" },
                { who: "pocket_kings", note: "$5 Big Jackpots · 8 days ago", amt: "$842,150" },
                { who: "flush_doctor", note: "$2 Big Jackpots · 14 days ago", amt: "$2,201,008" },
                { who: "rivermonkey", note: "$1 Big Jackpots · 21 days ago", amt: "$674,330" },
              ].map((w) => (
                <div className="w" key={w.who}>
                  <div className="av"><PersonIcon /></div>
                  <div className="info"><b>{w.who}</b><span>{w.note}</span></div>
                  <div className="amt">{w.amt}</div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>

      <footer className="lobby-footer">
        18+ · Play responsibly · Eligibility and terms apply. Jackpot pays once per qualifying
        hand to the player making the Royal Flush. <a href="#">Full rules</a>
      </footer>
    </div>
  );
}
