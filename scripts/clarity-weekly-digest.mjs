// Pull the last 3 days of Microsoft Clarity insights for the prototypes project,
// write a markdown digest to `clarity/digests/YYYY-WW.md` (ISO week), and exit 0.
// The calling routine handles git commit + push.
//
// API limit reminder: Clarity allows max 3 days back per call. A weekly cadence
// captures 3 of the past 7 days. If we want full 7-day coverage later, add a
// daily snapshot collector that appends to `clarity/raw/YYYY-MM-DD.json` and
// teach this script to consume that history.
//
// Required env: CLARITY_TOKEN

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DAYS_BACK = 3;

function loadEnvLocal() {
  const p = path.join(ROOT, ".env.local");
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
loadEnvLocal();

if (!process.env.CLARITY_TOKEN) {
  console.error("CLARITY_TOKEN not set.");
  process.exit(1);
}

async function fetchInsights(dimension) {
  const url = new URL("https://www.clarity.ms/export-data/api/v1/project-live-insights");
  url.searchParams.set("numOfDays", String(DAYS_BACK));
  if (dimension) url.searchParams.set("dimension1", dimension);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.CLARITY_TOKEN}` },
  });
  if (!res.ok) throw new Error(`Clarity API ${res.status}: ${await res.text()}`);
  return res.json();
}

const pickMetric = (payload, name) => payload.find((m) => m.metricName === name)?.information ?? [];

function isoWeek(d = new Date()) {
  const dt = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = dt.getUTCDay() || 7;
  dt.setUTCDate(dt.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((dt - yearStart) / 86400000 + 1) / 7);
  return { year: dt.getUTCFullYear(), week: String(weekNum).padStart(2, "0") };
}

function fmtDate(d) {
  return d.toISOString().slice(0, 10);
}

function shortenUrl(u) {
  return u.replace("https://jdirsflutter.github.io/Prototypes", "").replace(/\/$/, "/");
}

(async () => {
  const byUrl = await fetchInsights("URL");

  // Only production traffic
  const isProd = (u) => (u || "").startsWith("https://jdirsflutter.github.io");

  const traffic = pickMetric(byUrl, "DeadClickCount")
    .filter((r) => isProd(r.Url))
    .map((r) => ({ url: r.Url, sessions: Number(r.sessionsCount), views: Number(r.pagesViews) }))
    .sort((a, b) => b.sessions - a.sessions);

  const scrollRows = pickMetric(byUrl, "ScrollDepth").filter((r) => isProd(r.Url));
  const scrollByUrl = Object.fromEntries(scrollRows.map((r) => [r.Url, Number(r.averageScrollDepth)]));

  const engageRows = pickMetric(byUrl, "EngagementTime").filter((r) => isProd(r.Url));
  const engageByUrl = Object.fromEntries(engageRows.map((r) => [r.Url, { total: Number(r.totalTime), active: Number(r.activeTime) }]));

  const frictionMetrics = [
    ["DeadClickCount", "Dead clicks"],
    ["RageClickCount", "Rage clicks"],
    ["QuickbackClick", "Quick-back clicks"],
    ["ExcessiveScroll", "Excessive scrolling"],
    ["ScriptErrorCount", "Script errors"],
    ["ErrorClickCount", "Error clicks"],
  ];

  const friction = [];
  for (const [key, label] of frictionMetrics) {
    const hits = pickMetric(byUrl, key)
      .filter((r) => isProd(r.Url))
      .filter((r) => Number(r.sessionsWithMetricPercentage) > 0);
    for (const h of hits) {
      friction.push({
        label,
        url: h.Url,
        events: Number(h.subTotal),
        sessions: Number(h.sessionsCount),
        pct: Number(h.sessionsWithMetricPercentage),
      });
    }
  }
  friction.sort((a, b) => b.events - a.events);

  const totalSessions = traffic.reduce((s, r) => s + r.sessions, 0);
  const today = new Date();
  const from = new Date(today.getTime() - DAYS_BACK * 86400000);
  const { year, week } = isoWeek(today);

  let md = "";
  md += `# Clarity digest — ${year}-W${week}\n\n`;
  md += `_Window: ${fmtDate(from)} → ${fmtDate(today)} (last ${DAYS_BACK} days, all UTC)_  \n`;
  md += `_Generated: ${today.toISOString()}_\n\n`;
  md += `**${totalSessions} production sessions across ${traffic.length} URL${traffic.length === 1 ? "" : "s"}**.\n\n`;

  if (!traffic.length) {
    md += `> No production sessions in this window. Nothing to dig into.\n`;
  } else {
    md += `## Per-URL\n\n`;
    md += `| URL | Sessions | Views | Scroll | Active time |\n`;
    md += `|---|---:|---:|---:|---:|\n`;
    for (const r of traffic) {
      const scroll = scrollByUrl[r.url] != null ? `${scrollByUrl[r.url]}%` : "—";
      const t = engageByUrl[r.url];
      const active = t ? `${t.active}s` : "—";
      md += `| ${shortenUrl(r.url)} | ${r.sessions} | ${r.views} | ${scroll} | ${active} |\n`;
    }
    md += `\n`;

    md += `## Friction\n\n`;
    if (!friction.length) {
      md += `No friction signals (dead clicks, rage clicks, quick-backs, excessive scrolling, script errors, error clicks).\n\n`;
    } else {
      md += `| Signal | URL | Events | Sessions hit | % of sessions |\n`;
      md += `|---|---|---:|---:|---:|\n`;
      for (const f of friction) {
        md += `| ${f.label} | ${shortenUrl(f.url)} | ${f.events} | ${f.sessions} | ${f.pct}% |\n`;
      }
      md += `\n`;
    }

    md += `## What stood out\n\n`;
    const lines = [];
    const topByEngagement = traffic
      .map((r) => ({ url: r.url, active: engageByUrl[r.url]?.active ?? 0 }))
      .sort((a, b) => b.active - a.active)[0];
    if (topByEngagement && topByEngagement.active > 0) {
      lines.push(`- **Most engaged:** ${shortenUrl(topByEngagement.url)} (${topByEngagement.active}s active time)`);
    }
    const topByDropoff = traffic
      .map((r) => ({ url: r.url, sessions: r.sessions, active: engageByUrl[r.url]?.active ?? 0 }))
      .filter((r) => r.sessions >= 2 && r.active <= 5)
      .sort((a, b) => b.sessions - a.sessions)[0];
    if (topByDropoff) {
      lines.push(`- **Bounce candidate:** ${shortenUrl(topByDropoff.url)} — ${topByDropoff.sessions} sessions but only ${topByDropoff.active}s active time on average`);
    }
    if (friction.length) {
      const worst = friction[0];
      lines.push(`- **Friction hotspot:** ${worst.label.toLowerCase()} on ${shortenUrl(worst.url)} — ${worst.events} events across ${worst.sessions} session${worst.sessions === 1 ? "" : "s"} (${worst.pct}% of those sessions)`);
    }
    if (totalSessions < 20) {
      lines.push(`- **Caveat:** n=${totalSessions} is thin; anything here is directional only.`);
    }
    md += lines.length ? lines.join("\n") + "\n" : "Nothing significant to flag this week.\n";
  }

  // Write to disk
  const outDir = path.join(ROOT, "clarity", "digests");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${year}-W${week}.md`);
  fs.writeFileSync(outPath, md);
  console.log(`Wrote ${outPath}`);
})().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
