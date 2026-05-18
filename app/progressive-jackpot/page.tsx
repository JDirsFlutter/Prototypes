"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { asset } from "@/app/lib/basePath";

const SEED_VALUE = 10_000;
const INITIAL_JACKPOT = 1_184_726.42;

type Winner = {
  handle: string;
  amount: number;
  stake: string;
  daysAgo: number;
  location: string;
};

const recentWinners: Winner[] = [
  { handle: "RoyalRiver_88", amount: 1_421_088,  stake: "$2/$5 NLHE",   daysAgo: 47,  location: "Toronto, CA" },
  { handle: "ChipsAhoy***",  amount: 287_412,    stake: "$0.50/$1 NLHE",daysAgo: 92,  location: "Madrid, ES" },
  { handle: "QuadKing_42",   amount: 642_905,    stake: "$1/$2 NLHE",   daysAgo: 138, location: "Berlin, DE" },
  { handle: "NinaFolds",     amount: 198_330,    stake: "$0.25/$0.50",  daysAgo: 174, location: "London, UK" },
  { handle: "CallMeKaiju",   amount: 911_055,    stake: "$5/$10 NLHE",  daysAgo: 211, location: "São Paulo, BR" },
  { handle: "AceVelvet",     amount: 73_120,     stake: "$0.10/$0.25",  daysAgo: 246, location: "Dublin, IE" },
];

const lastWon = recentWinners[0];

function formatCurrency(n: number, withCents = true) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: withCents ? 2 : 0,
    maximumFractionDigits: withCents ? 2 : 0,
  });
}

function useAnimatedNumber(start: number, perTick: () => number, tickMs = 220) {
  const [value, setValue] = useState(start);
  const valueRef = useRef(start);
  useEffect(() => {
    const id = setInterval(() => {
      valueRef.current += perTick();
      setValue(valueRef.current);
    }, tickMs);
    return () => clearInterval(id);
  }, [perTick, tickMs]);
  return value;
}

function HeroTicker() {
  const jackpot = useAnimatedNumber(
    INITIAL_JACKPOT,
    () => 0.04 + Math.random() * 0.32,
    180,
  );

  const dollars = Math.floor(jackpot);
  const cents = Math.round((jackpot - dollars) * 100)
    .toString()
    .padStart(2, "0");

  return (
    <section className="relative bg-ps-black text-ps-white overflow-hidden">
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, #D70A0A 0%, transparent 40%), radial-gradient(circle at 80% 70%, #02BD9C 0%, transparent 35%)",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-6 py-16 sm:py-24 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-ps-grey-70 mb-6">
          <span className="w-2 h-2 rounded-full bg-ps-primary animate-pulse" />
          <span className="text-ps-xsmall-bold uppercase tracking-wider text-ps-grey-30">
            Royal Jackpot · Live
          </span>
        </div>

        <p className="text-ps-small-medium uppercase tracking-[0.2em] text-ps-grey-40 mb-4">
          Global cash-game progressive
        </p>

        <div className="relative">
          <div className="absolute -inset-x-12 -inset-y-6 bg-ps-brand-red/10 blur-3xl rounded-full pointer-events-none" />
          <div className="relative flex items-baseline justify-center gap-1 font-bold tabular-nums">
            <span className="text-[clamp(48px,9vw,120px)] leading-none text-ps-white">
              ${dollars.toLocaleString("en-US")}
            </span>
            <span className="text-[clamp(20px,3vw,36px)] leading-none text-ps-grey-40">
              .{cents}
            </span>
          </div>
        </div>

        <p className="mt-6 text-ps-body text-ps-grey-30 max-w-xl">
          Hit a Royal Flush at any qualifying cash table.<br className="hidden sm:block" />
          Win the entire pot. Your table-mates split 10%.
        </p>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-ps-brand-red" />
      </div>
    </section>
  );
}

function LastWonBanner({ onPreview }: { onPreview: () => void }) {
  return (
    <section className="bg-ps-grey-10 border-y border-ps-grey-20">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden>👑</span>
          <div>
            <div className="text-ps-xsmall text-ps-grey-60 uppercase tracking-wider">Last won</div>
            <div className="text-ps-body-medium text-ps-black">
              {lastWon.daysAgo} days ago by <span className="text-ps-primary-darker">{lastWon.handle}</span>
              {" · "}{formatCurrency(lastWon.amount, false)}{" · "}{lastWon.stake}
            </div>
          </div>
        </div>
        <button
          onClick={onPreview}
          className="text-ps-small-bold inline-flex items-center gap-2 h-10 px-4 rounded-full bg-ps-black text-ps-white hover:bg-ps-grey-70 transition-colors"
        >
          Preview the win moment <span aria-hidden>→</span>
        </button>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: "🪙",
      title: "1¢ per bet",
      body: "Every bet at every PokerStars cash table adds one cent to the global Royal Jackpot.",
    },
    {
      icon: "♠️",
      title: "Hit a Royal Flush",
      body: "Make a Royal Flush in a qualifying hand. Both hole cards must play, taken to showdown.",
    },
    {
      icon: "💰",
      title: "Win the pot",
      body: "90% to you. 10% split among your table-mates. The pot reseeds at $10,000 and starts climbing.",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <h2 className="text-ps-heading-sm text-ps-black mb-8 text-center">How it works</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {steps.map((s, i) => (
          <div key={i} className="bg-ps-white border border-ps-grey-20 rounded-md p-6 flex flex-col gap-3">
            <div className="w-12 h-12 rounded-full bg-ps-primary/10 grid place-items-center text-2xl">
              {s.icon}
            </div>
            <h3 className="text-ps-title-sm text-ps-black">{s.title}</h3>
            <p className="text-ps-small text-ps-grey-70">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function QualificationRules() {
  const rules = [
    "Royal Flush made on a cash-game hand",
    "Both hole cards must play in the final hand",
    "Minimum stake $0.10/$0.25 NL or above",
    "Hand taken to showdown (must be shown, not mucked)",
    "Eligible jurisdictions only — see footer",
  ];
  return (
    <section className="bg-ps-grey-10">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-ps-heading-sm text-ps-black mb-6">Qualification</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl">
          {rules.map((r) => (
            <li key={r} className="flex items-start gap-3">
              <span className="mt-1 w-5 h-5 rounded-full bg-ps-success grid place-items-center text-ps-white text-xs font-bold shrink-0">✓</span>
              <span className="text-ps-body text-ps-grey-70">{r}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function RecentWinners() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <div className="flex items-end justify-between mb-6">
        <h2 className="text-ps-heading-sm text-ps-black">Recent winners</h2>
        <span className="text-ps-small text-ps-grey-60">Last 12 months</span>
      </div>
      <div className="bg-ps-white border border-ps-grey-20 rounded-md overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-3 bg-ps-grey-10 text-ps-xsmall-bold uppercase tracking-wider text-ps-grey-60">
          <div className="col-span-4 sm:col-span-3">Player</div>
          <div className="col-span-3 text-right tabular-nums">Amount</div>
          <div className="hidden sm:block sm:col-span-2">Stake</div>
          <div className="hidden sm:block sm:col-span-2">Location</div>
          <div className="col-span-5 sm:col-span-2 text-right">When</div>
        </div>
        {recentWinners.map((w) => (
          <div key={w.handle} className="grid grid-cols-12 px-4 py-3 border-t border-ps-grey-20 items-center">
            <div className="col-span-4 sm:col-span-3 flex items-center gap-2 min-w-0">
              <span className="w-7 h-7 rounded-full bg-ps-bonus/10 text-ps-bonus grid place-items-center text-sm" aria-hidden>👑</span>
              <span className="text-ps-body-medium text-ps-black truncate">{w.handle}</span>
            </div>
            <div className="col-span-3 text-right text-ps-body-bold text-ps-black tabular-nums">
              {formatCurrency(w.amount, false)}
            </div>
            <div className="hidden sm:block sm:col-span-2 text-ps-small text-ps-grey-70">{w.stake}</div>
            <div className="hidden sm:block sm:col-span-2 text-ps-small text-ps-grey-70 truncate">{w.location}</div>
            <div className="col-span-5 sm:col-span-2 text-right text-ps-small text-ps-grey-60">
              {w.daysAgo}d ago
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function LiveActivityStrip() {
  const tables = useAnimatedNumber(4_217, () => (Math.random() < 0.5 ? 1 : -1), 1200);
  const royalsToday = useAnimatedNumber(23, () => (Math.random() < 0.05 ? 1 : 0), 2000);
  const lastHour = useAnimatedNumber(1_284, () => Math.random() * 0.6, 240);

  return (
    <section className="bg-ps-black text-ps-white">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        <Stat label="Tables contributing now" value={tables.toLocaleString("en-US")} />
        <Stat label="Royals chased today" value={royalsToday.toString()} accent="primary" />
        <Stat label="Pot grew in the last hour" value={`+${formatCurrency(lastHour, false)}`} accent="red" />
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "primary" | "red";
}) {
  const color =
    accent === "primary" ? "text-ps-primary"
    : accent === "red" ? "text-ps-brand-red"
    : "text-ps-white";
  return (
    <div className="flex flex-col gap-1">
      <span className="text-ps-xsmall uppercase tracking-wider text-ps-grey-40">{label}</span>
      <span className={`text-ps-numerical-medium tabular-nums ${color}`}>{value}</span>
    </div>
  );
}

function WinMomentOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  const confettiPieces = Array.from({ length: 60 }, (_, i) => i);

  return (
    <div
      className="fixed inset-0 z-50 bg-ps-black/95 backdrop-blur-sm grid place-items-center px-6 py-10 overflow-hidden"
      role="dialog"
      aria-label="Royal Jackpot Won"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-ps-white/10 text-ps-white hover:bg-ps-white/20 grid place-items-center text-xl"
        aria-label="Close"
      >
        ×
      </button>

      <div className="absolute inset-0 pointer-events-none">
        {confettiPieces.map((i) => (
          <span
            key={i}
            className="absolute top-0 block w-2 h-3 rounded-sm animate-jackpot-fall"
            style={{
              left: `${(i * 17) % 100}%`,
              backgroundColor:
                i % 4 === 0 ? "#D70A0A"
                : i % 4 === 1 ? "#02BD9C"
                : i % 4 === 2 ? "#F5C518"
                : "#FFFFFF",
              animationDelay: `${(i * 137) % 3000}ms`,
              animationDuration: `${3000 + ((i * 53) % 2000)}ms`,
            }}
          />
        ))}
      </div>

      <div className="relative text-center max-w-2xl">
        <div className="text-ps-xsmall-bold uppercase tracking-[0.3em] text-ps-primary mb-4">
          ROYAL JACKPOT
        </div>
        <h1
          className="text-ps-white font-bold tracking-tight leading-[0.95] mb-6"
          style={{
            fontFamily: "var(--font-ps-display)",
            fontSize: "clamp(48px, 10vw, 112px)",
          }}
        >
          WON.
        </h1>

        <div className="bg-ps-white/5 border border-ps-white/10 rounded-md p-6 backdrop-blur">
          <div className="text-ps-small uppercase tracking-wider text-ps-grey-40 mb-2">
            Winner
          </div>
          <div className="text-ps-heading-sm text-ps-white mb-1">RoyalRiver_88</div>
          <div className="text-ps-small text-ps-grey-30 mb-6">
            $2/$5 NLHE · Hand #4,902,118,773 · Seat 4
          </div>

          <div className="text-ps-xsmall-bold uppercase tracking-wider text-ps-primary mb-2">
            Payout
          </div>
          <div className="flex items-baseline justify-center gap-1 font-bold tabular-nums mb-4">
            <span className="text-[clamp(36px,6vw,72px)] text-ps-white leading-none">$1,421,088</span>
          </div>
          <div className="text-ps-xsmall text-ps-grey-40">
            90% to winner · 10% Table Bonus split among 5 seated players
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button className="text-ps-small-bold h-10 px-4 rounded-full bg-ps-primary text-ps-black hover:bg-ps-primary-darker hover:text-ps-white transition-colors">
              Watch hand replay
            </button>
            <button className="text-ps-small-bold h-10 px-4 rounded-full bg-ps-white/10 text-ps-white hover:bg-ps-white/20 transition-colors">
              Share
            </button>
          </div>
        </div>

        <p className="mt-6 text-ps-xsmall text-ps-grey-40">
          Prototype mock — site-wide banner, hand replay, push to followers, and earned-media beat all fire at this moment.
        </p>
      </div>
    </div>
  );
}

function AtTableBadge() {
  const [dismissed, setDismissed] = useState(false);
  const jackpot = useAnimatedNumber(INITIAL_JACKPOT, () => 0.04 + Math.random() * 0.32, 180);
  if (dismissed) return null;
  return (
    <div className="fixed bottom-4 right-4 z-40 bg-ps-black text-ps-white rounded-md shadow-xl border border-ps-grey-70 p-3 pr-8 max-w-xs">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-1 right-1 w-6 h-6 grid place-items-center text-ps-grey-40 hover:text-ps-white text-sm"
        aria-label="Dismiss"
      >
        ×
      </button>
      <div className="flex items-center gap-3">
        <span className="text-xl" aria-hidden>👑</span>
        <div className="min-w-0">
          <div className="text-ps-xsmall uppercase tracking-wider text-ps-grey-40 leading-tight">
            At-table badge mock
          </div>
          <div className="text-ps-body-bold text-ps-white tabular-nums leading-tight">
            {formatCurrency(jackpot)}
          </div>
          <div className="text-ps-xsmall text-ps-primary leading-tight">+1¢ this bet</div>
        </div>
      </div>
    </div>
  );
}

export default function ProgressiveJackpot() {
  const [winOpen, setWinOpen] = useState(false);

  return (
    <main className="flex-1 w-full">
      <header className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image src={asset("/brand/pokerstars-logo.svg")} alt="PokerStars" width={126} height={24} />
          <span className="text-ps-grey-30">|</span>
          <h1 className="text-ps-title-lg text-ps-black">Royal Jackpot</h1>
        </div>
        <Link href="/" className="text-ps-small-link text-ps-primary-darker">← back</Link>
      </header>

      <HeroTicker />
      <LastWonBanner onPreview={() => setWinOpen(true)} />
      <HowItWorks />
      <QualificationRules />
      <LiveActivityStrip />
      <RecentWinners />

      <section className="bg-ps-grey-10 border-t border-ps-grey-20">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-ps-title-sm text-ps-black mb-1">Want to see the moment a player wins?</h3>
            <p className="text-ps-small text-ps-grey-70">A mock of the full-screen drama that fires site-wide on every Royal Jackpot win.</p>
          </div>
          <button
            onClick={() => setWinOpen(true)}
            className="text-ps-body-medium h-12 px-6 rounded-full bg-ps-brand-red text-ps-white hover:opacity-90 transition-opacity"
          >
            Preview the win moment
          </button>
        </div>
      </section>

      <footer className="max-w-7xl mx-auto px-6 py-8 text-ps-xsmall text-ps-grey-60 leading-relaxed">
        Prototype concept — numbers, winners, and locations are illustrative. Contribution and eligibility
        rules are subject to jurisdictional Legal review. The pot resets to the $10,000 seed value after each win.
        Built against the Stars UI Toolkit.
      </footer>

      <AtTableBadge />
      <WinMomentOverlay open={winOpen} onClose={() => setWinOpen(false)} />
    </main>
  );
}
