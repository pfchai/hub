<template>
  <div class="list-view">
    <FilterBar
      :active-type="activeType"
      :active-tags="activeTags"
      :all-tags="allTags"
      :search-query="searchQuery"
      :sort-by="sortBy"
      @update:type="filterByType"
      @toggle-tag="toggleTag"
      @update:search="search"
      @update:sort-by="setSort"
    />

    <div class="list-view__count">
      {{ filteredProjects.length }} 个项目
    </div>

    <div v-if="filteredProjects.length > 0" class="list-view__items">
      <ProjectItem
        v-for="(project, index) in filteredProjects"
        :key="project.id"
        :project="project"
        :rank="index + 1"
      />
    </div>

    <div v-else class="list-view__empty">
      <p>没有找到匹配的项目。</p>
      <button class="list-view__reset" @click="resetFilters">清除所有过滤条件</button>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProjects } from '../composables/useProjects.js'
import FilterBar from '../components/FilterBar.vue'
import ProjectItem from '../components/ProjectItem.vue'

const {
  filteredProjects,
  activeType,
  activeTags,
  searchQuery,
  sortBy,
  allTags,
  filterByType,
  toggleTag,
  search,
  setSort,
  resetFilters,
} = useProjects()

const route = useRoute()

onMounted(() => {
  if (route.params.tag) {
    toggleTag(route.params.tag)
  }
  if (route.query.q) {
    search(route.query.q)
  }
})
</script>

<style scoped>
.list-view {
  padding-top: 8px;
}

.list-view__count {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 8px;
  padding: 0 4px;
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
  color: var(--accent);
  font-size: 0.85rem;
  cursor: pointer;
}

.list-view__reset:hover {
  background: var(--bg-secondary);
}
</style>
