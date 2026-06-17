import { ref, computed } from 'vue'
import projectsData from '../data/projects.json'

// Module-level reactive state (singleton — persists across route changes)
const projects = ref(projectsData)
const activeType = ref('all')
const activeTags = ref(new Set())
const searchQuery = ref('')
const sortBy = ref('stars')

export function useProjects() {
  const allTags = computed(() => {
    const tagSet = new Set()
    for (const p of projects.value) {
      for (const t of p.tags) {
        tagSet.add(t)
      }
    }
    return [...tagSet].sort()
  })

  const filteredProjects = computed(() => {
    let result = [...projects.value]

    if (activeType.value === 'own') {
      result = result.filter((p) => p.type === 'own')
    } else if (activeType.value === 'curated') {
      result = result.filter((p) => p.type === 'curated')
    }

    if (activeTags.value.size > 0) {
      result = result.filter((p) => [...activeTags.value].every((tag) => p.tags.includes(tag)))
    }

    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      )
    }

    if (sortBy.value === 'stars') {
      result.sort((a, b) => b.stars - a.stars)
    } else {
      result.sort((a, b) => b.addedAt.localeCompare(a.addedAt))
    }

    return result
  })

  function filterByType(type) {
    activeType.value = type
  }

  function toggleTag(tag) {
    const next = new Set(activeTags.value)
    if (next.has(tag)) {
      next.delete(tag)
    } else {
      next.add(tag)
    }
    activeTags.value = next
  }

  function search(query) {
    searchQuery.value = query
  }

  function setSort(key) {
    sortBy.value = key
  }

  function getProject(id) {
    return projects.value.find((p) => p.id === id)
  }

  function resetFilters() {
    activeType.value = 'all'
    activeTags.value = new Set()
    searchQuery.value = ''
    sortBy.value = 'stars'
  }

  return {
    projects,
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
    getProject,
    resetFilters,
  }
}
