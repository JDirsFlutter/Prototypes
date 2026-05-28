# How AI Works — backlog

Ranked by my read of value vs effort. James decides priority.

## High value, ship-when-ready

### 1. Pre-rendered MP3 audio (Option C from the audio chat)
**Why:** Browser TTS quality is uneven. Daniel/Samantha (Mac/iOS) is fine, Windows defaults are robotic. Pre-rendered MP3s give every user a studio-quality voice. The Listen UI already exists and would not change.
**Cost:** ~£15-25 one-off with OpenAI tts-1, or hundreds with ElevenLabs.
**Storage:** 150-250MB of MP3 in the repo. Needs GitHub LFS or external host (Cloudflare R2, S3) at that size.
**Blocker:** content is still being iterated. Every lesson edit invalidates the audio. Wait until lessons stabilise before pulling the trigger.
**Effort:** ~3-4 hours when the trigger fires (script the TTS API calls, upload, swap the audio source from Web Speech to `<audio>` element).

### 2. Section-end quizzes
**Why:** Currently you can speedrun all 84 buttons and "earn" every badge in 10 minutes. Without active recall, the badges are lipstick. Quizzes are what make them mean something.
**Scope:** 3-5 multiple choice per section, ~50 questions total. Gate the badge behind a passing score.
**Effort:** ~3 hours of writing (drafted by me, reviewed by James). Plus ~1 hour to wire the quiz UI + scoring.

### 3. Plain-English pass on the lesson bodies
**Why:** Some lessons still have engineer-flavoured asides ("you pay per token", "fp16 vs 4-bit", "VRAM at 4-bit"). The why-it-matters callouts I wrote are accessible but the lessons themselves drag the reader back into jargon.
**Scope:** Reread all 84 lessons, rewrite the technical asides for the same audience.
**Effort:** 4-5 hours, content stretch. Best done in one focused session.

### 4. Tier the content by expertise (James's idea, flagged "maybe tomorrow")
**Why:** Today every reader gets the same lesson. A complete beginner and a senior engineer both read "Tokens" identically. Tailoring depth to the reader is a real product moat — same course, three audiences.

Two flavours of the idea, worth picking before building:

**4a. Profile-based tiers** — user picks Beginner / Intermediate / Advanced at the home page (or via a setting). Every lesson then swaps content based on that pick. State: `STATE.tier`.
- Pro: cleaner reader experience, no extra UI per topic
- Con: ~84 topics × 3 tiers = ~250 lessons to write/maintain. Massive content lift. Drift risk every time we edit anything.

**4b. Progressive depth (single reader, one path, optional deeper layer)** — keep one lesson per topic, add an optional "Go deeper" expansion at the bottom that holds the technical detail (the fp16 talk, the maths, the napkin calculations). User taps to expand if they want it; ignores otherwise.
- Pro: ~half the content lift (one extra layer, not three). One source of truth per topic.
- Pro: respects the current "plain English first" framing
- Con: doesn't help a complete beginner who'd want SIMPLER than the current lesson

**Recommended path if/when we build this:** Start with 4b. It's roughly half the writing and most of the value. Add an "estimated depth" indicator per topic (Beginner / Intermediate / Advanced) so readers can self-select. Only escalate to 4a if 4b plus clear depth labels isn't enough.

**Effort:**
- 4b only: ~6-8 hours of writing for "Go deeper" panels on the 30-40 topics where it adds real value (not every topic needs one). Plus ~1 hour for the expand/collapse UI.
- 4a in full: 2-3 days of writing minimum, even with LLM-assisted drafts + review.

**LLM-assisted shortcut:** Draft the "Go deeper" or per-tier content with a model, then James reviews and edits. Cuts the drafting time roughly in half. Worth it.

**Things to think about before building:**
- Do beginners want to know they're on the "easy" tier? (Could feel patronising. Soften labels: "Plain English" / "More technical" / "Engineering depth".)
- Tier choice should be reversible from any page, not buried in settings
- Audio: which tier gets read aloud? Probably whatever's currently visible
- Migration: existing users (who've completed topics) should default to a tier that matches their progress shape

### 5. Holistic content review and rebalance (James's read: "banging but too much for most")
**Why:** Course content feels right to James personally but probably too much for the median reader. Two specific symptoms James called out:
- Many "Common beginner mistakes" cards don't pull their weight. They feel like filler in places, not real insight. Some should be dropped, others rewritten to be sharper.
- The lesson sections themselves could be richer. More concrete examples, stronger analogies, better "you've probably seen this in..." anchors. The current lessons sometimes feel rushed.

**The tension worth being honest about:** James said it's "banging" AND "too much for most" AND that he personally enjoys it. Those don't fully reconcile. The instinct to file the edges off for the average reader can also flatten the thing that makes James enjoy it. Before scaling any "cut the mistakes" or "shorten the lessons" pass to all 84 topics: decide whether the goal is *maximise reach* or *be the course James wishes existed*. Different products. Don't sand off everything sharp just because the median reader might find it long.

**Scope:**
- **Mistakes audit.** Read all 84 mistakes cards. Classify each: keep / replace / cut. Realistic outcome: cut 30-40% of cards entirely, rewrite another 20-30% to be sharper, leave the strong ones alone.
- **Lesson expansion pass.** Identify the 20-30 topics where the lesson feels thin or rushed. Add: a second concrete example, a real-world anchor, a stronger opening hook. Don't pad. Every added sentence has to earn its place.
- **Length calibration.** Decide a soft target ("a topic should take five minutes to read"). Topics that overshoot become candidates for the "Go deeper" pattern from item #4.

**This couples tightly to item #4.** If we tier (4b: optional Go deeper panel), the lesson expansion happens in the deeper layer and the average reader's experience gets simpler, not heavier. If we don't tier, expansion lengthens every lesson for every reader, which fights against the "too much" feedback. Recommendation: decide on #4 first, then run #5 inside that frame.

**Effort:**
- Mistakes audit + prune: ~2-3 hours
- Lesson expansion on the 20-30 thinnest topics: ~4-6 hours
- Combined: roughly a full focused day. Spread across two sessions for fresh judgement.

**Pre-work worth doing first:**
- Pick 5 representative topics, do the proposed treatment on them only, see if the result feels right before scaling to 84. Cheap test, big de-risk.

## Medium value

### 4. Streak save / streak freeze
**Why:** Duolingo's single biggest engagement lever. Lose a day, spend XP (or get one free per month) to keep the streak. Real loss-aversion mechanic.
**Effort:** ~1 hour. Pure localStorage.

### 5. Shareable per-topic URLs (`#hash` routing)
**Why:** Currently the URL stays `course.html` no matter what topic you're on. Sending someone the link drops them on the home page, not the topic. Common ask once the course starts circulating.
**Effort:** ~1 hour. Read `window.location.hash` on load → set `STATE.currentId`. Update hash on topic change. Handle back/forward.

### 6. Section-level XP totals in the sidebar
**Why:** "+ 230 XP" in Foundations gives finer-grained feedback than just a global counter. Tiny dopamine hit.
**Effort:** ~30 mins.

### 7. Glossary (hover/tap definitions on recurring terms)
**Why:** Words like "token", "parameter", "fine-tune", "embedding" repeat across topics. A reader who lands mid-course shouldn't have to backtrack.
**Effort:** ~2 hours. Build a glossary dict, regex-wrap target terms in `<span class="glossary-term" data-term="X">`, hover tooltip / mobile tap.

### 8. Auto-advance through a section in audio mode
**Why:** Listener finishes a topic, audio stops, they have to click next. Toggle to keep listening through the section.
**Effort:** ~30 mins. After Audio queue finishes, if toggle on, navigate to next topic and start its queue.

### 9. Resume audio from last position
**Why:** If you pause and navigate away, coming back restarts from the top. Annoying for long listens.
**Effort:** ~30 mins. Save Audio.index per topic in STATE.

### 10. Daily reminder option (Notification API)
**Why:** Push the streak. Opt-in browser notification (no email, no backend).
**Effort:** ~2 hours including the permission flow and quiet-hours respect.

### 11. Dark mode toggle
**Why:** Some readers prefer dark, especially evening. Current is light only.
**Effort:** ~2 hours. Add a third theme variant; persist preference.

## Low value / polish

### 12. Sentence-level audio highlighting
**Why:** While reading, highlight the active sentence. Nice for follow-along.
**Effort:** ~2-3 hours. Bind utterances to spans; track active index; CSS for the highlight.

### 13. Voice picker dropdown
**Why:** Some users have premium TTS voices installed they'd prefer. Currently uses OS default.
**Effort:** ~1 hour. Populate from `speechSynthesis.getVoices()`, save selection.

### 14. Fuzzy search across lesson bodies
**Why:** Current search filters titles only. Searching "RLHF" misses topics that mention it but don't have it as a title.
**Effort:** ~2 hours. Pre-index lesson text on load; rank by match strength.

### 15. Print-friendly stylesheet
**Why:** Some readers will want to save a section as PDF for offline reading.
**Effort:** ~1 hour. `@media print` rules.

### 16. Keyboard shortcuts surface
**Why:** Arrows / `c` are wired but undocumented. Show a small "?" key help overlay.
**Effort:** ~1 hour.

## Distribution / sharing

### 17. OG image per section
**Why:** Sharing a topic link in Slack/LinkedIn would show a generic OG image. Per-section OG images would be richer.
**Effort:** ~3-4 hours. Either: pre-render 11 SVGs, OR run an edge function (Cloudflare Workers) to generate dynamically. Edge function = infra.

### 18. Embeddable section snippets
**Why:** Let someone share one topic's why-it-matters + exercise as a quote in Slack/LinkedIn.
**Effort:** ~2 hours.

### 19. "Share this topic" button
**Why:** Copy the deep-link URL with one tap.
**Effort:** ~30 mins. Depends on #5 (URL routing) landing first.

## Speculative / strategic

### 20. Flutter-internal version
**Why:** If this lands well externally, it could become an internal Flutter Group training tool. Internal version would have proper Flutter branding (logo, "Flutter UK&I" framing) on a non-public host.
**Effort:** ~1 day. Mostly: deploy script changes, brand assets, possibly auth.

### 21. Multi-device progress sync
**Why:** Currently single-device. A reader who starts on phone, then opens on laptop, loses everything. Solution: tiny backend (Cloudflare KV or a single GitHub Gist trick keyed by a passphrase the user invents).
**Effort:** ~4-6 hours. Adds infra.

### 22. Per-user analytics
**Why:** Currently no idea who's using this, what they read, where they drop off. MS Clarity (already in the prototypes workspace per memory) could go on this page.
**Effort:** ~30 mins to add the Clarity script. Privacy review depending on host.

### 23. Translations
**Why:** Audience could be non-English. The "no maths, no code" framing works in any language.
**Effort:** Significant. Each language is ~84 topic translations + 11 section names + UI strings. Best done with LLM-assisted drafts + native reviewer.

## Things I'd actively NOT pursue

- **Hearts/lives.** Works for language-learning drills with right/wrong answers. Adds pointless friction to conceptual reading. (Discussed and dismissed in the gamification round.)
- **Linear gating** ("can't do RAG until you finish Foundations"). Kills the dip-in use case. Someone googling "what's QLoRA" should land straight on it.
- **Mascot / push notifications campaign.** Wrong tone for the engineering-adjacent audience.
- **Leaderboards.** Needs auth and a backend. Out of scope for a static Pages site.
