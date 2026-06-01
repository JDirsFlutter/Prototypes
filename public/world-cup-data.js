/* ============================================================
   World Cup 2026 Predictions: config + participant list
   ============================================================
   This file is loaded by world-cup.html. Edit the constants
   below to configure the game.
   ============================================================ */

/* ----- Registration intro ---------------------------------
   Open registration: anyone with the URL self-registers a
   display name. No fixed participant list. If you want to
   pre-seed names you can still write them to Firestore
   directly. The form copy is in world-cup.html.
   ---------------------------------------------------------- */

/* ----- Scoring rules --------------------------------------
   exact: prediction matches final score exactly.
   result: prediction picks the correct W / D / L outcome.
   ---------------------------------------------------------- */
const WC_SCORING = {
  exact:  3,
  result: 1,
  wrong:  0,
};

/* ----- Tournament window ----------------------------------
   Used to scope ESPN fixture fetches. Inclusive on both ends.
   ---------------------------------------------------------- */
const WC_WINDOW = {
  startISO: "2026-06-11",
  endISO:   "2026-07-19",
};

/* ----- ESPN unofficial scoreboard endpoint ----------------
   No API key required. CORS-friendly. Returns events per day.
   The app calls this per-day across the window above.
   ---------------------------------------------------------- */
const WC_ESPN = {
  base: "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard",
  // Polled every WC_LIVE_POLL_MS while any match is in progress.
};
const WC_LIVE_POLL_MS = 60 * 1000;

/* ----- Admin passcode -------------------------------------
   Not high security, just enough to stop casual tampering.
   Replace this before sharing the URL with colleagues.
   ---------------------------------------------------------- */
const WC_ADMIN_PASSCODE = "dirsy-goat";

/* ----- Firebase config ------------------------------------
   When you create your Firebase project, paste the web-app
   config object here. Leave the placeholder values to run in
   local-only mode (no shared leaderboard).

   Firebase web-app config values are NOT secrets, it's safe
   to commit them to a public repo. Access control comes from
   the Firestore security rules.
   ---------------------------------------------------------- */
const WC_FIREBASE = {
  apiKey:            "AIzaSyCZA0fJ0c84o4-8m387A6UvOK9Geiz1FDE",
  authDomain:        "world-cup-predictor-9a331.firebaseapp.com",
  projectId:         "world-cup-predictor-9a331",
  storageBucket:     "world-cup-predictor-9a331.firebasestorage.app",
  messagingSenderId: "1014337764938",
  appId:             "1:1014337764938:web:10b5445d8d1697f7a770b3",
  measurementId:     "G-6WPN62DHT2",
};

/* ----- Team display tweaks (optional) ---------------------
   ESPN returns "United States", "Türkiye" etc. Add overrides
   here keyed by ESPN's displayName for shorter labels.
   ---------------------------------------------------------- */
const WC_TEAM_OVERRIDES = {
  "United States": "USA",
  "Bosnia-Herzegovina": "Bosnia",
};

/* ----- Country flags --------------------------------------
   Keyed by ESPN's 3-letter abbreviation (FIFA / IOC style).
   Covers all 48 WC 2026 qualifiers. Unknown abbreviations
   (e.g. bracket placeholders like "1A", "QFW1") return "".
   ---------------------------------------------------------- */
const WC_TEAM_FLAGS = {
  ALG: "🇩🇿", // Algeria
  ARG: "🇦🇷", // Argentina
  AUS: "🇦🇺", // Australia
  AUT: "🇦🇹", // Austria
  BEL: "🇧🇪", // Belgium
  BIH: "🇧🇦", // Bosnia and Herzegovina
  BRA: "🇧🇷", // Brazil
  CAN: "🇨🇦", // Canada
  CIV: "🇨🇮", // Ivory Coast
  COD: "🇨🇩", // DR Congo
  COL: "🇨🇴", // Colombia
  CPV: "🇨🇻", // Cape Verde
  CRO: "🇭🇷", // Croatia
  CUW: "🇨🇼", // Curacao
  CZE: "🇨🇿", // Czechia
  ECU: "🇪🇨", // Ecuador
  EGY: "🇪🇬", // Egypt
  ENG: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", // England subdivision flag
  ESP: "🇪🇸", // Spain
  FRA: "🇫🇷", // France
  GER: "🇩🇪", // Germany
  GHA: "🇬🇭", // Ghana
  HAI: "🇭🇹", // Haiti
  IRN: "🇮🇷", // Iran
  IRQ: "🇮🇶", // Iraq
  JOR: "🇯🇴", // Jordan
  JPN: "🇯🇵", // Japan
  KOR: "🇰🇷", // South Korea
  KSA: "🇸🇦", // Saudi Arabia
  MAR: "🇲🇦", // Morocco
  MEX: "🇲🇽", // Mexico
  NED: "🇳🇱", // Netherlands
  NOR: "🇳🇴", // Norway
  NZL: "🇳🇿", // New Zealand
  PAN: "🇵🇦", // Panama
  PAR: "🇵🇾", // Paraguay
  POR: "🇵🇹", // Portugal
  QAT: "🇶🇦", // Qatar
  RSA: "🇿🇦", // South Africa
  SCO: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", // Scotland subdivision flag
  SEN: "🇸🇳", // Senegal
  SUI: "🇨🇭", // Switzerland
  SWE: "🇸🇪", // Sweden
  TUN: "🇹🇳", // Tunisia
  TUR: "🇹🇷", // Türkiye
  URU: "🇺🇾", // Uruguay
  USA: "🇺🇸", // United States
  UZB: "🇺🇿", // Uzbekistan
};

function flagFor(abbr) {
  return (abbr && WC_TEAM_FLAGS[abbr]) || "";
}

/* ----- Round batching -------------------------------------
   Group fixtures into rounds for staged pick availability.
   A round opens for picks WC_ROUND_OPEN_DAYS days before its
   first match. This keeps the UI focused (you don't see all
   104 matches on day one).

   The group stage is split into Matchday 1 / 2 / 3 by
   chronological order (each matchday is the first 24, next 24,
   last 24 of group-stage matches sorted by kickoff).
   ---------------------------------------------------------- */
const WC_ROUND_OPEN_DAYS = 14;

const WC_ROUNDS = [
  { id: "gs1",   name: "Group Stage · MD1", short: "GS · MD1",   stage: "group-stage",     gsMatchday: 1 },
  { id: "gs2",   name: "Group Stage · MD2", short: "GS · MD2",   stage: "group-stage",     gsMatchday: 2 },
  { id: "gs3",   name: "Group Stage · MD3", short: "GS · MD3",   stage: "group-stage",     gsMatchday: 3 },
  { id: "r32",   name: "Round of 32",       short: "R32",        stage: "round-of-32" },
  { id: "r16",   name: "Round of 16",       short: "R16",        stage: "round-of-16" },
  { id: "qf",    name: "Quarter Finals",    short: "QF",         stage: "quarterfinals" },
  { id: "sf",    name: "Semi Finals",       short: "SF",         stage: "semifinals" },
  { id: "play",  name: "Third Place",       short: "3rd",        stage: "3rd-place-match" },
  { id: "fin",   name: "Final",             short: "Final",      stage: "final" },
];
