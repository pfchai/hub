import { createRouter, createWebHashHistory } from 'vue-router'
import { modules } from '../modules/registry.js'

/**
 * Generate routes from the module registry.
 * Each module with N routes produces N route entries at `/m/{module-id}/{sub-path}`.
 */
const moduleRoutes = modules.flatMap((m) =>
  m.routes.map((r) => ({
    path: `/m/${m.id}${r.path ? '/' + r.path : ''}`,
    name: `${m.id}-${r.path || 'index'}`,
    component: r.component,
    meta: { moduleId: m.id },
  }))
)

const routes = [
  // ── Dashboard home ────────────────────────────────────────────
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
  },

  // ── Module routes (auto-generated from registry) ──────────────
  ...moduleRoutes,

  // ── Old route redirects (backward compat) ─────────────────────
  {
    path: '/project/:id',
    name: 'project',
    redirect: (to) => ({ path: `/m/curation/project/${to.params.id}` }),
  },
  {
    path: '/tag/:tag',
    name: 'tag',
    redirect: (to) => `/m/curation?tag=${to.params.tag}`,
  },
  {
    path: '/search',
    name: 'search',
    redirect: (to) => `/m/curation?q=${to.query.q || ''}`,
  },

  // ── About page ──────────────────────────────────────────────
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/AboutView.vue'),
  },

  // ── Catch-all 404 ─────────────────────────────────────────────
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFound.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

export default router
