/**
 * Backward-compatibility re-export.
 * New code should import from `@/composables/useProjectsState.js` directly.
 *
 * @deprecated Use useProjectsState for state-only, useProjectsRouting for route-aware.
 */
export { useProjectsState as useProjects } from './useProjectsState.js'
