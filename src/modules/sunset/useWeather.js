/**
 * useWeather — Open-Meteo weather API composable
 *
 * Accepts a reactive coordinates ref and auto-fetches weather data
 * from Open-Meteo when coordinates are available. Uses the shared
 * `useApi` composable for fetch with timeout and error normalization.
 *
 * @module modules/sunset/useWeather
 */

import { ref, watch } from 'vue'
import { useApi, ApiError } from '@/composables/useApi.js'

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast'

/**
 * @typedef {Object} WeatherData
 * @property {Object} current
 * @property {number} [current.cloud_cover]
 * @property {number} [current.cloud_cover_high]
 * @property {number} [current.cloud_cover_low]
 * @property {number} [current.relative_humidity_2m]
 * @property {Object} [hourly]
 * @property {number[]} [hourly.cloud_cover]
 */

/**
 * @param {import('vue').Ref<{latitude: number, longitude: number} | null>} coordsRef
 * @returns {{
 *   data: import('vue').Ref<WeatherData | null>,
 *   error: import('vue').Ref<string | null>,
 *   isLoading: import('vue').Ref<boolean>
 * }}
 */
export function useWeather(coordsRef) {
  /** @type {import('vue').Ref<WeatherData | null>} */
  const data = ref(null)
  /** @type {import('vue').Ref<string | null>} */
  const error = ref(null)
  /** @type {import('vue').Ref<boolean>} */
  const isLoading = ref(false)

  watch(
    coordsRef,
    async (coords) => {
      if (!coords) return

      isLoading.value = true
      error.value = null
      data.value = null

      try {
        const params = new URLSearchParams({
          latitude: coords.latitude.toString(),
          longitude: coords.longitude.toString(),
          current: 'cloud_cover,relative_humidity_2m,cloud_cover_high,cloud_cover_low',
          hourly: 'cloud_cover',
          timezone: 'auto',
        })

        const url = `${OPEN_METEO_URL}?${params}`
        const result = await useApi(url)

        // Validate response structure
        if (!result || typeof result !== 'object') {
          throw new Error('Invalid response from weather API')
        }
        if (!result.current || typeof result.current !== 'object') {
          throw new Error('Weather data missing current conditions')
        }

        data.value = result
      } catch (err) {
        if (err instanceof ApiError) {
          error.value = err.message
        } else {
          error.value = err.message || 'Failed to fetch weather data'
        }
      } finally {
        isLoading.value = false
      }
    },
    { immediate: true }
  )

  return { data, error, isLoading }
}
