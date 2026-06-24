/**
 * Hub 2.0 — Module type definitions (JSDoc)
 *
 * These types are used by the module registry and consumed by router, HomeView,
 * AppHeader, and ModuleCard. No runtime dependency — purely documentation
 * for AI tooling and human readers.
 *
 * @module types
 */

/**
 * @typedef {'curation' | 'tool'} ModuleType
 *
 * Determines the visual style of ModuleCard and the nav group in AppHeader.
 * - `curation` → list/detail pattern (e.g. GitHub project curation)
 * - `tool` → interactive app (e.g. sunset prediction)
 *
 * Future types (viz, reference) extend here.
 */

/**
 * @typedef {Object} ModuleRoute
 * @property {string} path - Sub-route path. `""` for the module's index route.
 * @property {string} label - Display name (breadcrumbs, navigation).
 * @property {() => Promise<import('vue').Component>} component - Lazy-loaded
 *   Vue SFC. Vite code-splits on dynamic import() — each module's dependency
 *   becomes its own chunk.
 */

/**
 * @typedef {Object} Module
 * @property {string} id - kebab-case, used as route prefix: `/m/{id}`
 * @property {string} title - Display name in nav bars and cards.
 * @property {string} description - One-liner, shown on ModuleCard.
 * @property {string} icon - Emoji string, e.g. `"📋"`, `"🌅"`
 * @property {string} color - CSS hex, e.g. `"#2563eb"`. Used as card accent.
 * @property {ModuleType} type - 'curation' | 'tool'
 * @property {boolean} featured - `true` → card appears on dashboard home.
 *   `false` → accessible only via AppHeader nav.
 * @property {ModuleRoute[]} routes - At least one route required. Validated at
 *   module load time (dev-mode warn).
 */

export {}
