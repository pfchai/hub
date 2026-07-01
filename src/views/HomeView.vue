<template>
  <div class="home-view">
    <!-- Hero -->
    <div class="home-view__hero">
      <h1 class="home-view__tagline">{{ tagline }}</h1>
    </div>

    <!-- Module grid -->
    <div v-if="featuredModules.length > 0" class="home-view__grid">
      <ModuleCard
        v-for="mod in featuredModules"
        :key="mod.id"
        :module="mod"
        :count="0"
      />
    </div>

    <!-- Empty state -->
    <div v-else class="home-view__empty">
      <div class="home-view__empty-card">
        <span class="home-view__empty-icon">✨</span>
        <p class="home-view__empty-title">模块即将到来</p>
        <p class="home-view__empty-desc">新的功能模块正在开发中，敬请期待</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getFeaturedModules } from '../modules/registry.js'
import ModuleCard from '../components/ModuleCard.vue'
import projectsData from '../data/projects.json'

const featuredModules = getFeaturedModules()
</script>

<style scoped>
.home-view {
  padding-top: 8px;
}

/* ===== Hero ===== */
.home-view__hero {
  text-align: center;
  padding: 48px 0 32px;
}

.home-view__tagline {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.4;
}

/* ===== Grid ===== */
.home-view__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

/* ===== Empty State ===== */
.home-view__empty {
  display: flex;
  justify-content: center;
  padding: 48px 0;
}

.home-view__empty-card {
  text-align: center;
  padding: 32px 40px;
  border: 2px dashed var(--border);
  border-radius: var(--radius);
  background: var(--bg-secondary);
  max-width: 360px;
}

.home-view__empty-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 12px;
}

.home-view__empty-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 6px;
}

.home-view__empty-desc {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0;
}

/* ===== Responsive ===== */
@media (max-width: 639px) {
  .home-view__hero {
    padding: 32px 0 24px;
  }

  .home-view__tagline {
    font-size: 1.25rem;
  }

  .home-view__grid {
    grid-template-columns: 1fr;
  }
}
</style>
