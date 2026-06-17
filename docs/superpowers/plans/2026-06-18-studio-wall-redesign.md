# Implementation Plan: Studio Wall Redesign

**Spec:** docs/superpowers/specs/2026-06-18-studio-wall-redesign.md
**Date:** 2026-06-18
**Strategy:** Subagent-Driven Development — 7 tasks, sequential within phases

## Global Constraints

- All CSS variables defined in spec Section 2 must be used verbatim
- Inter + JetBrains Mono loaded via Google Fonts with `font-display: swap`
- Container max-width: 960px
- Base font-size: 15px
- Dark mode via `prefers-color-scheme: dark`, using warm tones from spec
- `projects.json` data model unchanged
- Existing router structure preserved
- All existing tests must pass after each task
- Run `npm test` before committing

---

## Task 1: Design Tokens & Layout Foundation

**Files:** `src/styles/global.css`, `src/App.vue`, `index.html`
**Depends on:** None

Update CSS custom properties (colors, typography, spacing) per spec Section 2.
Add Inter + JetBrains Mono font loading. Widen container to 960px.

**Requirements:**
- Replace all `:root` CSS variables with Warm Stone palette values from spec
- Add dark mode `:root` variables with warm dark values
- Add `--font-sans`, `--font-mono`, `--text-subtle`, `--bg-card`, `--accent-success` tokens
- Set `--font-size-base` implicitly via `html { font-size: 15px }`
- Set `--max-width: 960px`
- Load Inter (wght 400;500;600;800) + JetBrains Mono from Google Fonts in `index.html`
- `App.vue`: update `main-content` max-width uses the variable (already does)

---

## Task 2: Header & Footer Redesign

**Files:** `src/components/AppHeader.vue`, `src/components/AppFooter.vue`
**Depends on:** Task 1 (needs new CSS tokens)

**AppHeader:**
- Logo: "Hub" → "Hub." (Inter 800, letter-spacing -0.03em)
- Add "About" nav link (href: `#/about`, placeholder for now)
- Search: replace `<input>` with a ⌘K-style trigger button (shows "⌘K" or "Search")
- Search popover: clicking the trigger opens a small search input overlay/dropdown
- Height: increase from 48px to 52px
- Backdrop blur on sticky

**AppFooter:**
- Replace "Built with Vue + Vite · Curated by hand"
- Three lines: personal intro · social links · copyright
- Social links: GitHub icon/text, Twitter, RSS (can be placeholder links)

---

## Task 3: Card Components

**Files:** `src/components/FeaturedCard.vue` (new), `src/components/ProjectItem.vue` → refactor to `ProjectCard.vue`
**Depends on:** Task 1 (needs new CSS tokens)

**FeaturedCard.vue (new):**
- Props: `project` (Object)
- Gradient preview area (120px) with Inter 800 title + tags overlay
- Body: title, editorial description (use `project.tagline`), stars, type badge, "→ 查看"
- Gradient: own → `linear-gradient(135deg, #2563eb, #7c3aed)`, curated → `linear-gradient(135deg, #7c3aed, #db2777)`
- Hover: `background-position` shift on gradient
- Links to `#/project/:id`

**ProjectCard.vue (refactored from ProjectItem):**
- From `a` row item → card component
- Remove rank number
- Structure: title → tagline (1-line ellipsis) → bottom row (stars + tags + type pill)
- Border-radius 10px, border, white bg
- Hover: `translateY(-2px)` + `box-shadow`
- Tags shown as small mono pills

---

## Task 4: ListView & FilterBar Rework

**Files:** `src/views/ListView.vue`, `src/components/FilterBar.vue`
**Depends on:** Task 3 (needs FeaturedCard + ProjectCard)

**ListView:**
- Add featured section at top: render 2 FeaturedCards (selection logic in composable or inline)
- Featured section has 2-column grid gap 18px
- Add "所有项目" section divider with count after featured
- Replace single-column ProjectItem list with 2-column grid of ProjectCards

**FilterBar:**
- Redesign as single inline row of pills
- Type pills: `[全部] [Own] [Curated]` — filled pill for active, outline for inactive
- Sort toggle on the right side
- Remove tag filter pills entirely
- Search input removed (merged into header)

---

## Task 5: Detail Pages Redesign

**Files:** `src/views/DetailView.vue`, `src/components/OwnDetail.vue`, `src/components/CuratedDetail.vue`
**Depends on:** Task 1 (CSS tokens)

**DetailView.vue:**
- Minor: add wrapper for the hero gradient + content area

**OwnDetail.vue & CuratedDetail.vue:**
- Add hero gradient section at top (full width, same gradient logic as FeaturedCard)
- Hero shows project title (Inter 800, 26px) + tagline
- Content area: `display: flex` → main (flex:1) + sidebar (140px, sticky)
- Sidebar contains: Stars, Type badge, Tags, Links
- Section headings: remove emoji, use uppercase label style (10px, `+0.06em`, muted color)
- Tags: dark background pill style (black bg white text for light mode)
- Technical decisions list: bold keys with visual separators
- Recommendation block: keep left border accent, match new palette

---

## Task 6: Motion & Transitions

**Files:** `src/App.vue`, `src/views/ListView.vue`, `src/styles/global.css`
**Depends on:** Task 4, Task 5 (animation targets must exist)

**Page Transitions:**
- Wrap `<RouterView>` in Vue `<Transition name="page">`
- CSS: `.page-enter-active` / `.page-leave-active` with fade + slide-up

**Card Interactions:**
- Add hover/click CSS transitions to FeaturedCard and ProjectCard
- CSS `@media (prefers-reduced-motion: reduce)` to disable

**Scroll Reveal:**
- Create `src/composables/useScrollReveal.js`
- `IntersectionObserver`-based, staggered reveal (index * 50ms delay)
- Apply to card grid items

---

## Task 7: Dark Mode, Responsive & Tests

**Files:** `src/styles/global.css`, all component files, `src/__tests__/`
**Depends on:** All previous tasks

**Dark Mode:**
- Verify all dark mode CSS variables render correctly
- Ensure gradient cards have appropriate dark variants
- Code blocks, borders, shadows adapt to dark

**Responsive:**
- Mobile (< 768px): single column cards, sidebar below main, no sticky
- Tablet (768-960px): adjusted spacing
- Test in both viewports

**Tests:**
- Update existing test snapshots/assertions for new component structure
- Add tests for FeaturedCard component
- Verify all existing tests pass: `npm test`
