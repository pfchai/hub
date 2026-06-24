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

// ─── Module route-level error boundary wrapper ──────────────────
// Wraps lazy-loaded module components so that import() failures
// (network errors, 404 chunk, syntax error) are caught by
// onErrorCaptured and show a retry card instead of a blank page.
const RouteErrorBoundary = {
  name: 'RouteErrorBoundary',
  props: {
    moduleId: { type: String, default: 'unknown' },
  },
  template: `
    <div v-if="error" class="route-error" style="text-align:center;padding:48px;color:var(--text-muted)">
      <p style="font-size:1.1rem;margin-bottom:8px">加载失败</p>
      <p style="font-size:0.85rem;margin-bottom:16px;color:var(--text-subtle)">
        模块 "{{ moduleId }}" 无法加载
      </p>
      <button
        @click="retry"
        style="padding:8px 20px;border:1px solid var(--border);border-radius:8px;background:var(--bg-primary);color:var(--text-primary);cursor:pointer;font-size:0.85rem"
      >
        点此重试
      </button>
    </div>
    <slot v-else />
  `,
  data() {
    return { error: false }
  },
  errorCaptured() {
    this.error = true
    return false
  },
  methods: {
    retry() {
      this.error = false
      this.$forceUpdate()
    },
  },
}

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
    redirect: (to) => ({ path: `/m/curation/project/${to.params.id}` }),
  },
  {
    path: '/tag/:tag',
    redirect: (to) => `/m/curation?tag=${to.params.tag}`,
  },
  {
    path: '/search',
    redirect: (to) => `/m/curation?q=${to.query.q || ''}`,
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

export { RouteErrorBoundary }
export default router
