import { createRouter, createWebHashHistory } from 'vue-router'

const ListView = () => import('../views/ListView.vue')
const DetailView = () => import('../views/DetailView.vue')
const NotFound = () => import('../views/NotFound.vue')

const routes = [
  {
    path: '/',
    name: 'home',
    component: ListView,
  },
  {
    path: '/project/:id',
    name: 'project',
    component: DetailView,
  },
  {
    path: '/tag/:tag',
    name: 'tag',
    component: ListView,
  },
  {
    path: '/search',
    name: 'search',
    component: ListView,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFound,
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
