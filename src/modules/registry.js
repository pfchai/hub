/**
 * Hub 2.0 — Module Registry
 *
 * Single source of truth for all modules. Adding a new module here
 * automatically registers its routes with vue-router, adds a nav entry
 * in AppHeader, and (if featured: true) places a ModuleCard on the dashboard.
 *
 * Usage:
 * ```js
 * import { modules, getModule, getFeaturedModules } from '@/modules/registry.js'
 * ```
 *
 * @module modules/registry
 */

/** @type {import('./types.js').Module[]} */
export const modules = [
  {
    id: 'curation',
    title: '项目策展',
    description: '我做的和收藏的开源项目',
    icon: '📋',
    color: '#2563eb',
    type: 'curation',
    featured: true,
    routes: [
      { path: '', label: '列表', component: () => import('./curation/ListView.vue') },
      { path: 'project/:id', label: '详情', component: () => import('./curation/DetailView.vue') },
    ],
  },
  // ─── Future modules register here ────────────────────────────
  // {
  //   id: 'sunset',
  //   title: '晚霞预测',
  //   description: '预测今晚有没有好看的火烧云',
  //   icon: '🌅',
  //   color: '#e07b5a',
  //   type: 'tool',
  //   featured: true,
  //   routes: [
  //     { path: '', label: '预测', component: () => import('./sunset/SunsetView.vue') },
  //   ],
  // },
]

// ─── Dev-mode validation ────────────────────────────────────────
// Warns on startup for common configuration mistakes. Only runs in
// development (vite dev / npm test). Tree-shaken in production builds
// since the entire block is `if (import.meta.env.DEV)`.
if (import.meta.env.DEV) {
  validateRegistry(modules)
}

/**
 * Validate module registry for common issues.
 * Pure function — no side effects beyond console.warn.
 *
 * @param {import('./types.js').Module[]} mods
 */
export function validateRegistry(mods) {
  const seenIds = new Set()
  const seenPaths = new Set()

  for (const m of mods) {
    // — id uniqueness
    if (seenIds.has(m.id)) {
      console.warn(`[registry] Duplicate module id: "${m.id}"`)
    }
    seenIds.add(m.id)

    // — id format (kebab-case)
    if (!/^[a-z][a-z0-9-]*$/.test(m.id)) {
      console.warn(`[registry] Module id "${m.id}" should be kebab-case (letters, digits, hyphens only)`)
    }

    // — required fields
    if (!m.title) console.warn(`[registry] Module "${m.id}" is missing a title`)
    if (!m.icon) console.warn(`[registry] Module "${m.id}" is missing an icon`)
    if (!m.color) console.warn(`[registry] Module "${m.id}" is missing a color`)
    if (!m.type) console.warn(`[registry] Module "${m.id}" is missing a type`)
    if (m.featured == null) console.warn(`[registry] Module "${m.id}" is missing the featured flag`)

    // — type value
    if (!['curation', 'tool'].includes(m.type)) {
      console.warn(`[registry] Module "${m.id}" has unknown type "${m.type}". Use "curation" or "tool".`)
    }

    // — color format
    if (!/^#[0-9a-fA-F]{6}$/.test(m.color)) {
      console.warn(`[registry] Module "${m.id}" color "${m.color}" should be a 6-char hex, e.g. "#2563eb"`)
    }

    // — routes
    if (!m.routes || m.routes.length === 0) {
      console.warn(`[registry] Module "${m.id}" has no routes. Each module needs at least one.`)
    }

    if (m.routes) {
      for (const r of m.routes) {
        // Path uniqueness across ALL modules (catch collision before router creation)
        const fullPath = `/m/${m.id}${r.path ? '/' + r.path : ''}`
        if (seenPaths.has(fullPath)) {
          console.warn(`[registry] Duplicate route path: "${fullPath}"`)
        }
        seenPaths.add(fullPath)

        if (!r.label) console.warn(`[registry] Route "${fullPath}" is missing a label`)
        if (typeof r.component !== 'function') {
          console.warn(`[registry] Route "${fullPath}" component must be a lazy import function, got ${typeof r.component}`)
        }
      }
    }
  }
}

// ─── Convenience helpers ────────────────────────────────────────

/**
 * Get a module by its id.
 * @param {string} id
 * @returns {import('./types.js').Module | undefined}
 */
export function getModule(id) {
  return modules.find((m) => m.id === id)
}

/**
 * Get all featured modules (shown as cards on the dashboard).
 * @returns {import('./types.js').Module[]}
 */
export function getFeaturedModules() {
  return modules.filter((m) => m.featured)
}
