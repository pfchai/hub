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
import * as SunCalc from 'suncalc'

/**
 * @param {import('vue').Ref<{latitude: number, longitude: number} | null>} coordsRef
 * @param {import('vue').Ref<Object | null>} weatherDataRef
 * @returns {{
 *   sunsetTime: import('vue').Ref<Date | null>,
 *   goldenHourStart: import('vue').Ref<Date | null>,
 *   goldenHourEnd: import('vue').Ref<Date | null>,
 *   prediction: import('vue').Ref<string | null>,
 *   quality: import('vue').Ref<'good' | 'maybe' | 'unlikely' | null>,
 *   details: import('vue').Ref<string | null>,
 *   highCloudQuality: import('vue').Ref<'good' | 'maybe' | 'poor' | null>,
 *   lowCloudQuality: import('vue').Ref<'good' | 'maybe' | 'poor' | null>,
 *   humidityQuality: import('vue').Ref<'good' | 'maybe' | 'poor' | null>,
 *   compositeScore: import('vue').Ref<number>,
 *   highCloudPct: import('vue').Ref<number>,
 *   lowCloudPct: import('vue').Ref<number>,
 *   humidityPct: import('vue').Ref<number>
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

  /** @type {import('vue').Ref<'good' | 'maybe' | 'poor' | null>} */
  const highCloudQuality = ref(null)
  /** @type {import('vue').Ref<'good' | 'maybe' | 'poor' | null>} */
  const lowCloudQuality = ref(null)
  /** @type {import('vue').Ref<'good' | 'maybe' | 'poor' | null>} */
  const humidityQuality = ref(null)
  /** @type {import('vue').Ref<number>} */
  const compositeScore = ref(0)
  /** @type {import('vue').Ref<number>} */
  const highCloudPct = ref(0)
  /** @type {import('vue').Ref<number>} */
  const lowCloudPct = ref(0)
  /** @type {import('vue').Ref<number>} */
  const humidityPct = ref(0)

  /**
   * Rate a single metric against good/maybe/poor thresholds.
   * @param {number} value — percent 0–100
   * @param {'highCloud' | 'lowCloud' | 'humidity'} metric
   * @returns {'good' | 'maybe' | 'poor'}
   */
  function rateMetric(value, metric) {
    if (metric === 'highCloud') {
      if (value >= 30 && value <= 70) return 'good'
      if (value >= 10 && value < 30) return 'maybe'
      return 'poor'
    }
    if (metric === 'lowCloud') {
      if (value < 30) return 'good'
      if (value >= 30 && value <= 70) return 'maybe'
      return 'poor'
    }
    // humidity
    if (value >= 40 && value <= 80) return 'good'
    if ((value >= 30 && value < 40) || value > 80) return 'maybe'
    return 'poor'
  }

  /**
   * Compute composite score 0–100 from three metrics.
   * @param {number} highCloud
   * @param {number} lowCloud
   * @param {number} humidity
   * @returns {number} integer 0–100
   */
  function computeScore(highCloud, lowCloud, humidity) {
    let score = 0
    // High cloud (max 40)
    if (highCloud >= 30 && highCloud <= 70) score += 40
    else if (highCloud >= 10 && highCloud < 30) score += 20
    // Low cloud (max 30)
    if (lowCloud < 30) score += 30
    else if (lowCloud >= 30 && lowCloud <= 70) score += 15
    // Humidity (max 30)
    if (humidity >= 40 && humidity <= 80) score += 30
    else if ((humidity >= 30 && humidity < 40) || humidity > 80) score += 15
    return score
  }

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
        highCloudQuality.value = null
        lowCloudQuality.value = null
        humidityQuality.value = null
        compositeScore.value = 0
        highCloudPct.value = 0
        lowCloudPct.value = 0
        humidityPct.value = 0
        return
      }

      const { cloud_cover_high, cloud_cover_low, relative_humidity_2m } = data.current
      const highCloud = cloud_cover_high ?? 0
      const lowCloud = cloud_cover_low ?? 0
      const humidity = relative_humidity_2m ?? 0

      // Expose raw percentages
      highCloudPct.value = highCloud
      lowCloudPct.value = lowCloud
      humidityPct.value = humidity

      // Per-metric quality
      highCloudQuality.value = rateMetric(highCloud, 'highCloud')
      lowCloudQuality.value = rateMetric(lowCloud, 'lowCloud')
      humidityQuality.value = rateMetric(humidity, 'humidity')

      // Composite score
      compositeScore.value = computeScore(highCloud, lowCloud, humidity)

      // Overall verdict (unchanged logic)
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

  return {
    sunsetTime, goldenHourStart, goldenHourEnd,
    prediction, quality, details,
    highCloudQuality, lowCloudQuality, humidityQuality,
    compositeScore,
    highCloudPct, lowCloudPct, humidityPct,
  }
}
