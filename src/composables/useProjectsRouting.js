import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectsState } from './useProjectsState.js'

/**
 * Routing-aware wrapper around useProjectsState.
 * Syncs route params (tag, query) to the filter state.
 *
 * Must be called within a component setup (needs vue-router injection context).
 */
export function useProjectsRouting() {
  const state = useProjectsState()
  const route = useRoute()

  watch(
    () => route.params.tag,
    (newTag) => {
      if (newTag) state.toggleTag(newTag)
    },
    { immediate: true }
  )

  watch(
    () => route.query.q,
    (newQuery) => {
      if (newQuery) state.search(newQuery)
    },
    { immediate: true }
  )

  return state
}
