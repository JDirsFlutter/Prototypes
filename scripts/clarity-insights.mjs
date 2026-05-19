// Fetch a digest from Microsoft Clarity's Data Export API for the prototypes project.
// Usage:
//   node scripts/clarity-insights.mjs              # 1 day, URL breakdown, /big-jackpots focus
//   node scripts/clarity-insights.mjs --days 3     # last 3 days
//   node scripts/clarity-insights.mjs --all        # show all URLs, not just /big-jackpots/*
//
// Token is read from CLARITY_TOKEN env var, or from .env.local in the project root.
// Token is read from CLARITY_TOKEN env var, or from .env.local in the project root.
// The API allows 10 calls per project per day, max 3 days back per call.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function loadEnvLocal() {
  const p = path.join(ROOT, ".env.local");
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
loadEnvLocal();

const args = process.argv.slice(2);
const daysIdx = args.indexOf("--days");
const days = daysIdx >= 0 ? parseInt(args[daysIdx + 1], 10) : 1;
const showAll = args.includes("--all");

if (!process.env.CLARITY_TOKEN) {
  console.error("CLARITY_TOKEN not set. Add it to .env.local or pass it inline.");
  process.exit(1);
}

const ENDPOINT = "https://www.clarity.ms/export-data/api/v1/project-live-insights";

async function fetchInsights(dimension) {
  const url = new URL(ENDPOINT);
  url.searchParams.set("numOfDays", String(days));
  if (dimension) url.searchParams.set("dimension1", dimension);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.CLARITY_TOKEN}` },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Clarity API ${res.status} for dimension=${dimension || "(none)"}: ${body}`);
  }
  return res.json();
}

function pickMetric(payload, name) {
  return payload.find((m) => m.metricName === name)?.information ?? [];
}

function fmt(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return String(n);
  if (x >= 1000) return x.toLocaleString("en-US");
  return String(x);
}

function isPublic(url) {
  return url.startsWith("https://jdirsflutter.github.io");
}
function isBigJackpots(url) {
  return url.includes("/big-jackpots");
}
function filterRows(rows) {
  if (showAll) return rows;
  // Default view: public production traffic only, all routes (so we can compare big-jackpots vs siblings)
  return rows.filter((r) => isPublic(r.Url || ""));
}

(async () => {
  console.log(`\nClarity insights — last ${days} day${days > 1 ? "s" : ""}`);
  console.log("=".repeat(60));

  const byUrl = await fetchInsights("URL");

  // Sessions per URL: pulled from any friction-metric row (sessionsCount is the per-URL field, same across all metrics)
  const trafficRows = filterRows(pickMetric(byUrl, "DeadClickCount"))
    .sort((a, b) => Number(b.sessionsCount) - Number(a.sessionsCount));
  console.log("\nSessions per URL (production traffic only)");
  if (!trafficRows.length) {
    console.log("  No production sessions yet.");
  } else {
    trafficRows.forEach((r) => {
      const flag = isBigJackpots(r.Url) ? " ←" : "";
      console.log(`  ${String(r.sessionsCount).padStart(5)} sessions  ${r.Url}${flag}`);
    });
  }

  // Friction: a metric is interesting when sessionsWithMetricPercentage > 0
  const friction = [
    ["DeadClickCount", "Dead clicks"],
    ["RageClickCount", "Rage clicks"],
    ["QuickbackClick", "Quick-backs"],
    ["ExcessiveScroll", "Excessive scrolling"],
    ["ScriptErrorCount", "Script errors"],
    ["ErrorClickCount", "Error clicks"],
  ];

  console.log("\nFriction — URLs with any signal");
  let any = false;
  for (const [key, label] of friction) {
    const hits = filterRows(pickMetric(byUrl, key)).filter((r) => Number(r.sessionsWithMetricPercentage) > 0);
    if (!hits.length) continue;
    any = true;
    console.log(`  ${label}:`);
    hits
      .sort((a, b) => Number(b.subTotal) - Number(a.subTotal))
      .forEach((r) => {
        const flag = isBigJackpots(r.Url) ? " ←" : "";
        console.log(`    - ${r.Url}${flag}`);
        console.log(`        ${r.subTotal} events in ${r.sessionsCount} sessions (${r.sessionsWithMetricPercentage}% of sessions)`);
      });
  }
  if (!any) console.log("  None.");

  // Scroll depth
  const scrollRows = filterRows(pickMetric(byUrl, "ScrollDepth"));
  if (scrollRows.length) {
    console.log("\nScroll depth (avg %)");
    scrollRows
      .sort((a, b) => Number(b.averageScrollDepth) - Number(a.averageScrollDepth))
      .forEach((r) => {
        const flag = isBigJackpots(r.Url) ? " ←" : "";
        console.log(`  ${String(r.averageScrollDepth).padStart(6)}%   ${r.Url}${flag}`);
      });
  }

  // Engagement time (Clarity returns the field name in lowerCamelCase but the exact key varies — fall back to any numeric field)
  const engageRows = filterRows(pickMetric(byUrl, "EngagementTime"));
  if (engageRows.length) {
    console.log("\nEngagement time (raw)");
    engageRows.forEach((r) => {
      const flag = isBigJackpots(r.Url) ? " ←" : "";
      const fields = Object.entries(r)
        .filter(([k]) => k !== "Url")
        .map(([k, v]) => `${k}=${v}`)
        .join("  ");
      console.log(`  ${r.Url}${flag}\n      ${fields}`);
    });
  }

  console.log();
})().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
