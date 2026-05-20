"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DemoFlowBanner } from "../components/DemoFlowBanner";
import { Star } from "../components/Star";
import { useJackpotTicker, splitAmount } from "../components/useJackpotTicker";
import "../big-jackpots.css";

type Suit = "♥" | "♦" | "♠" | "♣";
type Rank = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
type Card = { rank: Rank; suit: Suit };

const SUITS: Suit[] = ["♥", "♦", "♠", "♣"];
const RANKS: Rank[] = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
const isRed = (s: Suit) => s === "♥" || s === "♦";

function freshDeck(): Card[] {
  const d: Card[] = [];
  for (const s of SUITS) for (const r of RANKS) d.push({ rank: r, suit: s });
  return d;
}
function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const RAKE_RATE = 0.015; // 1.5% of every bet feeds the jackpot lozenge
const SB = 10;
const BB = 20;
const STARTING_STACK_HERO = 3840;
const STARTING_STACK_AI_L = 2340;
const STARTING_STACK_AI_R = 1820;

type PlayerId = "L" | "R" | "H";

type Player = {
  id: PlayerId;
  name: string;
  stack: number;
  hole: [Card, Card] | null;
  contribRound: number;
  contribHand: number;
  folded: boolean;
  allIn: boolean;
};

type Phase = "dealing" | "betting" | "deal-flop" | "deal-turn" | "deal-river" | "showdown" | "hand-over";
type Round = "preflop" | "flop" | "turn" | "river" | "complete";

type State = {
  players: Record<PlayerId, Player>;
  order: PlayerId[];           // seating order for turn rotation (preflop / postflop differ)
  community: Card[];           // up to 5
  deck: Card[];
  pot: number;
  currentBet: number;          // highest contribRound this round
  toAct: PlayerId | null;
  lastAggressor: PlayerId | null;
  round: Round;
  phase: Phase;
  handNumber: number;
  log: { who: string; text: string }[];
  winnerId: PlayerId | null;
  winnerNote: string;
  riggedNext: boolean;
};

// ───────── Helpers ─────────

function activePlayers(s: State) {
  return s.order.filter((id) => !s.players[id].folded);
}

function nextActor(s: State, from: PlayerId): PlayerId | null {
  // Player after `from` in the order, skipping folded / all-in.
  const idx = s.order.indexOf(from);
  for (let step = 1; step <= s.order.length; step++) {
    const cand = s.order[(idx + step) % s.order.length];
    const p = s.players[cand];
    if (!p.folded && !p.allIn) return cand;
  }
  return null;
}

function bettingClosed(s: State): boolean {
  const active = activePlayers(s).map((id) => s.players[id]);
  if (active.length <= 1) return true;
  // All matched the current bet (or are all-in), and we've gone past last aggressor.
  const allMatched = active.every((p) => p.allIn || p.contribRound === s.currentBet);
  if (!allMatched) return false;
  // Pre-flop BB option: if no aggression beyond the blind, BB still gets to act.
  return true;
}

// Very lightweight hand "evaluator" — good enough for a prototype that
// already auto-rigs the royal flush flow. Picks a winner from those still in.
function pickShowdownWinner(s: State): PlayerId {
  const stillIn = activePlayers(s);
  if (stillIn.length === 1) return stillIn[0];
  // Slight hero advantage so the demo feels rewarding; otherwise random.
  if (stillIn.includes("H") && Math.random() < 0.55) return "H";
  return stillIn[Math.floor(Math.random() * stillIn.length)];
}

function isRoyalFlush(hole: [Card, Card], board: Card[]): boolean {
  if (board.length < 3) return false;
  const all = [...hole, ...board];
  for (const suit of SUITS) {
    const inSuit = all.filter((c) => c.suit === suit).map((c) => c.rank);
    const needed: Rank[] = ["10","J","Q","K","A"];
    if (needed.every((r) => inSuit.includes(r))) return true;
  }
  return false;
}

// Pull (and remove) a specific card from a deck.
function takeCard(deck: Card[], rank: Rank, suit: Suit): Card {
  const i = deck.findIndex((c) => c.rank === rank && c.suit === suit);
  if (i < 0) throw new Error(`Card ${rank}${suit} not in deck`);
  return deck.splice(i, 1)[0];
}

// Build a fresh hand state, optionally rigged so the hero gets a royal flush by river.
function startHand(handNumber: number, prev?: State, rigRoyal = false): State {
  const players: Record<PlayerId, Player> = {
    L: {
      id: "L", name: "lucky_lou",
      stack: prev?.players.L.stack ?? STARTING_STACK_AI_L,
      hole: null, contribRound: 0, contribHand: 0, folded: false, allIn: false,
    },
    R: {
      id: "R", name: "rivermonkey",
      stack: prev?.players.R.stack ?? STARTING_STACK_AI_R,
      hole: null, contribRound: 0, contribHand: 0, folded: false, allIn: false,
    },
    H: {
      id: "H", name: "StaffJamesD",
      stack: prev?.players.H.stack ?? STARTING_STACK_HERO,
      hole: null, contribRound: 0, contribHand: 0, folded: false, allIn: false,
    },
  };

  let deck = shuffle(freshDeck());

  if (rigRoyal) {
    // Hero gets Q♥ J♥; board will be seeded with 10♥ K♥ A♥ at the top of the deck
    // AFTER AI hole cards are dealt, so the flop pulls the rigged cards (not the AI cards).
    const qh = takeCard(deck, "Q", "♥");
    const jh = takeCard(deck, "J", "♥");
    players.H.hole = [qh, jh];
    // Pull the royal flop cards aside.
    const t10 = takeCard(deck, "10", "♥");
    const kh  = takeCard(deck, "K", "♥");
    const ah  = takeCard(deck, "A", "♥");
    // Deal AI hole cards from the (now reduced) deck.
    players.L.hole = [deck.shift()!, deck.shift()!];
    players.R.hole = [deck.shift()!, deck.shift()!];
    // Now prepend the royal flop so dealCardsFromTop pulls them.
    deck = [t10, kh, ah, ...deck];
  } else {
    players.L.hole = [deck.shift()!, deck.shift()!];
    players.R.hole = [deck.shift()!, deck.shift()!];
    players.H.hole = [deck.shift()!, deck.shift()!];
  }

  // Post blinds (L = SB, R = BB).
  players.L.stack -= SB; players.L.contribRound = SB; players.L.contribHand = SB;
  players.R.stack -= BB; players.R.contribRound = BB; players.R.contribHand = BB;
  const pot = SB + BB;

  // Pre-flop order: button acts first in 3-handed → H, L, R.
  const order: PlayerId[] = ["H", "L", "R"];

  return {
    players,
    order,
    community: [],
    deck,
    pot,
    currentBet: BB,
    toAct: "H",
    lastAggressor: "R", // BB closes the round if no one raises
    round: "preflop",
    phase: "betting",
    handNumber,
    log: [
      { who: "DEALER", text: `Hand #${248_402_990 + handNumber} — blinds posted ($${SB}/$${BB})` },
    ],
    winnerId: null,
    winnerNote: "",
    riggedNext: false,
  };
}

// ───────── Action helpers ─────────

type ActionKind = "fold" | "check" | "call" | "raise";

function applyAction(s: State, who: PlayerId, kind: ActionKind, raiseTo?: number): { next: State; rake: number } {
  const next: State = {
    ...s,
    players: { ...s.players, [who]: { ...s.players[who] } },
    log: s.log,
  };
  const p = next.players[who];
  let rake = 0;
  let actionText = "";

  if (kind === "fold") {
    p.folded = true;
    actionText = "folds";
  } else if (kind === "check") {
    actionText = "checks";
  } else if (kind === "call") {
    const owe = Math.min(s.currentBet - p.contribRound, p.stack);
    p.stack -= owe;
    p.contribRound += owe;
    p.contribHand += owe;
    next.pot += owe;
    if (p.stack === 0) p.allIn = true;
    rake = owe * RAKE_RATE;
    actionText = owe === 0 ? "checks" : `calls $${owe.toLocaleString()}`;
  } else if (kind === "raise") {
    const target = raiseTo ?? s.currentBet * 2;
    const owe = Math.min(target - p.contribRound, p.stack);
    p.stack -= owe;
    p.contribRound += owe;
    p.contribHand += owe;
    next.pot += owe;
    if (p.stack === 0) p.allIn = true;
    next.currentBet = Math.max(next.currentBet, p.contribRound);
    next.lastAggressor = who;
    rake = owe * RAKE_RATE;
    actionText = s.currentBet === BB && s.round === "preflop"
      ? `raises to $${p.contribRound.toLocaleString()}`
      : `${s.currentBet === 0 ? "bets" : "raises to"} $${p.contribRound.toLocaleString()}`;
  }

  next.log = [...s.log, { who: p.name, text: actionText }].slice(-8);
  next.players[who] = p;
  return { next, rake };
}

function advanceTurn(s: State): State {
  // If only one player left, hand over.
  const alive = activePlayers(s);
  if (alive.length === 1) {
    return { ...s, phase: "hand-over", round: "complete", toAct: null,
      winnerId: alive[0],
      winnerNote: `${s.players[alive[0]].name} wins $${s.pot.toLocaleString()} (others folded)`,
    };
  }

  // Find next actor.
  const cur = s.toAct!;
  const after = nextActor(s, cur);

  // Round over? Either we've cycled back to last aggressor without raises,
  // or all matched and we'd be acting on someone who already matched.
  const everyoneMatched = alive.every((id) => {
    const p = s.players[id];
    return p.allIn || p.contribRound === s.currentBet;
  });

  // Pre-flop special case: action goes back to BB even when matched at BB.
  const preflopBBOption =
    s.round === "preflop" && s.currentBet === BB && cur !== "R" && after === "R" && s.players.R.contribRound === BB && !s.players.R.folded;

  if (everyoneMatched && !preflopBBOption) {
    // Move to next street.
    return advanceStreet(s);
  }

  return { ...s, toAct: after };
}

function advanceStreet(s: State): State {
  // Reset round contributions.
  const players = { ...s.players };
  (["L","R","H"] as PlayerId[]).forEach((id) => {
    players[id] = { ...players[id], contribRound: 0 };
  });

  if (s.round === "preflop") {
    return { ...s, players, round: "flop", phase: "deal-flop", currentBet: 0, toAct: null, lastAggressor: null,
      log: [...s.log, { who: "DEALER", text: "Dealing flop…" }] };
  }
  if (s.round === "flop") {
    return { ...s, players, round: "turn", phase: "deal-turn", currentBet: 0, toAct: null, lastAggressor: null,
      log: [...s.log, { who: "DEALER", text: "Dealing turn…" }] };
  }
  if (s.round === "turn") {
    return { ...s, players, round: "river", phase: "deal-river", currentBet: 0, toAct: null, lastAggressor: null,
      log: [...s.log, { who: "DEALER", text: "Dealing river…" }] };
  }
  // After river betting → showdown.
  return { ...s, players, round: "complete", phase: "showdown", toAct: null };
}

function postflopFirstActor(s: State): PlayerId {
  // Post-flop: first active player to the left of the button → SB (L), then BB (R), then BTN (H)
  for (const id of ["L","R","H"] as PlayerId[]) {
    const p = s.players[id];
    if (!p.folded && !p.allIn) return id;
  }
  return "H";
}

function dealCardsFromTop(s: State, count: number): { cards: Card[]; deck: Card[] } {
  const cards = s.deck.slice(0, count);
  return { cards, deck: s.deck.slice(count) };
}

// ───────── Components ─────────

function CardView({ rank, suit, faceDown, lg, highlight }: { rank?: Rank; suit?: Suit; faceDown?: boolean; lg?: boolean; highlight?: boolean }) {
  const cls = `card${lg ? " lg" : ""}${faceDown ? " face-down" : ""}${!faceDown && suit ? (isRed(suit) ? " red" : " black") : ""}`;
  const style: React.CSSProperties = highlight
    ? { boxShadow: "0 4px 10px rgba(0,0,0,.45), 0 0 0 2px var(--gold), 0 0 22px rgba(240,180,26,.5)" }
    : {};
  if (faceDown) return <div className={cls} style={style} />;
  return (
    <div className={cls} style={style}>
      <div className="pip-tl"><span className="r">{rank}</span><span className="s">{suit}</span></div>
      <div className="pip-center">{suit}</div>
    </div>
  );
}

function MiniCard({ rank, suit }: { rank: string; suit: Suit }) {
  return (
    <div className="mini-card" style={{ color: isRed(suit) ? "#c81e1e" : "#0a0a0a" }}>
      <span>{rank}</span><span className="pip">{suit}</span>
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

function Jackpot({ amount, bumpKey }: { amount: number; bumpKey: number }) {
  const { dollars, cents } = splitAmount(amount);
  // Use a keyed wrapper so the animation re-runs on each contribution.
  return (
    <div key={bumpKey} className={`jackpot pulse${bumpKey > 0 ? " bj-bump" : ""}`}>
      <span className="lzg-spark s1">✦</span>
      <span className="lzg-spark s2">✦</span>
      <div className="lzg-mark">
        <div className="lzg-star"><Star width={28} height={28} /></div>
        <div className="lzg-meta">
          <div className="top"><b>Big Jackpots</b><span className="sep" />Royal Flush wins</div>
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

type Floater = { id: number; amount: number };

function JackpotFloaters({ floaters }: { floaters: Floater[] }) {
  return (
    <div style={{ position: "absolute", top: 110, right: 80, zIndex: 6, pointerEvents: "none" }}>
      {floaters.map((f) => (
        <div key={f.id} className="bj-floater">
          + ${f.amount.toFixed(2)} <span style={{ opacity: .8 }}>→ jackpot</span>
        </div>
      ))}
    </div>
  );
}

function Seat({
  side, name, stack, acting, bet, fold, holeFaceUp, hole, winner,
}: {
  side: "left" | "right";
  name: string;
  stack: number;
  acting?: boolean;
  bet?: number;
  fold?: boolean;
  holeFaceUp?: boolean;
  hole?: [Card, Card] | null;
  winner?: boolean;
}) {
  const pos = side === "left" ? { left: 140, top: 28 } : { right: 140, top: 28 };
  return (
    <div className={`seat${acting ? " acting" : ""}`} style={{ ...pos, opacity: fold ? 0.35 : 1 }}>
      <div className="avatar">
        <PersonIcon />
        {winner && (
          <div style={{
            position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
            background: "var(--gold)", color: "#1a1305", fontSize: 9, fontWeight: 800,
            letterSpacing: ".1em", padding: "2px 8px", borderRadius: 3,
          }}>WINS</div>
        )}
      </div>
      <div className="cards">
        {!fold && (
          holeFaceUp && hole ? (
            <>
              <CardView rank={hole[0].rank} suit={hole[0].suit} />
              <CardView rank={hole[1].rank} suit={hole[1].suit} />
            </>
          ) : (
            <>
              <CardView faceDown />
              <CardView faceDown />
            </>
          )
        )}
        {fold && (
          <div style={{ fontSize: 10, color: "var(--ink-3)", letterSpacing: ".14em", fontWeight: 700, padding: "20px 8px" }}>FOLDED</div>
        )}
      </div>
      <div className="name-stack">
        <div className="name">{name}</div>
        <div className="stack">${stack.toLocaleString()}</div>
      </div>
      {bet ? (
        <div className="bet" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: -28 }}>
          <span className="coin" />{bet.toLocaleString()}
        </div>
      ) : null}
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

function TopChrome({ handNumber, balance, sessionContrib }: { handNumber: number; balance: number; sessionContrib: number }) {
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
          <span style={{ color: "var(--ink-1)" }}>Big Jackpots Hold&apos;em · $5 · #{(248_402_990 + handNumber).toLocaleString()}</span>
        </div>
        <div className="right">
          <div className="bal"><span className="ccy">US$</span><span className="amt">{balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
          <span style={{ color: "var(--ink-3)" }}>|</span>
          <span>StaffJamesD</span>
        </div>
      </div>

      <div className="contrib">
        <Star width={12} height={12} />
        You&apos;ve added <span className="amt">${sessionContrib.toFixed(2)}</span> to the jackpot this session
      </div>
    </>
  );
}

function Chat({ log }: { log: { who: string; text: string }[] }) {
  return (
    <div className="chat">
      <div className="chat-head"><span>Table chat</span><span style={{ color: "var(--ink-3)" }}>{log.length}</span></div>
      <div className="chat-body">
        {log.slice(-6).map((m, i) => (
          <div className={`chat-msg${m.who === "DEALER" || m.who === "SYSTEM" ? " sys" : ""}`} key={i}>
            <div className="who">{m.who}</div>
            <div className="what">{m.text}</div>
          </div>
        ))}
      </div>
      <div className="chat-input">Type a message…</div>
    </div>
  );
}

// ───────── Main ─────────

export default function BigJackpotsPlay() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const amount = useJackpotTicker();
  const [bumpAmount, setBumpAmount] = useState(0);
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const floaterIdRef = useRef(0);
  const [sessionContrib, setSessionContrib] = useState(0.34);
  const [bumpKey, setBumpKey] = useState(0);

  const [state, setStateRaw] = useState<State | null>(null);
  const stateRef = useRef<State | null>(null);
  const setState = useCallback((updater: State | ((s: State | null) => State | null)) => {
    setStateRaw((prev) => {
      const next = typeof updater === "function" ? (updater as (s: State | null) => State | null)(prev) : updater;
      stateRef.current = next;
      return next;
    });
  }, []);
  const [betSize, setBetSize] = useState<number>(BB * 2);
  const [forceRoyalNext, setForceRoyalNext] = useState(false);

  // Defer hand init to client to avoid SSR hydration mismatch (Math.random shuffle).
  useEffect(() => {
    if (stateRef.current === null) setState(startHand(1));
  }, [setState]);

  // Canvas auto-scaling — same as before.
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

  // Adjust bet sizer min after each round
  useEffect(() => {
    if (!state) return;
    const minRaise = state.currentBet === 0 ? BB : state.currentBet * 2;
    setBetSize((v) => (v < minRaise ? minRaise : v));
  }, [state?.currentBet, state?.round]);

  const addJackpotContribution = useCallback((rakeFromBet: number, fromHero: boolean) => {
    if (rakeFromBet <= 0) return;
    // Bump the lozenge: nudge the global ticker up by the rake share.
    setBumpAmount((v) => v + rakeFromBet);
    setBumpKey((k) => k + 1);
    if (fromHero) {
      setSessionContrib((v) => v + rakeFromBet);
      const id = floaterIdRef.current++;
      setFloaters((arr) => [...arr, { id, amount: rakeFromBet }]);
      window.setTimeout(() => {
        setFloaters((arr) => arr.filter((f) => f.id !== id));
      }, 1400);
    }
  }, []);

  // Resolve a player action (used by hero clicks AND the AI loop).
  // We read state from the ref to keep the setState updater pure (no side effects),
  // which avoids React strict-mode double-counting of the jackpot contribution.
  const performAction = useCallback((who: PlayerId, kind: ActionKind, raiseTo?: number) => {
    const s = stateRef.current;
    if (!s || s.phase !== "betting" || s.toAct !== who) return;
    const { next, rake } = applyAction(s, who, kind, raiseTo);
    setState(advanceTurn(next));
    if (rake > 0) addJackpotContribution(rake, who === "H");
  }, [setState, addJackpotContribution]);

  // Auto-deal streets + run AI turns.
  useEffect(() => {
    if (!state) return;
    if (state.phase === "deal-flop") {
      const t = window.setTimeout(() => {
        setState((s) => {
          if (!s || s.phase !== "deal-flop") return s;
          const { cards, deck } = dealCardsFromTop(s, 3);
          const community = [...s.community, ...cards];
          const next: State = { ...s, community, deck, phase: "betting", toAct: postflopFirstActor(s), lastAggressor: null,
            log: [...s.log, { who: "DEALER", text: `Flop: ${cards.map(c => c.rank + c.suit).join(" ")}` }] };
          return maybeAutoComplete(next);
        });
      }, 700);
      return () => window.clearTimeout(t);
    }
    if (state.phase === "deal-turn") {
      const t = window.setTimeout(() => {
        setState((s) => {
          if (!s || s.phase !== "deal-turn") return s;
          const { cards, deck } = dealCardsFromTop(s, 1);
          const community = [...s.community, ...cards];
          const next: State = { ...s, community, deck, phase: "betting", toAct: postflopFirstActor(s), lastAggressor: null,
            log: [...s.log, { who: "DEALER", text: `Turn: ${cards[0].rank}${cards[0].suit}` }] };
          return maybeAutoComplete(next);
        });
      }, 600);
      return () => window.clearTimeout(t);
    }
    if (state.phase === "deal-river") {
      const t = window.setTimeout(() => {
        setState((s) => {
          if (!s || s.phase !== "deal-river") return s;
          const { cards, deck } = dealCardsFromTop(s, 1);
          const community = [...s.community, ...cards];
          const next: State = { ...s, community, deck, phase: "betting", toAct: postflopFirstActor(s), lastAggressor: null,
            log: [...s.log, { who: "DEALER", text: `River: ${cards[0].rank}${cards[0].suit}` }] };
          return maybeAutoComplete(next);
        });
      }, 600);
      return () => window.clearTimeout(t);
    }
    if (state.phase === "showdown") {
      const t = window.setTimeout(() => {
        setState((s) => {
          if (!s || s.phase !== "showdown") return s;
          // ROYAL FLUSH CHECK — hero only (jackpot trigger).
          if (s.players.H.hole && isRoyalFlush(s.players.H.hole, s.community)) {
            // Route to the existing win moment with a brief delay.
            window.setTimeout(() => router.push("/big-jackpots/win"), 600);
            return { ...s, phase: "hand-over", winnerId: "H",
              winnerNote: "ROYAL FLUSH — Jackpot triggered!",
              log: [...s.log, { who: "SYSTEM", text: "Royal Flush — Jackpot triggered!" }] };
          }
          const winner = pickShowdownWinner(s);
          const players = { ...s.players, [winner]: { ...s.players[winner], stack: s.players[winner].stack + s.pot } };
          return { ...s, phase: "hand-over", winnerId: winner, players,
            winnerNote: `${s.players[winner].name} wins $${s.pot.toLocaleString()}`,
            log: [...s.log, { who: "DEALER", text: `${s.players[winner].name} wins $${s.pot.toLocaleString()}` }] };
        });
      }, 700);
      return () => window.clearTimeout(t);
    }
    // AI turn handler.
    if (state.phase === "betting" && state.toAct && state.toAct !== "H") {
      const me = state.toAct;
      const t = window.setTimeout(() => {
        const cur = stateRef.current;
        if (!cur || cur.phase !== "betting" || cur.toAct !== me) return;
        const decision = aiDecision(cur, me);
        const { next, rake } = applyAction(cur, me, decision.kind, decision.raiseTo);
        setState(advanceTurn(next));
        if (rake > 0) addJackpotContribution(rake, false);
      }, 900 + Math.random() * 600);
      return () => window.clearTimeout(t);
    }
  }, [state?.phase, state?.toAct, state?.round, state?.community.length, router, addJackpotContribution]);

  // If a round opens with everyone already all-in or no betting needed, fast-forward.
  function maybeAutoComplete(s: State): State {
    const stillIn = activePlayers(s).filter((id) => !s.players[id].allIn);
    if (stillIn.length <= 1) {
      // Burn straight to showdown by dealing remaining streets immediately.
      let cur = s;
      while (cur.community.length < 5) {
        const need = cur.community.length === 0 ? 3 : 1;
        const { cards, deck } = dealCardsFromTop(cur, need);
        cur = { ...cur, community: [...cur.community, ...cards], deck };
      }
      return { ...cur, phase: "showdown", toAct: null };
    }
    return s;
  }

  const visibleAmount = amount + bumpAmount;

  const startNext = () => {
    setState((s) => (s ? startHand(s.handNumber + 1, s, forceRoyalNext) : startHand(1)));
    if (forceRoyalNext) setForceRoyalNext(false);
  };

  if (!state) {
    return (
      <div className="bj-root bj-canvas-host">
        <DemoFlowBanner current="play" floating />
        <div className="stage">
          <div className="canvas" ref={canvasRef}>
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "var(--ink-3)", fontSize: 13, letterSpacing: ".14em", textTransform: "uppercase" }}>
              Dealing first hand…
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Hero turn options.
  const heroTurn = state.toAct === "H" && state.phase === "betting";
  const hero = state.players.H;
  const toCall = heroTurn ? Math.max(0, state.currentBet - hero.contribRound) : 0;
  const canCheck = heroTurn && toCall === 0;
  const minRaise = Math.max(state.currentBet * 2, BB * 2, state.currentBet + BB);
  const maxRaise = hero.stack + hero.contribRound;
  const clampedBet = Math.min(Math.max(betSize, minRaise), maxRaise);

  return (
    <div className="bj-root bj-canvas-host">
      <DemoFlowBanner current="play" floating />
      <div className="stage">
        <div className="canvas" ref={canvasRef}>
          <TopChrome handNumber={state.handNumber} balance={hero.stack} sessionContrib={sessionContrib} />
          <Jackpot amount={visibleAmount} bumpKey={bumpKey} />
          <JackpotFloaters floaters={floaters} />
          <Table state={state} />
          <Crawler />
          <Chat log={state.log} />
          {heroTurn ? (
            <ActionBar
              toCall={toCall}
              canCheck={canCheck}
              minRaise={minRaise}
              maxRaise={maxRaise}
              clampedBet={clampedBet}
              pot={state.pot}
              setBetSize={setBetSize}
              onFold={() => performAction("H", "fold")}
              onCheckCall={() => performAction("H", canCheck ? "check" : "call")}
              onRaise={() => performAction("H", "raise", clampedBet)}
              onAllIn={() => performAction("H", "raise", maxRaise)}
            />
          ) : (
            <BetweenBar
              state={state}
              forceRoyalNext={forceRoyalNext}
              setForceRoyalNext={setForceRoyalNext}
              onNextHand={startNext}
            />
          )}
          <HandStrip handNumber={state.handNumber} round={state.round} winnerNote={state.winnerNote} />
        </div>
      </div>
    </div>
  );
}

function Table({ state }: { state: State }) {
  const { players, community, pot } = state;
  const showdown = state.phase === "showdown" || state.phase === "hand-over";
  const showLBet = players.L.contribRound > 0;
  const showRBet = players.R.contribRound > 0;
  const showHBet = players.H.contribRound > 0;

  return (
    <>
      <div className="table-meta">
        <span>Spin &amp; Go · Hold&apos;em</span>
        <span className="dot" />
        <span className="blinds">${SB} / ${BB}</span>
        <span className="dot" />
        <span className="level">Hand {state.handNumber}</span>
      </div>
      <div className="table-meta-r">
        <span className="pill">{state.round === "complete" ? "Hand complete" : roundLabel(state.round)}</span>
      </div>

      <div className="felt">
        <div className="table-rail">
          <div className="table-felt">
            <div className="table-mark" />

            <Seat side="left" name={players.L.name} stack={players.L.stack}
                  acting={state.toAct === "L"} bet={showLBet ? players.L.contribRound : undefined}
                  fold={players.L.folded}
                  holeFaceUp={showdown && !players.L.folded}
                  hole={players.L.hole}
                  winner={state.winnerId === "L"} />
            <Seat side="right" name={players.R.name} stack={players.R.stack}
                  acting={state.toAct === "R"} bet={showRBet ? players.R.contribRound : undefined}
                  fold={players.R.folded}
                  holeFaceUp={showdown && !players.R.folded}
                  hole={players.R.hole}
                  winner={state.winnerId === "R"} />

            <div className="table-center">
              <div className="pot-pill">
                <span className="lbl">Pot</span>
                <span className="amt">${pot.toLocaleString()}</span>
              </div>
              <div className="community">
                {[0,1,2,3,4].map((i) => {
                  const c = community[i];
                  if (!c) return <div className="slot-empty" key={i} />;
                  return <CardView key={i} rank={c.rank} suit={c.suit} lg />;
                })}
              </div>
              {pot > 0 && (
                <div className="chips">
                  <div className="chip-stack">
                    {Array.from({ length: Math.min(8, Math.max(2, Math.floor(pot / 200))) }).map((_, i) => (
                      <div className="chip" key={i} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="dealer-btn" style={{ left: "50%", bottom: 120, top: "auto" }}>D</div>

            <div className="hero-seat">
              <div style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
                <div className="cards">
                  {players.H.hole ? (
                    <>
                      <CardView rank={players.H.hole[0].rank} suit={players.H.hole[0].suit} lg
                                highlight={state.winnerId === "H"} />
                      <CardView rank={players.H.hole[1].rank} suit={players.H.hole[1].suit} lg
                                highlight={state.winnerId === "H"} />
                    </>
                  ) : (
                    <>
                      <CardView faceDown lg />
                      <CardView faceDown lg />
                    </>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div className="avatar" style={{ position: "relative" }}>
                    <PersonIcon size={26} />
                    {state.toAct === "H" && (
                      <div style={{
                        position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
                        background: "var(--teal)", color: "#06241d", fontSize: 9, fontWeight: 800,
                        letterSpacing: ".1em", padding: "2px 8px", borderRadius: 3,
                      }}>YOUR TURN</div>
                    )}
                  </div>
                  <div className="name-stack">
                    <div className="name">{players.H.name}</div>
                    <div className="stack">${players.H.stack.toLocaleString()}</div>
                  </div>
                </div>
                <div className="cards" style={{ opacity: 0, pointerEvents: "none" }}>
                  <CardView faceDown lg />
                </div>
              </div>
              {showHBet && (
                <div className="bet" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", top: -38 }}>
                  <span className="coin" />{players.H.contribRound.toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function roundLabel(r: Round): string {
  switch (r) {
    case "preflop": return "Pre-flop";
    case "flop": return "Flop";
    case "turn": return "Turn";
    case "river": return "River";
    default: return "Complete";
  }
}

function ActionBar({
  toCall, canCheck, minRaise, maxRaise, clampedBet, pot, setBetSize,
  onFold, onCheckCall, onRaise, onAllIn,
}: {
  toCall: number; canCheck: boolean; minRaise: number; maxRaise: number; clampedBet: number; pot: number;
  setBetSize: (n: number) => void;
  onFold: () => void; onCheckCall: () => void; onRaise: () => void; onAllIn: () => void;
}) {
  return (
    <div className="actions">
      <button className="btn btn-ghost" type="button" onClick={onFold}>Fold</button>
      <button className="btn btn-ghost btn-stack" type="button" onClick={onCheckCall}>
        <span>{canCheck ? "Check" : `Call $${toCall.toLocaleString()}`}</span>
        <span className="sub">{canCheck ? "no bet to call" : "match current bet"}</span>
      </button>
      <button className="btn btn-teal btn-stack" type="button" onClick={onRaise}
              disabled={clampedBet > maxRaise || clampedBet < minRaise}>
        <span>{toCall === 0 ? "Bet" : "Raise"}</span>
        <span className="sub">to ${clampedBet.toLocaleString()}</span>
      </button>
      <div className="bet-controls">
        <span className="label">Bet</span>
        <button className="step-btn" type="button" onClick={() => setBetSize(Math.max(minRaise, clampedBet - 20))}>−</button>
        <span className="val">${clampedBet.toLocaleString()}</span>
        <button className="step-btn" type="button" onClick={() => setBetSize(Math.min(maxRaise, clampedBet + 20))}>+</button>
        <div className="quick">
          <button type="button" onClick={() => setBetSize(Math.max(minRaise, Math.round(pot * 0.5)))}>½ pot</button>
          <button type="button" onClick={() => setBetSize(Math.max(minRaise, pot))}>pot</button>
          <button type="button" onClick={onAllIn}>all-in</button>
        </div>
      </div>
    </div>
  );
}

function BetweenBar({
  state, forceRoyalNext, setForceRoyalNext, onNextHand,
}: {
  state: State;
  forceRoyalNext: boolean;
  setForceRoyalNext: (b: boolean) => void;
  onNextHand: () => void;
}) {
  const status =
    state.phase === "dealing" ? "Dealing…" :
    state.phase === "deal-flop" ? "Dealing flop…" :
    state.phase === "deal-turn" ? "Dealing turn…" :
    state.phase === "deal-river" ? "Dealing river…" :
    state.phase === "showdown" ? "Showdown…" :
    state.phase === "hand-over" ? (state.winnerNote || "Hand complete") :
    state.toAct ? `${state.players[state.toAct].name} to act…` :
    "Waiting…";

  return (
    <div className="actions" style={{ gap: 20 }}>
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6,
        fontSize: 13, color: "var(--ink-1)", letterSpacing: ".04em", fontWeight: 500,
      }}>
        <div style={{
          fontSize: 10, color: "var(--ink-3)", letterSpacing: ".2em",
          textTransform: "uppercase", fontWeight: 700,
        }}>Table</div>
        <div style={{ fontSize: 15, color: "#fff", fontWeight: 700 }}>{status}</div>
      </div>

      {state.phase === "hand-over" ? (
        <>
          <button className="btn btn-teal" type="button" onClick={onNextHand}>
            Next hand →
          </button>
          <label style={{
            display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
            color: "var(--gold)", fontSize: 11, letterSpacing: ".1em",
            textTransform: "uppercase", fontWeight: 600,
            background: "rgba(240,180,26,.08)", border: "1px solid rgba(240,180,26,.3)",
            padding: "10px 16px", borderRadius: 30,
          }}>
            <input
              type="checkbox"
              checked={forceRoyalNext}
              onChange={(e) => setForceRoyalNext(e.target.checked)}
              style={{ accentColor: "var(--gold)" }}
            />
            Force royal flush next hand (demo)
          </label>
        </>
      ) : (
        <div style={{
          fontSize: 11, color: "var(--ink-3)", letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 600,
        }}>
          Waiting for opponents…
        </div>
      )}
    </div>
  );
}

function HandStrip({ handNumber, round, winnerNote }: { handNumber: number; round: Round; winnerNote: string }) {
  return (
    <div style={{
      position: "absolute", left: 36, top: 110, display: "flex", alignItems: "center", gap: 10, zIndex: 3,
      fontSize: 11, color: "var(--ink-2)", letterSpacing: ".06em",
    }}>
      <span style={{
        background: "rgba(0,0,0,.55)", border: "1px solid var(--hairline)", borderRadius: 999,
        padding: "4px 12px", color: "var(--ink-1)",
      }}>Hand #{handNumber}</span>
      <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--ink-3)" }} />
      <span style={{ color: "var(--gold)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".12em" }}>{roundLabel(round)}</span>
      {winnerNote && (
        <>
          <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--ink-3)" }} />
          <span style={{ color: "var(--teal)", fontWeight: 600 }}>{winnerNote}</span>
        </>
      )}
    </div>
  );
}

// ───────── AI ─────────

function aiDecision(s: State, me: PlayerId): { kind: ActionKind; raiseTo?: number } {
  const p = s.players[me];
  const toCall = Math.max(0, s.currentBet - p.contribRound);

  // Quick "hand strength" proxy: pair / high card.
  let strength = 0.4;
  if (p.hole) {
    const ranks = p.hole.map((c) => c.rank);
    if (ranks[0] === ranks[1]) strength += 0.25;
    const highish = ["A","K","Q","J","10"];
    if (ranks.some((r) => highish.includes(r))) strength += 0.15;
    if (p.hole[0].suit === p.hole[1].suit) strength += 0.08;
  }
  // Bias by board.
  if (s.community.length > 0 && p.hole) {
    const allRanks = [...p.hole, ...s.community].map((c) => c.rank);
    const counts = new Map<Rank, number>();
    allRanks.forEach((r) => counts.set(r, (counts.get(r) ?? 0) + 1));
    if ([...counts.values()].some((v) => v >= 2)) strength += 0.1;
  }
  strength += (Math.random() - 0.5) * 0.2;

  if (toCall === 0) {
    if (strength > 0.7) return { kind: "raise", raiseTo: Math.max(s.currentBet * 2, BB * 2, Math.round(s.pot * 0.6)) };
    return { kind: "check" };
  }
  // Big call?
  const callCost = toCall;
  if (callCost > p.stack * 0.5 && strength < 0.45) return { kind: "fold" };
  if (strength > 0.75) return { kind: "raise", raiseTo: Math.round(Math.max(s.currentBet * 2.2, s.pot * 0.8)) };
  if (strength < 0.35 && Math.random() < 0.5) return { kind: "fold" };
  return { kind: "call" };
}
