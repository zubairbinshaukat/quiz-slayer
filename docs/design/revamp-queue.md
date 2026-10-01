# Phase 5 revamp: instruction queue (verified checklist)

Phase 5 was interrupted by a laptop shutdown on 2026-10-01 and resumed the same day. Every item below was
re-verified against the code (independent audit) and in a headless browser at 390px and 1440px.
Spec: `docs/design/ui-spec.md`. `npm run typecheck`, `npm run lint`, `npm run build` all pass.

## Resume log (2026-10-01)
- Bricolage Grotesque installed + imported (weight axis only, 41 KB latin; the wdth/opsz files are 2-3x larger).
- `npm run emoji:fetch` run: 85/85 saved. The only 404 was a casing typo (`T-Rex` → `T-rex`); no substitutions.
- Screenshots added at true widths: `history-*`, `settings-*`, `dashboard-light-*`, `dashboard-lite-*`, `error-*`.
- Checked in the browser: theme survives reload with no dark first paint; lite mode sets `data-lite` and drops
  Lenis + glow; a failed route chunk reloads exactly once, then shows the error page.
- Gaps the audit found and that are now fixed: "+10 XP" is a real chip; podium confetti bursts from the #1 avatar
  and unmounts; shake / XP pop no longer replay on Next → Previous; "See results" skips the extra confirm when
  everything is answered; "Read full explanation" works for subjects with only a short explanation; ← / → arrows
  on Previous / Next; podium names + subject titles are 800; share image score uses Bricolage; haptics stay on in
  lite mode; lite mode also stops `animate-pulse` and press `scale`; Version row reads 2.0.0; stale "Know more" copy.
- Known deviations, left as is:
  - Question-card chip shows the subject's own 3D icon (shield for cybersecurity), not a fixed lock.
  - XP sits in the stats strip on mobile; the streak card with the XP chip is desktop only.
  - Share preview is 300px (spec says ~320). Tab-bar amber dot only slides between Home and History (the centre
    trophy is its own active state).
  - `public/trophy-gold.png` (the source for `scripts/prep-trophy.mjs`) was never committed; only the WebP outputs exist.
- Leaderboard shots still use demo data (`DEMO_LEADERBOARD`, dev-only). The Convex WebSocket is reset intermittently
  on this network from the browser (HTTP and Node connect fine), so live data could not be captured.
- Still to do after Phase 5: Vitest, README rewrite, unused-export cleanup, code review, Lighthouse on the prod build.

## Base brief
- [x] Full spec implemented: atmosphere layers, 3 surface levels, subject tints, desktop icon sidebar + two-column
      dashboard with right rail, premium (full-colour) 3dicons, dot progress, visible share card, streak dots, light = cream
- [x] Screenshots saved to `docs/design/screens/{screen}-{mobile|desktop}.png` for: dashboard, subject card, quiz,
      results, leaderboard, history, settings sheet, light dashboard, lite dashboard

## Additions sent during the run (in order)
- [x] Credit card (`landing/DevCredit.tsx`): premium card; whole card links to https://zubyr.dev (new tab); inside it a WIDE soft
      amber-tinted "Portfolio" button (person glyph left, link-out arrow right) + GitHub (https://github.com/zubairbinshaukat/quiz-slayer)
      and LinkedIn (https://www.linkedin.com/in/zubairbinshaukat) icon buttons that stop propagation; NO "Open source"/"v2" chips;
      3D icon (magic-trick or rocket premium) overflowing top-right; owner's Z mark from `public/zubyr-logo.svg` rendered INLINE
      with `currentColor` at 44px, NO tile/background; Settings → About rows: Built by, Source on GitHub, Version
- [x] Haptics `src/lib/haptics.ts` (tap 8ms, correct [12], wrong [30,40,30]) on answer select, keycap press, tab taps
- [x] Answer feedback instant and non-blocking; no select-then-submit in practice
- [x] Theme toggle beside the Settings gear on every breakpoint, icon morph 200ms; theme persists across reload (pre-paint script)
- [x] Custom thin themed scrollbars everywhere (webkit + scrollbar-color), hidden on snap carousels
- [x] Lite mode keeps cheap motion (fades ≤150ms, colour transitions, keycap flash, tab indicator, ring 300ms); drops glow/grain/blur/
      Lenis/view transitions/confetti/shimmer/stagger/hover lifts/count-up
- [x] Route `errorElement` → `pages/ErrorPage.tsx`; auto-reload once on chunk-load failure (`qs-reloaded-once`)
- [x] Demo leaderboard `src/lib/leaderboardDemo.ts` with `DEMO_LEADERBOARD = true` (owner will ask to remove); "you" at rank 6
- [x] Wrong answer: coral + shake 360ms + haptic; on mobile explanation opens as a bottom SHEET at the same moment
      (grab handle, coral wash, 3D cross ~40px, "Not quite" 20/800, "Correct answer: B", text clamped 3 lines,
      amber "Read full explanation ↓" link, pinned amber 56px "Next question →" / "See results 🏁" with Fluent chequered flag);
      desktop keeps inline panel with the same anatomy
- [x] Correct answer: mint + 3D check + "+10 XP" floating chip; local cosmetic XP in `qs-xp` (+10 per correct), shown on streak
      card and stats strip; labelled "XP", never "points"
- [x] Practice question card matches the owner's reference: radius-24 card, subject chip with 3D lock, soft pill options
      (radius 16, 56px, surface-2, circular letter badge), green/coral states, soft feedback panel, "← Previous" ghost +
      "Next question →" amber with soft shadow; light = cream page + white card
- [x] Theme switch circle reveal via View Transitions from click position (`--vt-x/--vt-y`), 500ms; instant in lite
- [x] Podium choreography: blocks scaleY rise (3rd .1s, 2nd .35s, 1st .6s, bouncy), avatars drop, names fade, crown wobble loop,
      shine sweep every 5s on #1, confetti from #1 avatar after ~1.35s; `.play` class + replay helper; instant in lite
- [x] Tab bar: floating pill; centre raised 60px amber circle with owner's gold trophy (`public/trophy-gold.png` → white bg removed →
      `public/icons3d/trophy-gold.webp` 128 + @1x 64) at 34px, lifted 18px, label BELOW with 6px gap, never overlapping;
      bolder matching Home/History glyphs; active amber dot slides; press scale .94 + haptic; on scroll-down >24px labels
      collapse and bar 64→52px, trophy/circle stay FULL SIZE (no scale); restores on scroll-up; `--tabbar-height` on <html>
- [x] Fluent 3D emoji (MIT) via `scripts/fetch-emoji.mjs` → `public/emoji3d/*.webp` + LICENSE: check/cross on answered options
      (SVG fallback), avatars for EVERYONE (animal names → matching animal; chosen names → stable random from ~40-emoji pool),
      `src/lib/emoji3d.ts` + `<Emoji3D/>`
- [x] Leaderboard name prompt: inline card at top on EVERY visit until a name is chosen (session-only dismissal), attention
      shake + haptic on mount; "Choose name" button still opens the sheet
- [x] Sticky "you" bar: fixed above the tab bar (`--tabbar-height` + 12px + safe area), opaque, only visible when own row is
      off-screen (IntersectionObserver), slide in/out 220ms, tap scrolls to row, list bottom padding reserved
- [x] Bricolage Grotesque (`@fontsource-variable/bricolage-grotesque`, self-hosted) as `--font-display` for display/H1/H2,
      score numerals, podium names, feedback titles, subject card titles; 800, -0.02em
