import { describe, it, expect, vi } from 'vitest'
import { computed } from 'vue'
// Do NOT import useProjectsRouting directly — it requires vue-router injection.
// Instead, test that useProjectsState (it's dependency) provides the right shape
// and that the old useProjects.js re-export works for backward compat.

describe('useProjectsRouting', () => {
  it('re-exports useProjectsState for backward compat via old useProjects.js', async () => {
    // Old import path must still work
    const { useProjects } = await import('../composables/useProjects.js')
    const state = useProjects()
    expect(state).toHaveProperty('projects')
    expect(state).toHaveProperty('filteredProjects')
    expect(state).toHaveProperty('allTags')
    expect(state).toHaveProperty('filterByType')
    expect(state).toHaveProperty('toggleTag')
    expect(state).toHaveProperty('getProject')
    expect(state).toHaveProperty('resetFilters')
  })

  it('useProjectsState is the same module as useProjects re-export', async () => {
    const { useProjectsState } = await import('../composables/useProjectsState.js')
    const { useProjects } = await import('../composables/useProjects.js')
    expect(useProjects).toBe(useProjectsState)
  })
})
