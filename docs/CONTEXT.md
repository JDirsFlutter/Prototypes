# How AI Works — course context

A self-paced public course on how modern AI works, written for non-engineers. Single-file HTML, deployed to GitHub Pages.

## Where it lives

- **Live URL:** https://JDirsFlutter.github.io/Prototypes/course.html
- **Deployed source:** `/Users/dirsjame/Library/CloudStorage/OneDrive-TheStarsGroup/Desktop/Claude C JD/pokerstars-prototypes/public/course.html`
- **OG image:** `/Users/dirsjame/Library/CloudStorage/OneDrive-TheStarsGroup/Desktop/Claude C JD/pokerstars-prototypes/public/og-image.svg`
- **Original (pre-deploy copy, not authoritative now):** `/Users/dirsjame/Library/CloudStorage/OneDrive-TheStarsGroup/Desktop/Claude C JD/course.html`
- **Repo:** `JDirsFlutter/Prototypes`. Deploy via GitHub Actions on push to `main`, build takes ~50-60s.

## Architecture

- One `course.html` file, ~2700 lines, no build step
- Vanilla JS + CSS, no frameworks, no dependencies
- All state in `localStorage` under key `llm-course-state-v1`
- Static GitHub Pages: no backend, no secrets, no env vars, no API keys client-side

## Naming and brand decisions

- **Title is "How AI Works"** (was "LLM Engineering Course", changed because "engineering" framing put off non-technical readers — the actual audience)
- **Never mention the 84-topic count in public-facing copy** (page title, meta description, OG card, topbar, home page). Hidden everywhere to lower the perceived effort barrier. The internal progress counter in the sidebar still shows `X/84` once you're engaged.
- **Flutter UK&I brand tokens applied**: Poppins font (400/500/600/700), navy `#021237`, accent blue `#0091FF`, card grey `#F4F6FA`, light theme, diagonal-beam topbar treatment (skewed gradient bands on the right). Brand tokens lifted from `/Users/dirsjame/Library/CloudStorage/OneDrive-TheStarsGroup/Desktop/Claude C JD/flutter-pptx-v4/references/flutter-design/colors_and_type.css`.
- **No Flutter wordmark or logo on the page.** It's a public host (`JDirsFlutter.github.io`), adding a Flutter mark would make it look like official Flutter content. Brand-aligned styling only, no impersonation risk.
- **Footer tagline (kept verbatim):** "made by James, stealing Dave's idea, which he stole from Linkedin in the first place"

## Content structure

- **11 sections, 84 topics total**
- **Per-topic data shape:** `{ id, title, whyItMatters, lesson (HTML), model, mistakes (array) }`. No per-topic `exercise` (removed in the content review).
- **Per-section data shape:** `{ section, exercise, topics: [...] }`. One exercise per section, shown on the last topic of that section AND inside the badge celebration.
- **Section list (in order):** Foundations (11), Datasets & Training (10), Fine-Tuning (8), Inference & Optimization (9), Local AI Ecosystem (9), RAG & Memory (6), Agents & Workflows (8), Model Types (6), Deployment (5), Evaluation (5), Real-World Skills (7).
- **"Why it matters" callout** appears at the top of every topic page, before the Lesson card, light accent-blue background with a 4px accent border-left.
- **Section exercises are non-technical**, phone-doable in 5 minutes, no installs. The original 84 per-topic exercises were dropped because most required Python, GPUs, or Hugging Face accounts — wrong for the audience.

## Feature build order (chronological)

1. Pushed the original 84-topic course HTML to the repo
2. Applied Flutter UK&I brand tokens (Poppins, navy + accent blue, light theme, diagonal-beam topbar)
3. Retitled "LLM Engineering Course" → "How AI Works"; dropped "84 lessons" from all public copy
4. Gamification: 🔥 streak counter, ★ XP (10/topic, 100/badge), 11 named section badges, end-of-section celebration overlay with the beam motif and the section exercise inline
5. Content review: added "Why it matters" callout to every topic; replaced 84 per-topic exercises with 11 non-technical section exercises
6. Home/landing page in the main content area; sidebar Home link; dynamic CTA ("Start with Foundations" / "Pick up where you left off" / "Review from the start"); one-time migration that routes existing users to the home page once via a `seenHomeV1` flag
7. Mobile fix: sidebar converted to off-canvas drawer with hamburger toggle, backdrop, body scroll lock; topbar compressed for narrow screens; cards / nav buttons rebalanced
8. Audio playback: Web Speech API (browser TTS) with play/pause/resume, speed cycle (1x → 1.25x → 1.5x → 2x), Chrome 14-second-bug keep-alive workaround, auto-stop on every navigation and on celebration

## State shape (localStorage)

```
{
  completed:           { topicId: true, ... },
  currentId:           "__home" | topicId,
  search:              string,
  xp:                  number,                  // 10 per topic, 100 per badge
  streak:              number,
  lastCompletionDate:  "YYYY-MM-DD" | null,
  badges:              { sectionName: true, ... },
  celebrated:          { sectionName: true, ... }, // dismissed celebration screen
  seenHomeV1:          true,                    // migration flag
  audioRate:           1.0 | 1.25 | 1.5 | 2.0
}
```

## Sidebar behaviour

- **Desktop (>880px):** fixed left column, 320px wide, scrolls independently
- **Mobile (≤880px):** off-canvas drawer triggered by ☰ hamburger in topbar; semi-transparent backdrop; body scroll locked while open; auto-closes on any navigation
- Always shows: Home link (top), per-section progress count + earned-badge dot, search filter, controls (Reset / Export / Import)

## Working style rules (from user's voice doc)

- Very direct, casual, no sugar-coating
- Lead with the answer, then reasoning if needed
- Push back on ideas, suggest trade-offs, don't just execute
- **Hard rule: never use em dashes** (use commas, periods, colons, parens, semicolons instead)
- Concise, no filler, no over-formatting
- Talk to user like a leadership-level peer

## Deploy pipeline

- Commit + push to `main` on `JDirsFlutter/Prototypes` via SSH
- GitHub Actions builds and publishes Pages site (~50-60s)
- Allowlist rule in `.claude/settings.local.json` permits `git -C "<full path>" push origin main` — must use that exact form
- Verify live deploys with `curl` + `grep` for expected markup/JS snippets
- No connected Chrome browser via the Claude in Chrome extension on this machine, so visual verification needs user to refresh

## Constraints worth not forgetting

- **No backend, no secrets.** Anything new must be client-side only OR introduce real infra (last resort)
- **Content is still moving.** Don't pay to pre-render 84 audio files yet — every lesson edit invalidates them
- **Public host = no PokerStars/Flutter internal data.** Content is generic LLM education
- **No accounts, no login.** Progress is single-device via localStorage. Export/Import buttons in the sidebar are the manual sync mechanism
- **Single source file.** Editing requires care: ~2700 lines of mixed HTML/CSS/JS. JS parsing should be validated after any large change (`node -e "new Function(scriptBody)"` smoke test)

## Index of related memory entries

- `project_pokerstars_prototypes.md` — the parent Next.js prototypes workspace this lives in
- `project_prototypes_public_pages_rule.md` — what's safe to put on the public host
- `feedback_markdown_viewer.md` — surface .md outputs via the local viewer when sharing with the user
