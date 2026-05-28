// PokerStars DE · Inactivity logout warning prototype.
// Single React tree: poker-table backdrop + warning modal + logout screen +
// demo control panel. German copy throughout — references GlüStV 2021 §6.

const { useState, useEffect, useRef, useCallback } = React;

/* ──────────────────────── Icons (Fusion) ──────────────────────── */
function IconClock({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
function IconShield({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l8 3v6c0 4.6-3.4 8.5-8 9-4.6-.5-8-4.4-8-9V6l8-3z" />
      <path d="M9.5 12.5l2 2 3.5-4" />
    </svg>
  );
}
function IconLogout({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
      <path d="M10 17l-5-5 5-5" />
      <path d="M5 12h12" />
    </svg>
  );
}
function IconNotif({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  );
}
function IconChat({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a3 3 0 0 1-3 3H8l-4 4V6a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3z" />
    </svg>
  );
}
function IconSettings({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  );
}
function IconRefresh({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 12a9 9 0 0 1 15.5-6.3L21 8" /><path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.5 6.3L3 16" /><path d="M3 21v-5h5" />
    </svg>
  );
}
function IconBolt({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
    </svg>
  );
}

/* ──────────────────────── Playing card ──────────────────────── */
const SUIT_CHAR = { s: "♠", h: "♥", d: "♦", c: "♣" };
const SUIT_COLOR = { s: "black", h: "red", d: "red", c: "black" };
// Royals use a stylised letter on the centre pip slot too.
const FACE = { J: true, Q: true, K: true };
function Card({ rank, suit, size = "lg" }) {
  if (rank === null) {
    return <div className={`card back${size === "sm" ? " small" : ""}`}></div>;
  }
  const cls = `card ${SUIT_COLOR[suit]}${size === "sm" ? " small" : ""}`;
  const isAce = rank === "A";
  const isFace = FACE[rank];
  return (
    <div className={cls}>
      <div className="corner">
        <span className="rank">{rank}</span>
        <span className="suit">{SUIT_CHAR[suit]}</span>
      </div>
      <span className={`pip${isAce ? " pip--xl" : ""}`}>
        {isFace ? rank : SUIT_CHAR[suit]}
      </span>
    </div>
  );
}

/* ──────────────────────── Table backdrop ──────────────────────── */
const SEATS = [
  { pos: "s1", name: "Schmidt_92", stack: 4280, bet: 0, folded: true,  initials: "SC" },
  { pos: "s2", name: "MagnusC", stack: 12500, bet: 0, folded: false, initials: "MC", dealer: true },
  { pos: "s3", name: "Lena_K", stack: 8650, bet: 200, folded: false, initials: "LK" },
  { pos: "s4", name: "DubraskaPro", stack: 6420, bet: 200, folded: false, initials: "DP" },
  { pos: "s5", name: "FelixB", stack: 3110, bet: 0, folded: true, initials: "FB" },
];

function TableSurface() {
  return (
    <div className="table-wrap" aria-hidden="true">
      <div className="felt">
        {/* Opponents */}
        {SEATS.map((s) => (
          <div key={s.pos} className={`seat ${s.pos} ${s.folded ? "folded" : ""}`}>
            <div className="avatar">{s.initials}</div>
            <div className="info">
              <span className="name">{s.name}</span>
              <span className="stack">€{s.stack.toLocaleString("de-DE")}</span>
            </div>
            {s.dealer && <div className="dealer">D</div>}
            <div className="seathole">
              {s.folded ? null : (
                <>
                  <Card rank={null} size="sm" />
                  <Card rank={null} size="sm" />
                </>
              )}
            </div>
            {s.bet > 0 && (
              <div className="bet"><span className="chip"></span>€{s.bet}</div>
            )}
          </div>
        ))}

        {/* Community board */}
        <div className="board">
          <div className="pot">
            <span className="label">Pot</span>
            <span>€640</span>
          </div>
          <div className="cards">
            <Card rank="A" suit="s" />
            <Card rank="K" suit="h" />
            <Card rank="9" suit="s" />
            <Card rank="2" suit="d" />
            <div className="card" style={{ background: "rgba(0,0,0,0.25)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)" }}></div>
          </div>
        </div>

        {/* Hero seat */}
        <div className="hero">
          <div className="holecards">
            <Card rank="A" suit="h" />
            <Card rank="A" suit="c" />
          </div>
          <div className="seat active" style={{ position: "relative" }}>
            <div className="turn-ring"></div>
            <div className="avatar" style={{ background: "linear-gradient(135deg, #089b80 0%, #0a5f4f 100%)" }}>YO</div>
            <div className="info">
              <span className="name">You</span>
              <span className="stack">€10,420</span>
            </div>
            <div className="bet" style={{ left: "-90px", top: "50%", transform: "translateY(-50%)" }}>
              <span className="chip"></span>€200
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TopBar({ sessionTime }) {
  const mins = Math.floor(sessionTime / 60);
  const secs = sessionTime % 60;
  return (
    <div className="top">
      <div className="brand">
        <img src="assets/logo-colour-on-dark.svg" alt="PokerStars" />
      </div>
      <div className="divider"></div>
      <div className="crumb">
        <span className="live"></span>
        Berlin €1/€2 NL Hold'em
        <span className="muted">· Table 14</span>
      </div>
      <div className="session">
        <IconClock size={14} />
        Session time: <strong>{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}</strong>
      </div>
      <div className="balance">
        <span className="amt">€10,420.00</span>
        <span className="plus" aria-label="Deposit">+</span>
      </div>
      <button className="iconbtn" aria-label="Messages"><IconChat /></button>
      <button className="iconbtn" aria-label="Notifications"><IconNotif /></button>
      <button className="iconbtn" aria-label="Settings"><IconSettings /></button>
    </div>
  );
}

function ActionBar() {
  return (
    <div className="actions">
      <div className="chips">
        <button className="chip">½ Pot</button>
        <button className="chip">¾ Pot</button>
        <button className="chip">Pot</button>
        <button className="chip">All-in</button>
      </div>
      <div className="btn-row">
        <button className="actbtn actbtn--fold">Fold</button>
        <button className="actbtn actbtn--call">
          Call <span className="sub">€200</span>
        </button>
        <button className="actbtn actbtn--raise">
          Raise <span className="sub">€600</span>
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────── Countdown ring ──────────────────────── */
function CountdownRing({ value, total }) {
  const r = 58;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / total));
  const dash = c * pct;
  const urgent = value <= 10;
  return (
    <div className="ring">
      <svg width="132" height="132">
        <circle cx="66" cy="66" r={r} fill="none"
          stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        <circle cx="66" cy="66" r={r} fill="none"
          stroke={urgent ? "var(--brand-red-flag)" : "var(--brand-teal-500)"}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          style={{ transition: "stroke-dashoffset 1s linear, stroke 200ms" }} />
      </svg>
      <span className={`ring__num${urgent ? " urgent" : ""}`} aria-live="polite">{value}</span>
    </div>
  );
}

/* ──────────────────────── Warning Modal ──────────────────────── */
function WarningModal({ remaining, total, onStay, onLogout }) {
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="warntitle">
      <div className="modal">
        <div className="modal__top">
          <div className="modal__icon" aria-hidden="true">
            <IconClock size={32} />
          </div>
          <span className="modal__eyebrow">Inactivity warning</span>
          <h2 className="modal__title" id="warntitle">Still there?</h2>
          <p className="modal__desc">
            For player-protection reasons we'll sign you out automatically after
            15 minutes of inactivity. Confirm you'd like to keep playing.
          </p>
          <div className="modal__count">
            <CountdownRing value={remaining} total={total} />
            <span className="ring__label">Seconds remaining</span>
          </div>
        </div>

        <div className="modal__actions">
          <button className="mbtn mbtn--primary" onClick={onStay} autoFocus>
            Keep me signed in
          </button>
          <button className="mbtn mbtn--secondary" onClick={onLogout}>
            Sign out now
          </button>
        </div>

        <div className="modal__legal">
          <IconShield size={16} />
          <span>
            <strong>Regulated gaming environment.</strong> Automatic sign-out is
            required under § 6 GlüStV 2021 to help prevent excessive play.
            Your current hand will be folded.
          </span>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────── Logged-out screen ──────────────────────── */
function LogoutScreen({ onSignIn }) {
  return (
    <div className="logoutscreen">
      <div className="ls-top">
        <img src="assets/logo-colour-on-dark.svg" alt="PokerStars" />
      </div>
      <div className="ls-body">
        <div className="ls-card">
          <div className="ls-mark"><IconLogout size={28} /></div>
          <h1>Session ended</h1>
          <span className="ls-meta">
            <IconShield size={12} />
            &nbsp; Under § 6 GlüStV 2021
          </span>
          <p>
            You've been signed out automatically after 15 minutes of inactivity.
            Your open hand was folded and your balance is safe.
          </p>
          <div className="ls-actions">
            <button className="mbtn mbtn--primary" onClick={onSignIn}>
              Sign in again
            </button>
            <button className="mbtn mbtn--secondary">
              Back to home
            </button>
          </div>
          <div className="ls-foot">
            <a href="#">Responsible gaming</a>
            <span className="dot"></span>
            <a href="#">Help</a>
            <span className="dot"></span>
            <a href="#">Manage limits</a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────── Demo control panel ──────────────────────── */
function DemoPanel({ phase, onTrigger, onJumpTo10, onReset }) {
  return (
    <div className="demo">
      <div className="demo__header">
        <span className="pip"></span>
        Demo controls
      </div>
      <p className="demo__hint">
        For stakeholders. In the real app the warning fires automatically after 14 min idle.
      </p>
      <div className="demo__row">
        <button
          className="demo__btn primary"
          onClick={onTrigger}
          disabled={phase !== "playing"}
          style={phase !== "playing" ? { opacity: 0.5, cursor: "not-allowed" } : {}}
        >
          <IconBolt size={12} />
          Trigger warning now
          <span className="kbd">W</span>
        </button>
        <button
          className="demo__btn"
          onClick={onJumpTo10}
          disabled={phase !== "warning"}
          style={phase !== "warning" ? { opacity: 0.4, cursor: "not-allowed" } : {}}
        >
          Jump to 10 sec
          <span className="kbd">J</span>
        </button>
        <button className="demo__btn" onClick={onReset}>
          <IconRefresh size={12} />
          Reset
          <span className="kbd">R</span>
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────── Main app + state machine ──────────────────────── */
const COUNTDOWN_TOTAL = 60;
// In the real product this would be 15 minutes minus 60s. For the demo we
// shorten the idle window so a stakeholder can see the auto-trigger by waiting
// only a moment if they don't press the demo button.
const IDLE_BEFORE_WARNING_MS = 30_000; // 30s of idle in the demo

function App() {
  const [phase, setPhase] = useState("playing"); // playing | warning | loggedout
  const [remaining, setRemaining] = useState(COUNTDOWN_TOTAL);
  const [sessionTime, setSessionTime] = useState(14 * 60 + 23);
  const idleTimer = useRef(null);

  // Session clock — ticks up whenever the user is signed in.
  useEffect(() => {
    if (phase === "loggedout") return;
    const id = setInterval(() => setSessionTime((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  // Idle → warning auto-trigger
  const scheduleIdle = useCallback(() => {
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      setPhase((p) => (p === "playing" ? "warning" : p));
    }, IDLE_BEFORE_WARNING_MS);
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    scheduleIdle();
    return () => clearTimeout(idleTimer.current);
  }, [phase, scheduleIdle]);

  // Countdown tick
  useEffect(() => {
    if (phase !== "warning") return;
    if (remaining <= 0) {
      setPhase("loggedout");
      return;
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, remaining]);

  const triggerWarning = useCallback(() => {
    setRemaining(COUNTDOWN_TOTAL);
    setPhase("warning");
  }, []);
  const jumpTo10 = useCallback(() => setRemaining(10), []);
  const reset = useCallback(() => {
    clearTimeout(idleTimer.current);
    setRemaining(COUNTDOWN_TOTAL);
    setSessionTime(14 * 60 + 23);
    setPhase("playing");
  }, []);
  const stay = useCallback(() => {
    setRemaining(COUNTDOWN_TOTAL);
    setSessionTime(0); // session/idle resets
    setPhase("playing");
  }, []);
  const logoutNow = useCallback(() => {
    setPhase("loggedout");
  }, []);

  // Keyboard shortcuts for demo
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "w" || e.key === "W") triggerWarning();
      if (e.key === "j" || e.key === "J") jumpTo10();
      if (e.key === "r" || e.key === "R") reset();
      if (e.key === "Escape" && phase === "warning") stay();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [triggerWarning, jumpTo10, reset, stay, phase]);

  return (
    <div className="stage" data-screen-label="Poker · Inactivity warning">
      <TopBar sessionTime={sessionTime} />
      <TableSurface />
      <ActionBar />

      {phase === "warning" && (
        <WarningModal
          remaining={remaining}
          total={COUNTDOWN_TOTAL}
          onStay={stay}
          onLogout={logoutNow}
        />
      )}

      {phase === "loggedout" && <LogoutScreen onSignIn={reset} />}

      <DemoPanel
        phase={phase}
        onTrigger={triggerWarning}
        onJumpTo10={jumpTo10}
        onReset={reset}
      />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
