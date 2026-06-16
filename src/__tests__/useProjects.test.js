import { describe, it, expect, beforeEach } from 'vitest'
import { useProjects } from '../composables/useProjects.js'

describe('useProjects', () => {
  beforeEach(() => {
    // Reset singleton state between tests to prevent interference
    const { resetFilters } = useProjects()
    resetFilters()
  })

  it('returns all projects by default', () => {
    const { filteredProjects } = useProjects()
    expect(filteredProjects.value.length).toBeGreaterThan(0)
  })

  it('filters projects by type "own"', () => {
    const { filterByType, filteredProjects } = useProjects()
    filterByType('own')
    expect(filteredProjects.value.every(p => p.type === 'own')).toBe(true)
  })

  it('filters projects by type "curated"', () => {
    const { filterByType, filteredProjects } = useProjects()
    filterByType('curated')
    expect(filteredProjects.value.every(p => p.type === 'curated')).toBe(true)
  })

  it('filters projects by tag', () => {
    const { toggleTag, filteredProjects } = useProjects()
    toggleTag('Vue')
    expect(filteredProjects.value.every(p => p.tags.includes('Vue'))).toBe(true)
  })

  it('sorts projects by stars descending by default', () => {
    const { filteredProjects } = useProjects()
    const stars = filteredProjects.value.map(p => p.stars)
    const sorted = [...stars].sort((a, b) => b - a)
    expect(stars).toEqual(sorted)
  })

  it('sorts projects by date when sortBy is "date"', () => {
    const { setSort, filteredProjects } = useProjects()
    setSort('date')
    const dates = filteredProjects.value.map(p => p.addedAt)
    const sorted = [...dates].sort((a, b) => b.localeCompare(a))
    expect(dates).toEqual(sorted)
  })

  it('searches projects by text matching title, tagline, and tags', () => {
    const { search, filteredProjects } = useProjects()
    search('GPT')
    expect(filteredProjects.value.length).toBeGreaterThan(0)
    expect(filteredProjects.value.every(p =>
      p.title.toLowerCase().includes('gpt') ||
      p.tagline.toLowerCase().includes('gpt') ||
      p.tags.some(t => t.toLowerCase().includes('gpt'))
    )).toBe(true)
  })

  it('getProject returns project by id', () => {
    const { getProject } = useProjects()
    const project = getProject('ai-code-reviewer')
    expect(project).toBeDefined()
    expect(project.title).toBe('AI Code Reviewer')
  })

  it('getProject returns undefined for unknown id', () => {
    const { getProject } = useProjects()
    expect(getProject('nonexistent')).toBeUndefined()
  })

  it('allTags returns unique sorted tags from all projects', () => {
    const { allTags } = useProjects()
    expect(allTags.value.length).toBeGreaterThan(0)
    expect(allTags.value).toEqual([...allTags.value].sort())
    expect(new Set(allTags.value).size).toBe(allTags.value.length)
  })

  it('resetFilters clears all filters', () => {
    const { filterByType, toggleTag, search, resetFilters, filteredProjects } = useProjects()
    filterByType('own')
    toggleTag('Vue')
    search('something')
    resetFilters()
    expect(filteredProjects.value.length).toBe(useProjects().projects.value.length)
  })
})
