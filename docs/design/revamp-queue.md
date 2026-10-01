# Phase 5 revamp: instruction queue (resume checklist)

The revamp agent was interrupted by a laptop shutdown on 2026-10-01. Work on disk is a WIP snapshot
on branch `v2`. On resume, verify each item below against the code and screenshots; finish what is missing.
Spec: `docs/design/ui-spec.md`. Checks must pass: `npm run typecheck`, `npm run lint`, `npm run build`.

## Agent's final status (reported before shutdown)
Everything below was reported DONE except these, which are the first things to do on resume:
1. `npm i @fontsource-variable/bricolage-grotesque` + import in `src/main.tsx` (heading rules already reference `--font-display`).
2. `npm run emoji:fetch` (script exists, never run) → populate `public/emoji3d/`, record any 404 substitutions.
3. `npm run build` was NOT run on the final state; typecheck + lint passed. Run all three and fix.
4. Missing screenshots: history desktop, settings sheet (both widths), light dashboard, lite dashboard, error page,
   theme-survives-reload check. Desktop shots are ~1385px wide (Chrome window limit), acceptable.
5. Leaderboard shots used demo data (Convex socket didn't connect from that Chrome profile). Demo flag is dev-only.

## Base brief
- [ ] Full spec implemented: atmosphere layers, 3 surface levels, subject tints, desktop icon sidebar + two-column
      dashboard with right rail, premium (full-colour) 3dicons, dot progress, visible share card, streak dots, light = cream
- [ ] Screenshots saved to `docs/design/screens/{screen}-{mobile|desktop}.png` for: dashboard, subject card, quiz,
      results, leaderboard, history, settings sheet, light dashboard, lite dashboard

## Additions sent during the run (in order)
- [ ] Credit card (`landing/DevCredit.tsx`): premium card; whole card links to https://zubyr.dev (new tab); inside it a WIDE soft
      amber-tinted "Portfolio" button (person glyph left, link-out arrow right) + GitHub (https://github.com/zubairbinshaukat/quiz-slayer)
      and LinkedIn (https://www.linkedin.com/in/zubairbinshaukat) icon buttons that stop propagation; NO "Open source"/"v2" chips;
      3D icon (magic-trick or rocket premium) overflowing top-right; owner's Z mark from `public/zubyr-logo.svg` rendered INLINE
      with `currentColor` at 44px, NO tile/background; Settings → About rows: Built by, Source on GitHub, Version
- [ ] Haptics `src/lib/haptics.ts` (tap 8ms, correct [12], wrong [30,40,30]) on answer select, keycap press, tab taps
- [ ] Answer feedback instant and non-blocking; no select-then-submit in practice
- [ ] Theme toggle beside the Settings gear on every breakpoint, icon morph 200ms; theme persists across reload (pre-paint script)
- [ ] Custom thin themed scrollbars everywhere (webkit + scrollbar-color), hidden on snap carousels
- [ ] Lite mode keeps cheap motion (fades ≤150ms, colour transitions, keycap flash, tab indicator, ring 300ms); drops glow/grain/blur/
      Lenis/view transitions/confetti/shimmer/stagger/hover lifts/count-up
- [ ] Route `errorElement` → `pages/ErrorPage.tsx`; auto-reload once on chunk-load failure (`qs-reloaded-once`)
- [ ] Demo leaderboard `src/lib/leaderboardDemo.ts` with `DEMO_LEADERBOARD = true` (owner will ask to remove); "you" at rank 6
- [ ] Wrong answer: coral + shake 360ms + haptic; on mobile explanation opens as a bottom SHEET at the same moment
      (grab handle, coral wash, 3D cross ~40px, "Not quite" 20/800, "Correct answer: B", text clamped 3 lines,
      amber "Read full explanation ↓" link, pinned amber 56px "Next question →" / "See results 🏁" with Fluent chequered flag);
      desktop keeps inline panel with the same anatomy
- [ ] Correct answer: mint + 3D check + "+10 XP" floating chip; local cosmetic XP in `qs-xp` (+10 per correct), shown on streak
      card and stats strip; labelled "XP", never "points"
- [ ] Practice question card matches the owner's reference: radius-24 card, subject chip with 3D lock, soft pill options
      (radius 16, 56px, surface-2, circular letter badge), green/coral states, soft feedback panel, "← Previous" ghost +
      "Next question →" amber with soft shadow; light = cream page + white card
- [ ] Theme switch circle reveal via View Transitions from click position (`--vt-x/--vt-y`), 500ms; instant in lite
- [ ] Podium choreography: blocks scaleY rise (3rd .1s, 2nd .35s, 1st .6s, bouncy), avatars drop, names fade, crown wobble loop,
      shine sweep every 5s on #1, confetti from #1 avatar after ~1.35s; `.play` class + replay helper; instant in lite
- [ ] Tab bar: floating pill; centre raised 60px amber circle with owner's gold trophy (`public/trophy-gold.png` → white bg removed →
      `public/icons3d/trophy-gold.webp` 128 + @1x 64) at 34px, lifted 18px, label BELOW with 6px gap, never overlapping;
      bolder matching Home/History glyphs; active amber dot slides; press scale .94 + haptic; on scroll-down >24px labels
      collapse and bar 64→52px, trophy/circle stay FULL SIZE (no scale); restores on scroll-up; `--tabbar-height` on <html>
- [ ] Fluent 3D emoji (MIT) via `scripts/fetch-emoji.mjs` → `public/emoji3d/*.webp` + LICENSE: check/cross on answered options
      (SVG fallback), avatars for EVERYONE (animal names → matching animal; chosen names → stable random from ~40-emoji pool),
      `src/lib/emoji3d.ts` + `<Emoji3D/>`
- [ ] Leaderboard name prompt: inline card at top on EVERY visit until a name is chosen (session-only dismissal), attention
      shake + haptic on mount; "Choose name" button still opens the sheet
- [ ] Sticky "you" bar: fixed above the tab bar (`--tabbar-height` + 12px + safe area), opaque, only visible when own row is
      off-screen (IntersectionObserver), slide in/out 220ms, tap scrolls to row, list bottom padding reserved
- [ ] Bricolage Grotesque (`@fontsource-variable/bricolage-grotesque`, self-hosted) as `--font-display` for display/H1/H2,
      score numerals, podium names, feedback titles, subject card titles; 800, -0.02em
