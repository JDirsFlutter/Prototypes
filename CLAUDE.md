@AGENTS.md

# How AI Works course (lives in this repo)

The single most active artefact in this repo is the **How AI Works** course at `public/course.html`. Before editing anything course-related, read `docs/CONTEXT.md` for full background, decisions, brand tokens, and constraints. `docs/BACKLOG.md` lists ranked future work.

## File layout

- `public/course.html` — UI shell, CSS, all rendering JS. ~1000 lines. Edit this for layout, styling, gamification logic, audio, drawer, home page, badges.
- `public/course-data.js` — the 84-topic content (defines `const COURSE`). ~6000 lines. Edit this for any topic content (lesson, mental model, mistakes, goDeeper, why-it-matters, section exercises).
- `public/og-image.svg` — social card.
- `docs/CONTEXT.md` — project background, naming/brand decisions, state shape, working-style rules.
- `docs/BACKLOG.md` — ranked future enhancements.

## How loading works

`course.html` includes `<script src="course-data.js"></script>` before its main `<script>` block. `COURSE` is a global defined in `course-data.js` and read by the renderer in `course.html`. Both files must be served from the same directory (already are).

## Editing rules of thumb

- **Content change to one topic?** Edit `course-data.js`, find by topic id (e.g. `id: "tokens"`), change the relevant field.
- **New feature on the topic page?** Edit `course.html` (mostly the renderContent function and the CSS).
- **Don't put both kinds of change in one commit** if possible. Keeps PR reviews readable.
- **Validate before committing** — run `node -e "const fs=require('fs'); const d=fs.readFileSync('public/course-data.js','utf8'); new Function(d + ';return COURSE;')();"` to confirm the data file parses and the COURSE constant comes out shaped right.
- **Deploy:** push to `main`. GitHub Actions publishes the site in ~50s.

## Hard rules

- Never use em dashes anywhere (course content, code comments, commit messages). Use commas, periods, colons, semicolons, parentheses. (Author's voice rule.)
- Don't mention the "84 lessons" count in any public-facing copy (page title, meta, OG, topbar, home page). Internal UI counters that say `X / 84` are fine.
- Don't put a Flutter or PokerStars wordmark/logo on this page. It's a public-host artefact; the brand-token styling stays but identity claims don't.
- Public-Pages rule: no internal PokerStars/Flutter data in course content. It's generic LLM education.
