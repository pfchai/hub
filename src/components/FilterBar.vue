<template>
  <div class="filter-bar">
    <div class="filter-bar__pills">
      <button
        v-for="tab in types"
        :key="tab.value"
        class="filter-bar__tab"
        :class="{ 'filter-bar__tab--active': activeType === tab.value }"
        @click="$emit('update:type', tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="filter-bar__spacer"></div>
    <button
      class="filter-bar__sort"
      @click="$emit('update:sortBy', sortBy === 'stars' ? 'date' : 'stars')"
    >
      {{ sortBy === 'stars' ? '⭐ Stars' : '📅 Date' }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  activeType: { type: String, default: 'all' },
  sortBy: { type: String, default: 'stars' },
})

defineEmits(['update:type', 'update:sortBy'])

const types = [
  { value: 'all', label: '全部' },
  { value: 'own', label: 'Own' },
  { value: 'curated', label: 'Curated' },
]
</script>

<style scoped>
.filter-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.filter-bar__pills {
  display: flex;
  gap: 6px;
}

.filter-bar__tab {
  padding: 5px 18px;
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  background: var(--bg-card);
  color: var(--text-subtle);
  font-family: var(--font-sans);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 150ms;
}

.filter-bar__tab:hover {
  border-color: var(--text-primary);
  color: var(--text-primary);
}

.filter-bar__tab--active {
  background: var(--text-primary);
  color: var(--bg-primary);
  border-color: var(--text-primary);
}

.filter-bar__spacer {
  flex: 1;
}

.filter-bar__sort {
  padding: 6px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-primary);
  color: var(--text-muted);
  font-family: var(--font-sans);
  font-size: 0.8rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 150ms;
}

.filter-bar__sort:hover {
  border-color: var(--accent-own);
  color: var(--text-primary);
}
</style>
