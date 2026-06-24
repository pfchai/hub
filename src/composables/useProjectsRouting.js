import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectsState } from './useProjectsState.js'

/**
 * Routing-aware wrapper around useProjectsState.
 * Syncs route params (tag, query) and query params (tag, q) to the filter state.
 *
 * Redirects (e.g. /tag/:tag → /m/curation?tag=) send the tag as a query param.
 * Direct navigation (e.g. /m/curation/tag/vue) uses a route param.
 * Both paths are handled here.
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
    () => route.query.tag,
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
