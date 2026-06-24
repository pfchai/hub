/**
 * useSunsetPrediction — sunset prediction logic composable
 *
 * Computes sunset, golden hour times via SunCalc and applies a
 * heuristic based on cloud cover and humidity to rate the
 * predicted sunset quality.
 *
 * Prediction heuristic:
 * - high_cloud_pct > 30 AND humidity 40-80 AND low_cloud_pct < 70 → "good" (green)
 * - high_cloud_pct > 10 AND humidity >= 30 → "maybe" (yellow)
 * - otherwise → "unlikely" (gray)
 *
 * @module modules/sunset/useSunsetPrediction
 */

import { ref, watch } from 'vue'
import SunCalc from 'suncalc'

/**
 * @param {import('vue').Ref<{latitude: number, longitude: number} | null>} coordsRef
 * @param {import('vue').Ref<Object | null>} weatherDataRef
 * @returns {{
 *   sunsetTime: import('vue').Ref<Date | null>,
 *   goldenHourStart: import('vue').Ref<Date | null>,
 *   goldenHourEnd: import('vue').Ref<Date | null>,
 *   prediction: import('vue').Ref<string | null>,
 *   quality: import('vue').Ref<'good' | 'maybe' | 'unlikely' | null>,
 *   details: import('vue').Ref<string | null>
 * }}
 */
export function useSunsetPrediction(coordsRef, weatherDataRef) {
  /** @type {import('vue').Ref<Date | null>} */
  const sunsetTime = ref(null)
  /** @type {import('vue').Ref<Date | null>} */
  const goldenHourStart = ref(null)
  /** @type {import('vue').Ref<Date | null>} */
  const goldenHourEnd = ref(null)
  /** @type {import('vue').Ref<string | null>} */
  const prediction = ref(null)
  /** @type {import('vue').Ref<'good' | 'maybe' | 'unlikely' | null>} */
  const quality = ref(null)
  /** @type {import('vue').Ref<string | null>} */
  const details = ref(null)

  // ── Compute sun times when coordinates change ──────────────────
  watch(
    coordsRef,
    (coords) => {
      if (!coords) {
        sunsetTime.value = null
        goldenHourStart.value = null
        goldenHourEnd.value = null
        return
      }

      const times = SunCalc.getTimes(new Date(), coords.latitude, coords.longitude)
      sunsetTime.value = times.sunset
      goldenHourStart.value = times.goldenHour
      goldenHourEnd.value = times.sunset
    },
    { immediate: true }
  )

  // ── Compute quality when weather data changes ──────────────────
  watch(
    weatherDataRef,
    (data) => {
      if (!data || !data.current) {
        prediction.value = null
        quality.value = null
        details.value = null
        return
      }

      const { cloud_cover_high, cloud_cover_low, relative_humidity_2m } = data.current
      const highCloud = cloud_cover_high ?? 0
      const lowCloud = cloud_cover_low ?? 0
      const humidity = relative_humidity_2m ?? 0

      if (highCloud > 30 && humidity >= 40 && humidity <= 80 && lowCloud < 70) {
        quality.value = 'good'
        prediction.value = '值得一看'
        details.value = '高云覆盖和适宜湿度，晚霞色彩会很丰富。'
      } else if (highCloud > 10 && humidity >= 30) {
        quality.value = 'maybe'
        prediction.value = '可以留意'
        details.value = '有一定云量，但条件可能不是最理想。'
      } else {
        quality.value = 'unlikely'
        prediction.value = '概率较低'
        details.value = '天空太干净或湿度不合适，晚霞可能不明显。'
      }
    },
    { immediate: true }
  )

  return { sunsetTime, goldenHourStart, goldenHourEnd, prediction, quality, details }
}
