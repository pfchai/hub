<template>
  <div class="filter-bar">
    <div class="filter-bar__tabs">
      <button
        v-for="tab in types"
        :key="tab.value"
        class="filter-bar__tab"
        :class="{ 'filter-bar__tab--active': activeType === tab.value }"
        @click="$emit('update:type', tab.value)"
      >{{ tab.label }}</button>
    </div>

    <div class="filter-bar__tags">
      <button
        v-for="tag in allTags"
        :key="tag"
        class="filter-bar__tag"
        :class="{ 'filter-bar__tag--active': activeTags.has(tag) }"
        @click="$emit('toggle-tag', tag)"
      >{{ tag }}</button>
    </div>

    <div class="filter-bar__controls">
      <input
        class="filter-bar__search"
        type="search"
        placeholder="搜索项目..."
        :value="searchQuery"
        @input="$emit('update:search', $event.target.value)"
      />
      <button
        class="filter-bar__sort"
        @click="$emit('update:sortBy', sortBy === 'stars' ? 'date' : 'stars')"
      >
        {{ sortBy === 'stars' ? '⭐ Stars' : '📅 Date' }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  activeType: { type: String, default: 'all' },
  activeTags: { type: Set, default: () => new Set() },
  allTags: { type: Array, default: () => [] },
  searchQuery: { type: String, default: '' },
  sortBy: { type: String, default: 'stars' },
})

defineEmits(['update:type', 'toggle-tag', 'update:search', 'update:sortBy'])

const types = [
  { value: 'all', label: '全部' },
  { value: 'own', label: 'Own' },
  { value: 'curated', label: 'Curated' },
]
</script>

<style scoped>
.filter-bar {
  margin-bottom: 16px;
}

.filter-bar__tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 10px;
}

.filter-bar__tab {
  padding: 5px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-primary);
  color: var(--text-muted);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 150ms;
}

.filter-bar__tab:hover {
  border-color: var(--accent);
  color: var(--text-primary);
}

.filter-bar__tab--active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

.filter-bar__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.filter-bar__tag {
  padding: 3px 10px;
  border: 1px solid var(--border);
  border-radius: 100px;
  background: var(--bg-primary);
  color: var(--text-muted);
  font-size: 0.75rem;
  font-family: "JetBrains Mono", "SF Mono", monospace;
  cursor: pointer;
  transition: all 150ms;
}

.filter-bar__tag:hover {
  border-color: var(--accent);
  color: var(--text-primary);
}

.filter-bar__tag--active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

.filter-bar__controls {
  display: flex;
  gap: 8px;
}

.filter-bar__search {
  flex: 1;
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.85rem;
  outline: none;
  transition: border-color 150ms;
}

.filter-bar__search:focus {
  border-color: var(--accent);
}

.filter-bar__search::placeholder {
  color: var(--text-muted);
}

.filter-bar__sort {
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-primary);
  color: var(--text-muted);
  font-size: 0.8rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 150ms;
}

.filter-bar__sort:hover {
  border-color: var(--accent);
  color: var(--text-primary);
}
</style>
