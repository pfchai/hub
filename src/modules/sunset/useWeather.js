/**
 * useWeather — Open-Meteo weather API composable
 *
 * Accepts a reactive coordinates ref and auto-fetches weather data
 * from Open-Meteo when coordinates are available. Fetches hourly
 * data and extracts per-day sunset-hour snapshots for multi-day
 * prediction support.
 *
 * @module modules/sunset/useWeather
 */

import { ref, watch } from 'vue'
import { useApi, ApiError } from '@/composables/useApi.js'

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast'

/**
 * @typedef {Object} WeatherSnapshot
 * @property {number} cloud_cover
 * @property {number} cloud_cover_high
 * @property {number} cloud_cover_low
 * @property {number} relative_humidity_2m
 */

/**
 * @typedef {Object} WeatherData
 * @property {Object} current — day-0 snapshot (backward compat shape)
 * @property {Object} [hourly]
 * @property {number[]} [hourly.cloud_cover]
 */

/**
 * @param {import('vue').Ref<{latitude: number, longitude: number} | null>} coordsRef
 * @param {{ forecastDays?: number }} [opts]
 * @returns {{
 *   data: import('vue').Ref<WeatherData | null>,
 *   daily: import('vue').Ref<WeatherSnapshot[]>,
 *   error: import('vue').Ref<string | null>,
 *   isLoading: import('vue').Ref<boolean>
 * }}
 */
export function useWeather(coordsRef, opts = {}) {
  const forecastDays = opts.forecastDays ?? 1

  /** @type {import('vue').Ref<WeatherData | null>} */
  const data = ref(null)
  /** @type {import('vue').Ref<WeatherSnapshot[]>} */
  const daily = ref([])
  /** @type {import('vue').Ref<string | null>} */
  const error = ref(null)
  /** @type {import('vue').Ref<boolean>} */
  const isLoading = ref(false)

  /**
   * Extract per-day snapshot from hourly arrays.
   * Picks hour 17:00 local time (approx 1h before sunset in summer).
   * @param {Object} hourly
   * @param {number} numDays
   * @returns {WeatherSnapshot[]}
   */
  function extractDailySnapshots(hourly, numDays) {
    const snapshots = []
    const keys = ['cloud_cover', 'cloud_cover_high', 'cloud_cover_low', 'relative_humidity_2m']

    for (let d = 0; d < numDays; d++) {
      // Hour 17 = 5 PM local time = index d*24 + 17 in hourly arrays
      const idx = d * 24 + 17
      /** @type {WeatherSnapshot} */
      const snap = {}
      for (const key of keys) {
        const arr = hourly[key]
        snap[key] = (arr && typeof arr[idx] === 'number') ? arr[idx] : 0
      }
      snapshots.push(snap)
    }
    return snapshots
  }

  watch(
    coordsRef,
    async (coords) => {
      if (!coords) return

      isLoading.value = true
      error.value = null
      data.value = null
      daily.value = []

      try {
        const params = new URLSearchParams({
          latitude: coords.latitude.toString(),
          longitude: coords.longitude.toString(),
          hourly: 'cloud_cover,relative_humidity_2m,cloud_cover_high,cloud_cover_low',
          timezone: 'auto',
          forecast_days: forecastDays.toString(),
        })

        const url = `${OPEN_METEO_URL}?${params}`
        const result = await useApi(url)

        // Validate response structure
        if (!result || typeof result !== 'object') {
          throw new Error('Invalid response from weather API')
        }
        if (!result.hourly || typeof result.hourly !== 'object') {
          throw new Error('Weather data missing hourly forecast')
        }

        // Build backward-compat data shape: { current: day-0 snapshot }
        const snapshots = extractDailySnapshots(result.hourly, forecastDays)
        data.value = { ...result, current: snapshots[0] }
        daily.value = snapshots
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

  return { data, error, daily, isLoading }
}
