/**
 * useGeolocation — browser geolocation wrapper
 *
 * Provides reactive geolocation state with automatic one-shot positioning,
 * plus a manual retry method. Handles permission denied, position unavailable,
 * and timeout (with one automatic retry).
 *
 * @module modules/sunset/useGeolocation
 */

import { ref } from 'vue'

/**
 * @typedef {Object} GeolocationCoords
 * @property {number} latitude
 * @property {number} longitude
 */

/**
 * @returns {{
 *   coords: import('vue').Ref<GeolocationCoords | null>,
 *   error: import('vue').Ref<string | null>,
 *   isLoading: import('vue').Ref<boolean>,
 *   retry: () => void
 * }}
 */
export function useGeolocation() {
  /** @type {import('vue').Ref<GeolocationCoords | null>} */
  const coords = ref(null)
  /** @type {import('vue').Ref<string | null>} */
  const error = ref(null)
  /** @type {import('vue').Ref<boolean>} */
  const isLoading = ref(true)

  let retryCount = 0

  function getPosition() {
    if (!navigator.geolocation) {
      error.value = 'Geolocation is not supported by this browser'
      isLoading.value = false
      return
    }

    isLoading.value = true
    error.value = null

    navigator.geolocation.getCurrentPosition(
      (position) => {
        coords.value = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }
        error.value = null
        isLoading.value = false
      },
      (err) => {
        if (err.code === err.TIMEOUT && retryCount < 1) {
          retryCount++
          getPosition()
          return
        }

        if (err.code === err.PERMISSION_DENIED) {
          error.value = 'Location access denied. You can enter coordinates manually.'
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          error.value = 'Location unavailable.'
        } else {
          error.value = err.message || 'Failed to get location'
        }
        isLoading.value = false
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    )
  }

  getPosition()

  /**
   * Retry geolocation with reset retry count.
   */
  function retry() {
    retryCount = 0
    getPosition()
  }

  return { coords, error, isLoading, retry }
}
