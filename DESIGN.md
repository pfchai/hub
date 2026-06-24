# DESIGN.md — Hub 2.0 Design System

## 1. Design Philosophy

Warm, personal, restrained. Inspired by Linear and Vercel: clean typography, generous whitespace, subtle interactions, and a focus on content. The site is a window into what the author is curious about — the design stays out of the way while leaving a gentle impression of craft and warmth.

- **Warmth** comes from the Stone palette: off-white backgrounds, warm gray text, and card-based layouts with soft shadows.
- **Restraint** means no gratuitous animations, no card grids, no pagination, no analytics. The numbered list and module grid are the primary surfaces.
- **Personal** is expressed through accent colors — blue for own projects, purple for curated collections, green for success states — and the modular dashboard concept that groups content by theme.

## 2. Color System

All colors are defined as CSS custom properties on `:root` and overridden in `@media (prefers-color-scheme: dark)`.

| Token | Light | Dark |
|---|---|---|
| `--bg-primary` | `#fafaf9` | `#1a1815` |
| `--bg-secondary` | `#f5f3ef` | `#24211d` |
| `--bg-card` | `#ffffff` | `#2a2723` |
| `--text-primary` | `#1c1917` | `#e8e2d4` |
| `--text-muted` | `#78716c` | `#a69885` |
| `--text-subtle` | `#a8a29e` | `#7a6e5e` |
| `--border` | `#e7e5e4` | `#3a3530` |
| `--accent-own` | `#2563eb` | (dimmed via `color-mix`) |
| `--accent-curated` | `#7c3aed` | (dimmed via `color-mix`) |
| `--accent-success` | `#16a34a` | (dimmed via `color-mix`) |

- Accent colors in dark mode are dimmed with `color-mix(in oklch, {color} 70%, white)` to maintain contrast against dark card backgrounds.
- Border radius: `--radius: 8px` for cards, `--radius-pill: 999px` for badges and pills.
- Max content width: `--max-width: 960px`.

## 3. Typography

- **Sans-serif**: `Inter`, falling back to system fonts (`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`).
- **Mono**: `JetBrains Mono`, falling back to `'SF Mono', 'Cascadia Code', monospace`.
- Base font size: `15px` on `<html>`; body line-height `1.6`.

| Level | Size | Weight | Letter-spacing |
|---|---|---|---|
| h1 | 1.5rem | 800 (--font-weight-headline) | -0.02em |
| h2 | 1.25rem | 600 | normal |
| h3 | 1.1rem | 500 | normal |
| Body | 0.85rem | 400 (--font-weight-body) | normal |
| Caption / badge | 0.75rem | 400 | normal |

- Code/pre/tag badges use `--font-mono`.
- Labels receive `--letter-spacing-label: 0.06em` for uppercase metadata.
- Headlines receive `--letter-spacing-headline: -0.02em` for a tighter, modern look.
- All text is rendered with `-webkit-font-smoothing: antialiased` and `-moz-osx-font-smoothing: grayscale`.

## 4. Spacing Scale

The design uses a consistent 4px base spacing scale. Common values:

| Token | Value | Usage |
|---|---|---|
| 4px | 0.25rem | Tight gaps, icon margins |
| 8px | 0.5rem | Page padding top, tight vertical gaps |
| 16px | 1rem | Card body padding, grid gap |
| 24px | 1.5rem | Main content padding (vertical) |
| 32px | 2rem | Hero padding, section separation |
| 48px | 3rem | Page bottom padding, large sections |

In practice:
- Card body: `padding: 16px` with `gap: 6px` between elements.
- Hero section: `padding: 48px 0 32px` (top/bottom).
- Page wrapper: `padding: 24px 16px 48px`.
- Module grid: `gap: 16px`.

## 5. Component Patterns

### Cards (ModuleCard)

Cards are the primary content container. Each card has:

- **Color accent bar**: A 3px `div` at the top of the card whose `background` is set to a per-module CSS custom property (`--module-color`). In dark mode, this is dimmed via `color-mix` (`--module-color-dim`).
- **Body**: Icon (2rem), title (1rem, weight 700), description (0.85rem, `--text-muted`, clamped to 2 lines via `-webkit-line-clamp`).
- **Meta footer**: Badge text (0.75rem, `--font-mono`) for curation modules showing project count; arrow (`→`) for tool-type modules.
- **Container**: `--bg-card` background, `1px solid var(--border)`, `border-radius: var(--radius)`, `overflow: hidden`.

### Navigation

- Header links: anchor tags styled with `--accent-own` color, hover underline.
- Search: filter input in the list view (not shown in source above but referenced in the app structure).

### Buttons

- Rounded with `border-radius: var(--radius)` or `var(--radius-pill)`.
- Bordered style using `var(--border)` or accent colors as border.
- Consistent with the overall restrained aesthetic — no gradient buttons or heavy shadows.

### Empty State

- Dashed border container (`2px dashed var(--border)`), `--bg-secondary` background, centered.
- Icon (2rem), title (1rem, weight 600), description (0.85rem, `--text-muted`).

## 6. Interaction Model

All interactive elements follow a consistent set of transitions:

| State | Transform | Shadow / Outline | Transition |
|---|---|---|---|
| Rest | none | `0 1px 3px rgba(0,0,0,0.06)` (implicit) | — |
| Hover | `translateY(-2px)` | `0 4px 16px rgba(0,0,0,0.08)` | 150ms ease-out |
| Focus-visible | — | `2px solid var(--accent-own)` outline, `outline-offset: 2px` | 150ms ease-out |
| Active | `translateY(0)` | `0 1px 4px rgba(0,0,0,0.06)` | 150ms ease-out |

- All transitions: `150ms ease-out` on `transform` and `box-shadow`.
- Links use `color: var(--accent-own)` with `text-decoration: underline` on hover.
- Reduced motion: `@media (prefers-reduced-motion: reduce)` disables all animations and transitions globally (`duration: 0.01ms`).

## 7. Dark Mode

Dark mode is activated via the `prefers-color-scheme: dark` media query. No toggle is provided (system preference only).

- **Background colors** shift to warm dark tones (`#1a1815` primary, `#24211d` secondary, `#2a2723` card).
- **Text colors** invert to light warm tones (`#e8e2d4` primary, `#a69885` muted, `#7a6e5e` subtle).
- **Border colors** become `#3a3530` (lighter than backgrounds to maintain separation).
- **Accent colors** are dimmed for readability against dark cards using `color-mix(in oklch, {color} 70%, white)`. This is applied dynamically per component via `computed` properties.
- **Contrast ratio**: The palette is designed to meet or exceed WCAG AA (4.5:1) for body text. The dimmed accent colors maintain sufficient contrast against `--bg-card` (`#2a2723`).

## 8. Responsive Breakpoints

The grid layout adapts at two breakpoints:

| Viewport | Grid Behavior |
|---|---|
| `< 640px` (mobile) | Single column: `grid-template-columns: 1fr` |
| `>= 640px` (tablet+) | Fluid multi-column: `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))` |

- The `>= 1024px` breakpoint is handled implicitly by `auto-fit` with `minmax(280px, 1fr)` — as viewport width increases, more columns appear naturally when space permits.
- Hero section padding compresses on mobile: `32px 0 24px` vs `48px 0 32px` on desktop.
- Tagline font size reduces: `1.25rem` on mobile vs `1.5rem` on desktop.
- Page wrapper uses `max-width: var(--max-width)` (960px) centered with `margin: 0 auto`.
- No hamburger menu, no off-canvas navigation — the header links remain inline at all sizes.
