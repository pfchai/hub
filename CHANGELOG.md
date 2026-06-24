# Changelog

## [1.1.0.0] - 2026-06-25

### Added

- **Modular dashboard**: Home page now shows module cards with emoji icons, titles, descriptions, and accent colors. Cards lift on hover with a shadow effect.
- **Project curation module**: Browse and filter 27 curated open-source projects by type, tag, and search. Old URLs (`/project/:id`, `/tag/:tag`, `/search`) automatically redirect.
- **Sunset prediction module**: Predict sunset quality using your location, current weather data, and a heuristic model. Shows a scorecard with cloud cover, humidity, and overall verdict (good/maybe/unlikely). Falls back to manual location input and degraded sunset-time-only view.
- **About page**: Personal blurb page at `/about` with links to GitHub/Twitter/Blog/RSS.
- **Mobile navigation**: Hamburger menu for screens below 640px with all module links, Home, and About. Closes on link click, backdrop tap, or Escape key.
- **Accessibility**: Skip-to-content link, ARIA labels on navigation and cards, 44px minimum touch targets, keyboard-visible focus rings.
- **Dark mode**: All module accent colors dimmed for dark backgrounds. Automated contrast checking via `scripts/check-contrast.js`.

### Changed

- **App architecture**: New module registry system allows adding modules by simply adding an entry to `src/modules/registry.js`. Routes, navigation, and dashboard cards are auto-generated.
- **Router**: Switched to dynamic route generation from the module registry. Route-level error boundary catches import failures with a retry button.
- **Project data composable**: Split into `useProjectsState` (pure state) and `useProjectsRouting` (route-aware wrapper) for better testability.
- **AppHeader**: Navigation links are now driven by the module registry. Module links show icon + title, grouped by module type.
- **Tag and search filtering**: Case-insensitive matching for tag filters. Tag filter now works via query params (`?tag=Vue`) as well as route params.

### Fixed

- **Vue Router Transition warning**: `<router-view>` now uses `v-slot="{ Component }"` syntax with `<component :is="Component" />` for Vue Router 4.5 compatibility.
- **Vite dev server SUB_SPAS**: Added `learnGitBranching`, `impress.js`, `todomvc`, `editor-md` to the static sub-SPA plugin so they work in local dev.
- **DetailView "Back to projects" link**: Now points to `/m/curation` instead of returning to the dashboard.
- **FeaturedCard and ProjectCard links**: Updated from `/project/:id` to `/m/curation/project/:id`.

### Infrastructure

- Added `scripts/check-contrast.js` for WCAG AA color contrast validation.
- Added `scripts/smoke-test.sh` for post-deploy smoke testing (5 checks).
- Created `DESIGN.md` documenting the design system (color, typography, spacing, components, interactions).
- Added `src/__tests__/useApi.test.js`, `useProjectsRouting.test.js`, `registry.test.js` and 3 sunset module test files (29 new tests total).
