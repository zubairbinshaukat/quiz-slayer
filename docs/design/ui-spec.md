# Quiz Slayer — Visual spec (v2, "premium")

This is the contract for the look of the app. The first dark pass was clean but flat and generic;
this version adds depth, colour, a real desktop layout and gamified moments. Written 2026-10-01.

References studied: Kuizu (Orenji Studio, Dribbble 24892796) for podium / streak / quiz card;
"LMS Dark Dashboard" (Habib, Dribbble 26438603) for the desktop shell; Brilliant and Headway for
hero restraint. We borrow structure, not assets.

## 1. Atmosphere (the thing that was missing)

- **Never flat black.** `body` background is `#0B0B0F` plus two fixed, non-scrolling layers:
  1. a radial amber glow: `radial-gradient(900px 600px at 15% -10%, rgb(245 183 58 / 0.14), transparent 60%)`
     and a second cooler one: `radial-gradient(700px 500px at 110% 20%, rgb(110 168 255 / 0.07), transparent 60%)`.
  2. a 3% opacity grain: inline SVG `feTurbulence` data-URI, `mix-blend-mode: overlay`, 200px tile.
  Lite mode drops both layers.
- **Three surface levels**, each one step lighter: `surface` `#141419`, `surface-2` `#1B1B22`, `surface-3` `#22222B`.
  Cards use `surface`; nested chips/inputs use `surface-2`; hover/active lifts to `surface-3`.
- **Borders**: `1px solid rgb(255 255 255 / 0.07)` + `box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.05)`.
  Hovered cards: border `rgb(255 255 255 / 0.14)`, plus `0 12px 40px -12px rgb(0 0 0 / 0.6)`.
- **Tints**: every subject gets a hue from its slug hash (keep existing hash). A card paints
  `radial-gradient(240px 160px at 100% 0%, hsl(H 80% 60% / 0.22), transparent 70%)` in its top-right corner,
  and the 3D icon sits in that glow. This is what makes the subject grid feel alive.
- **Accent discipline**: amber is for the primary CTA, the active nav indicator, podium #1, progress fills, and
  focus rings. Nothing else is amber.
- **Light theme** is cream, not white: bg `#F6F4EE`, surface `#FFFFFF`, surface-2 `#F1EEE7`, text `#15151A`,
  glows at half opacity. It must look designed, not inverted.

## 2. Type

Geist Variable (sans) + Geist Mono Variable (numbers, timers, points, codes).
- Display: 40/44 (mobile) → 56/60 (desktop), weight 800, tracking -0.03em.
- H1 page: 28 → 36, weight 800, tracking -0.02em. H2 section: 18 → 20, weight 700.
- Body 15/16, muted `#9A9AA3`. Eyebrow labels 11px, weight 700, tracking +0.12em, uppercase, muted.
- Numbers: `font-variant-numeric: tabular-nums`. Score hero: 96px mono-ish (use Geist 800 with tabular nums).

## 3. Layout and shell

### Desktop ≥ 1024
- **Left icon sidebar**, 76px wide, full height, `surface` with right border: logo mark at top (amber on hover),
  then Home, Leaderboard, History, and at the bottom Settings. Active item: amber pill background behind the icon
  + 3px amber bar on the left edge. Tooltips on hover.
- Content area max 1180px, padding 40px, **two columns on the dashboard**: main (1fr) + right rail (340px).
- No top navbar on desktop. Page title lives in the content.

### Tablet 768–1023
- Top navbar (wordmark left, icon buttons right), single column, subject grid 2-col, rail content stacks under.

### Mobile < 768
- Top bar: wordmark left, Settings gear right only. Translucent `surface/80` with `backdrop-filter: blur(12px)`
  (disabled in lite mode).
- Bottom tab bar: Home, Leaderboard, History. Active = amber icon + small amber dot + label; inactive muted.
  Floating style: 16px inset from edges, pill radius, `surface-2`, shadow, safe-area padded.
- Hidden on /quiz/*.

## 4. Dashboard (Home)

Main column, top to bottom:
1. **Hero row**: eyebrow "QUIZ SLAYER", display heading "Ready to slay?" (or "Welcome back, {name}" when a
   name is chosen), sub line "You've cleared 24 of 87 questions in Cybersecurity" (or a first-run line).
   Right side on desktop: a **streak card** (see rail) — on mobile the streak becomes a 7-day dot row directly
   under the heading: Mo Tu We Th Fr Sa Su, filled amber for study days, ring for today, fire icon at the end
   with the count.
2. **Continue card** (only if saved progress exists for any subject): wide card with subject tint, 3D icon,
   "Continue · Question 12 of 30", progress bar, "Resume" amber button. Otherwise a **Quick start** card:
   "Start a quick 10" with the first subject, one tap to play.
3. **Stats strip**: three tiles with a tiny inline sparkline/ring each (attempts, avg score ring, mistakes to clear).
4. **Subjects** section header with "Add subject" ghost button right. Grid: 1-col snap carousel on mobile
   (cards 78vw wide), 2-col on tablet, 3-col on desktop.

### Subject card anatomy
- 220px tall minimum. Tint glow top-right, **3D icon 104px** overflowing slightly past the top-right corner,
  with `filter: drop-shadow(0 14px 20px rgb(0 0 0 / 0.45))`. Use the `premium` icon style (full colour) everywhere.
- Top-left: mastery ring 44px with gradient stroke (amber → `#FFC857`), percent inside in mono.
- Bottom: subject name (18/700, two lines max), meta "87 questions · Best 76%", then a thin progress bar.
- When mistakes > 0: a small coral chip "12 to fix" that starts a retry quiz on tap (stop propagation).
- Hover (desktop): translateY(-4px), border brightens, icon translateY(-6px) rotate(-4deg), and an amber
  "Start →" pill fades in at bottom-right. Press: scale(0.985).

### Right rail (desktop) / stacked (mobile, after subjects)
1. **Streak card**: fire icon, "{n} day streak", the 7-day dots, and "Best {m}".
2. **Leaderboard mini**: top 3 as compact rows with avatars + points, your rank line, "See all" link.
3. **Install card**: the existing content restyled as a rail card; on mobile it stays under the hero.

## 5. Quiz

- Shell: no sidebar/tabbar. Top bar: back chevron, subject name + mode chip, right: timer in mono (coral when
  < 60s in exam), sound toggle.
- Desktop: content 720px centred + a **right rail 280px** with the palette grid (6 per row chips) and a
  keyboard-hints card (keycaps for 1–5, Enter, Backspace, E, ?). Mobile: palette is the horizontal chip strip.
- **Progress**: for ≤ 20 questions, a row of dots (Kuizu style) that fill amber as you go, current dot elongated;
  for > 20 a continuous bar.
- **Question card**: `surface`, 24px padding, eyebrow "QUESTION 4", question 20/600 line-height 1.35.
- **Options**: 56px min height pills, keycap badge (A–E) drawn like a key (`surface-2`, bottom border 2px darker),
  hover: border brighten + translateX(2px); selected (exam mode): amber border + `accent/8` fill;
  correct: mint border + `mint/10` fill + filled check circle; wrong: coral equivalent + filled x circle;
  others fade to 45%. Keycap flashes amber when the key is pressed.
- **Explanation**: slides up as a tinted card (`info/8` background, info left border 3px): "Quick answer" bold,
  "Know more" expandable with chevron rotate.
- Bottom bar: Prev ghost, Next/Submit amber, pinned, safe-area.
- Question change: horizontal slide via View Transitions, 220ms.

## 6. Results

- Hero: full-width card with a large radial glow in the grade colour (mint for ≥ 80, amber 50–79, coral < 50),
  3D trophy/medal/star 140px with drop shadow, score 96px count-up, grade badge, "Passed"/"Keep going" for exams.
- Stats: 4 tiles (correct, wrong, time, points). Points tile shows "Practice only · not ranked" chip for custom
  subjects.
- CTA row: **Retry wrong (N)** amber, Share ghost, Home ghost. "Cleared!" state with confetti when a retry has 0 wrong.
- **Share card preview is visible** on the page (scaled down 1080 → ~320px) so people see what they'll share.
- Review list: filter chips All / Wrong; rows with the option letter badge coloured by result.

## 7. Leaderboard

- Header: "Leaderboard" + sub "Points = first-time correct − wrong ÷ (options − 1)". Right: "Live" mint dot chip
  when connected.
- **Podium** (the showpiece): three blocks with real depth — each block has a front face (`surface-2`) and a top
  face (lighter) via pseudo-elements, heights 120 / 160 / 100 (2nd, 1st, 3rd). #1 block is amber with an inner
  glow and an SVG crown above the avatar; #2 silver `#C9CDD6`; #3 bronze `#D39A63` (top face only tinted, front
  stays dark so it is not garish). Avatars 64/56/56 with a 3px ring in the block colour, names 15/700,
  points in mono with a coin glyph. Blocks rise in with a 80ms stagger.
- Rows: rank in mono, avatar, name, "45 / 70 · 64%" muted, points right. Your row: amber border + `accent/6` fill.
  Row hover: `surface-3`.
- Avatars: initials on a **two-stop gradient** hashed from the name (not flat colour). 
- "You" bar stays sticky bottom. Offline: empty state with wifi-off glyph, "Leaderboard needs a connection".
- Desktop: podium left (60%), rows right (40%) in a two-column layout; mobile stacks.

## 8. History

- Day groups with sticky day headers. Rows: subject tint dot, subject name, mode chip, mini score ring 28px,
  time, chevron. Hover/press lifts.
- Summary strip on top with a 14-day activity bar chart (inline SVG, amber bars).

## 9. Settings sheet
- Grouped list: Appearance (Theme segmented: System / Dark / Light), Sound (switch), Performance (Lite mode
  segmented), Devices (link row), About (version, privacy line). Switches and segmented controls are custom,
  amber when on.

## 10. Motion (CSS only; all off in lite mode / reduced motion)
- Page enter: children stagger fade-up 24ms apart using `--i`.
- Cards: hover lift, press scale.
- Rings: stroke draws from 0 on mount (600ms ease-out).
- Numbers: count-up on results and stats.
- Podium: rise-in with stagger; #1 glow pulses once.
- Preloader: logo stroke draw (existing).
- Tab bar: active dot slides between items (transition on `left`).

## 11. Don'ts
- No pure flat backgrounds, no white/grey "clay" icons (use `premium` style), no centred mobile column on desktop,
  no default browser scrollbars on dark (style them thin), no text gradients, no neon, no blur on low-end.
