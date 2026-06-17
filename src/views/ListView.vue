<template>
  <div class="list-view">
    <FilterBar
      :active-type="activeType"
      :sort-by="sortBy"
      @update:type="filterByType"
      @update:sort-by="setSort"
    />

    <div v-if="featuredProjects.length > 0" class="list-view__featured">
      <FeaturedCard
        v-for="project in featuredProjects"
        :key="project.id"
        :project="project"
      />
    </div>

    <template v-if="remainingProjects.length > 0">
      <div class="list-view__section-header">
        <span>所有项目</span>
        <div class="list-view__section-line"></div>
        <span>{{ remainingProjects.length }}</span>
      </div>

      <div class="list-view__items">
        <ProjectCard
          v-for="project in remainingProjects"
          :key="project.id"
          :project="project"
        />
      </div>
    </template>

    <div v-if="filteredProjects.length === 0" class="list-view__empty">
      <p>没有找到匹配的项目。</p>
      <button class="list-view__reset" @click="resetFilters">清除所有过滤条件</button>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProjects } from '../composables/useProjects.js'
import FilterBar from '../components/FilterBar.vue'
import FeaturedCard from '../components/FeaturedCard.vue'
import ProjectCard from '../components/ProjectCard.vue'

const {
  filteredProjects,
  activeType,
  activeTags,
  searchQuery,
  sortBy,
  filterByType,
  toggleTag,
  search,
  setSort,
  resetFilters,
} = useProjects()

const featuredProjects = computed(() => filteredProjects.value.slice(0, 2))
const remainingProjects = computed(() => filteredProjects.value.slice(2))

const route = useRoute()

watch(
  () => route.params.tag,
  (newTag) => {
    if (newTag) toggleTag(newTag)
  },
  { immediate: true }
)

watch(
  () => route.query.q,
  (newQuery) => {
    if (newQuery) search(newQuery)
  },
  { immediate: true }
)
</script>

<style scoped>
.list-view {
  padding-top: 8px;
}

.list-view__featured {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin-bottom: 20px;
}

.list-view__section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 0 4px;
  font-size: 0.75rem;
  font-family: var(--font-sans);
  color: var(--text-subtle);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-label);
}

.list-view__section-line {
  flex: 1;
  height: 1px;
  background: var(--border);
}

.list-view__items {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.list-view__empty {
  text-align: center;
  padding: 48px 0;
  color: var(--text-muted);
}

.list-view__reset {
  margin-top: 12px;
  padding: 6px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-primary);
  color: var(--accent-own);
  font-size: 0.85rem;
  cursor: pointer;
}

.list-view__reset:hover {
  background: var(--bg-secondary);
}
</style>
