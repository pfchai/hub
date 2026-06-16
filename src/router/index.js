import { createRouter, createWebHashHistory } from 'vue-router'
import ListView from '../views/ListView.vue'
import DetailView from '../views/DetailView.vue'

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
