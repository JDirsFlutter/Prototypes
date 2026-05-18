import Image from "next/image";
import Link from "next/link";
import { asset } from "@/app/lib/basePath";

type Status = "registering" | "live" | "starting-soon" | "ending-soon";

type Tournament = {
  id: string;
  name: string;
  description: string;
  variant: "NLHE" | "PLO" | "Spin & Go" | "Bounty";
  status: Status;
  buyIn: string;
  prizePool: string;
  entrants: { current: number; max?: number; guaranteed?: number };
  startsIn?: string;
  endsIn?: string;
  rewards: { label: string; multiplier?: string; tone: "trophy" | "bonus" | "ticket" }[];
};

const tournaments: Tournament[] = [
  {
    id: "sunday-million",
    name: "Sunday Million",
    description: "$1M GTD · NL Hold'em · 9-Max",
    variant: "NLHE",
    status: "starting-soon",
    buyIn: "$215",
    prizePool: "$1,000,000",
    entrants: { current: 2417, guaranteed: 5000 },
    startsIn: "47m",
    rewards: [
      { label: "Trophy", tone: "trophy" },
      { label: "Bonus", multiplier: "x2", tone: "bonus" },
      { label: "Ticket", tone: "ticket" },
    ],
  },
  {
    id: "spin-leaderboard",
    name: "Spin Race",
    description: "Spin & Go leaderboard · 24h race",
    variant: "Spin & Go",
    status: "live",
    buyIn: "From $1",
    prizePool: "$50,000",
    entrants: { current: 8721 },
    endsIn: "6h 12m",
    rewards: [
      { label: "Cash", tone: "bonus" },
      { label: "Tickets", multiplier: "x10", tone: "ticket" },
      { label: "Trophy", tone: "trophy" },
    ],
  },
  {
    id: "bounty-builder",
    name: "Bounty Builder HR",
    description: "$500K GTD · Progressive KO · NLHE",
    variant: "Bounty",
    status: "registering",
    buyIn: "$109",
    prizePool: "$500,000",
    entrants: { current: 1098, guaranteed: 5000 },
    startsIn: "2h 30m",
    rewards: [
      { label: "Bounty", tone: "bonus" },
      { label: "Trophy", tone: "trophy" },
      { label: "Ticket", multiplier: "x3", tone: "ticket" },
    ],
  },
  {
    id: "plo-mania",
    name: "PLO Mania",
    description: "$50K GTD · Pot-Limit Omaha · 6-Max",
    variant: "PLO",
    status: "ending-soon",
    buyIn: "$55",
    prizePool: "$78,400",
    entrants: { current: 1567, guaranteed: 1000 },
    endsIn: "12m",
    rewards: [
      { label: "Cash", tone: "bonus" },
      { label: "Trophy", tone: "trophy" },
      { label: "Ticket", tone: "ticket" },
    ],
  },
];

function StatusTag({ status }: { status: Status }) {
  const map: Record<Status, { label: string; bg: string; text: string }> = {
    registering:    { label: "Registering",   bg: "bg-ps-white",   text: "text-ps-black" },
    "starting-soon":{ label: "Starting soon", bg: "bg-ps-warning", text: "text-ps-white" },
    live:           { label: "Live",          bg: "bg-ps-success", text: "text-ps-white" },
    "ending-soon":  { label: "Ending soon",   bg: "bg-ps-error",   text: "text-ps-white" },
  };
  const v = map[status];
  return (
    <span className={`${v.bg} ${v.text} text-ps-xsmall-bold rounded-sm px-1.5 py-0.5 leading-none`}>
      {v.label}
    </span>
  );
}

function VariantTag({ variant }: { variant: Tournament["variant"] }) {
  return (
    <span className="bg-ps-black text-ps-white text-ps-xsmall-bold rounded-sm px-1.5 py-0.5 leading-none">
      {variant}
    </span>
  );
}

function RewardBadge({ reward }: { reward: Tournament["rewards"][number] }) {
  const icon =
    reward.tone === "trophy" ? "🏆"
    : reward.tone === "bonus" ? "💰"
    : "🎟️";
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <div className="w-11 h-11 rounded-full bg-ps-grey-20 grid place-items-center text-lg">
          {icon}
        </div>
        {reward.multiplier && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-ps-black text-ps-white text-[9px] font-bold rounded-full px-1.5 py-0.5 leading-none">
            {reward.multiplier}
          </div>
        )}
      </div>
      <div className="text-ps-xsmall text-ps-grey-60">{reward.label}</div>
    </div>
  );
}

function TournamentCard({ t }: { t: Tournament }) {
  const headerBg =
    t.status === "live" ? "bg-ps-success"
    : t.status === "ending-soon" ? "bg-ps-error"
    : t.status === "starting-soon" ? "bg-ps-warning"
    : "bg-ps-primary";

  const timeLabel = t.startsIn ? `Starts in ${t.startsIn}` : t.endsIn ? `Ends in ${t.endsIn}` : null;

  const entrantsPct = t.entrants.guaranteed
    ? Math.min(100, Math.round((t.entrants.current / t.entrants.guaranteed) * 100))
    : null;

  return (
    <article className="w-72 shrink-0 rounded-md overflow-hidden bg-ps-white border border-ps-grey-20 shadow-sm flex flex-col">
      {/* Header band */}
      <div className={`relative ${headerBg} h-[120px]`}>
        <div className="absolute top-2 left-2 flex gap-1">
          <StatusTag status={t.status} />
          <VariantTag variant={t.variant} />
        </div>
        {timeLabel && (
          <div className="absolute top-2 right-2 bg-ps-white text-ps-black text-ps-xsmall-bold rounded-sm px-1.5 py-0.5 leading-none">
            {timeLabel}
          </div>
        )}
        <div className="absolute bottom-3 left-3 right-3 text-ps-white">
          <div className="text-ps-xsmall opacity-90">Prize pool</div>
          <div className="text-ps-numerical-medium">{t.prizePool}</div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-ps-brand-red" />
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        <div>
          <h3 className="text-ps-heading-xs text-ps-black truncate">{t.name}</h3>
          <p className="text-ps-xsmall text-ps-grey-60">{t.description}</p>
        </div>

        <div className="flex justify-between gap-2">
          {t.rewards.map((r, i) => (
            <RewardBadge key={i} reward={r} />
          ))}
        </div>

        <div className="text-ps-xsmall text-ps-grey-60">
          {t.entrants.current.toLocaleString()} entrants
          {t.entrants.guaranteed && ` / ${t.entrants.guaranteed.toLocaleString()} GTD`}
          {entrantsPct !== null && (
            <div className="mt-1 h-1 bg-ps-grey-20 rounded-full overflow-hidden">
              <div
                className="h-full bg-ps-primary"
                style={{ width: `${entrantsPct}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="px-4 pb-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-ps-xsmall text-ps-grey-60">Buy-in</div>
          <div className="text-ps-body-bold text-ps-black">{t.buyIn}</div>
        </div>
        <button className="text-ps-body-medium h-10 px-5 rounded-full bg-ps-primary text-ps-black hover:bg-ps-primary-darker hover:text-ps-white transition-colors">
          {t.status === "live" ? "Watch" : t.status === "ending-soon" ? "Late reg" : "Register"}
        </button>
      </div>
    </article>
  );
}

export default function Lobby() {
  return (
    <main className="flex-1 px-6 py-10 max-w-7xl mx-auto w-full">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Image src={asset("/brand/pokerstars-logo.svg")} alt="PokerStars" width={126} height={24} />
          <span className="text-ps-grey-30">|</span>
          <h1 className="text-ps-title-lg text-ps-black">Tournament lobby</h1>
        </div>
        <Link href="/" className="text-ps-small-link text-ps-primary-darker">
          ← back
        </Link>
      </header>

      <div className="mb-6 flex gap-2">
        {["All", "Hold'em", "Omaha", "Spin & Go", "Bounty", "High Roller"].map((tab, i) => (
          <button
            key={tab}
            className={`text-ps-small-medium px-4 py-2 rounded-full transition-colors ${
              i === 0
                ? "bg-ps-black text-ps-white"
                : "bg-ps-grey-10 text-ps-grey-70 hover:bg-ps-grey-20"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6">
        {tournaments.map((t) => (
          <TournamentCard key={t.id} t={t} />
        ))}
      </div>

      <p className="mt-8 text-ps-xsmall text-ps-grey-60 max-w-xl">
        Prototype using tokens from the Stars UI Toolkit. Card layout mirrors the
        Promotions Cards component set with tournament-specific data swapped in. Icons
        are placeholders — when the icon library is exported from Figma they replace these.
      </p>
    </main>
  );
}
