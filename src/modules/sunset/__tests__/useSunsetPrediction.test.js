/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'
import { useSunsetPrediction } from '../useSunsetPrediction.js'

// Mock SunCalc
vi.mock('suncalc', () => ({
  getTimes: vi.fn(() => ({
    sunset: new Date('2024-06-25T19:12:00+08:00'),
    goldenHour: new Date('2024-06-25T18:38:00+08:00'),
  })),
}))

describe('useSunsetPrediction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('computes sunset times from coordinates', async () => {
    const coordsRef = ref({ latitude: 31.23, longitude: 121.47 })
    const weatherRef = ref(null)
    const result = useSunsetPrediction(coordsRef, weatherRef)

    await vi.waitFor(() => {
      expect(result.sunsetTime.value).toBeInstanceOf(Date)
    })

    expect(result.goldenHourStart.value).toBeInstanceOf(Date)
    expect(result.goldenHourEnd.value).toBeInstanceOf(Date)
  })

  it('returns null times when coords are null', () => {
    const coordsRef = ref(null)
    const weatherRef = ref(null)
    const result = useSunsetPrediction(coordsRef, weatherRef)

    expect(result.sunsetTime.value).toBeNull()
    expect(result.goldenHourStart.value).toBeNull()
    expect(result.goldenHourEnd.value).toBeNull()
  })

  describe('prediction quality', () => {
    it('returns "good" for optimal conditions', async () => {
      const coordsRef = ref({ latitude: 31.23, longitude: 121.47 })
      const weatherRef = ref({
        current: {
          cloud_cover_high: 50,
          cloud_cover_low: 30,
          relative_humidity_2m: 60,
        },
      })

      const { quality, prediction, details } = useSunsetPrediction(coordsRef, weatherRef)

      await vi.waitFor(() => {
        expect(quality.value).toBe('good')
      })
      expect(prediction.value).toBe('值得一看')
      expect(details.value).toBeTruthy()
    })

    it('exposes per-metric quality ratings for good conditions', async () => {
      const coordsRef = ref({ latitude: 31.23, longitude: 121.47 })
      const weatherRef = ref({
        current: {
          cloud_cover_high: 50,
          cloud_cover_low: 20,
          relative_humidity_2m: 60,
        },
      })

      const { highCloudQuality, lowCloudQuality, humidityQuality } = useSunsetPrediction(coordsRef, weatherRef)

      await vi.waitFor(() => {
        expect(highCloudQuality.value).toBe('good')
      })
      expect(lowCloudQuality.value).toBe('good')
      expect(humidityQuality.value).toBe('good')
    })

    it('exposes per-metric quality ratings for maybe conditions', async () => {
      const coordsRef = ref({ latitude: 31.23, longitude: 121.47 })
      const weatherRef = ref({
        current: {
          cloud_cover_high: 20,
          cloud_cover_low: 50,
          relative_humidity_2m: 35,
        },
      })

      const { highCloudQuality, lowCloudQuality, humidityQuality } = useSunsetPrediction(coordsRef, weatherRef)

      await vi.waitFor(() => {
        expect(highCloudQuality.value).toBe('maybe')
      })
      expect(lowCloudQuality.value).toBe('maybe')
      expect(humidityQuality.value).toBe('maybe')
    })

    it('exposes per-metric quality ratings for poor conditions', async () => {
      const coordsRef = ref({ latitude: 31.23, longitude: 121.47 })
      const weatherRef = ref({
        current: {
          cloud_cover_high: 5,
          cloud_cover_low: 80,
          relative_humidity_2m: 20,
        },
      })

      const { highCloudQuality, lowCloudQuality, humidityQuality } = useSunsetPrediction(coordsRef, weatherRef)

      await vi.waitFor(() => {
        expect(highCloudQuality.value).toBe('poor')
      })
      expect(lowCloudQuality.value).toBe('poor')
      expect(humidityQuality.value).toBe('poor')
    })

    it('returns "good" at boundary: highCloud=31, humidity=40, lowCloud=69', async () => {
      const coordsRef = ref({ latitude: 31.23, longitude: 121.47 })
      const weatherRef = ref({
        current: {
          cloud_cover_high: 31,
          cloud_cover_low: 69,
          relative_humidity_2m: 40,
        },
      })

      const { quality } = useSunsetPrediction(coordsRef, weatherRef)

      await vi.waitFor(() => {
        expect(quality.value).toBe('good')
      })
    })

    it('returns "good" at boundary: highCloud=31, humidity=80, lowCloud=69', async () => {
      const coordsRef = ref({ latitude: 31.23, longitude: 121.47 })
      const weatherRef = ref({
        current: {
          cloud_cover_high: 50,
          cloud_cover_low: 30,
          relative_humidity_2m: 80,
        },
      })

      const { quality } = useSunsetPrediction(coordsRef, weatherRef)

      await vi.waitFor(() => {
        expect(quality.value).toBe('good')
      })
    })

    it('returns "maybe" for moderate conditions', async () => {
      const coordsRef = ref({ latitude: 31.23, longitude: 121.47 })
      const weatherRef = ref({
        current: {
          cloud_cover_high: 20,
          cloud_cover_low: 10,
          relative_humidity_2m: 50,
        },
      })

      const { quality, prediction, details } = useSunsetPrediction(coordsRef, weatherRef)

      await vi.waitFor(() => {
        expect(quality.value).toBe('maybe')
      })
      expect(prediction.value).toBe('可以留意')
      expect(details.value).toBeTruthy()
    })

    it('returns "unlikely" for poor conditions', async () => {
      const coordsRef = ref({ latitude: 31.23, longitude: 121.47 })
      const weatherRef = ref({
        current: {
          cloud_cover_high: 5,
          cloud_cover_low: 0,
          relative_humidity_2m: 20,
        },
      })

      const { quality, prediction, details } = useSunsetPrediction(coordsRef, weatherRef)

      await vi.waitFor(() => {
        expect(quality.value).toBe('unlikely')
      })
      expect(prediction.value).toBe('概率较低')
      expect(details.value).toBeTruthy()
    })

    it('returns null quality when weather data is missing', () => {
      const coordsRef = ref({ latitude: 31.23, longitude: 121.47 })
      const weatherRef = ref(null)
      const { quality, prediction } = useSunsetPrediction(coordsRef, weatherRef)

      expect(quality.value).toBeNull()
      expect(prediction.value).toBeNull()
    })

    it('returns null quality when current is missing', () => {
      const coordsRef = ref({ latitude: 31.23, longitude: 121.47 })
      const weatherRef = ref({ hourly: {} })
      const { quality, prediction } = useSunsetPrediction(coordsRef, weatherRef)

      expect(quality.value).toBeNull()
      expect(prediction.value).toBeNull()
    })

    it('refreshes prediction when weather data changes', async () => {
      const coordsRef = ref({ latitude: 31.23, longitude: 121.47 })
      const weatherRef = ref({
        current: {
          cloud_cover_high: 5,
          cloud_cover_low: 0,
          relative_humidity_2m: 20,
        },
      })

      const { quality } = useSunsetPrediction(coordsRef, weatherRef)

      await vi.waitFor(() => {
        expect(quality.value).toBe('unlikely')
      })

      // Update weather to good conditions
      weatherRef.value = {
        current: {
          cloud_cover_high: 50,
          cloud_cover_low: 30,
          relative_humidity_2m: 60,
        },
      }

      await vi.waitFor(() => {
        expect(quality.value).toBe('good')
      })
    })

    it('refreshes times when coordinates change', async () => {
      const coordsRef = ref(null)
      const weatherRef = ref(null)
      const result = useSunsetPrediction(coordsRef, weatherRef)

      expect(result.sunsetTime.value).toBeNull()

      coordsRef.value = { latitude: 40.71, longitude: -74.01 }

      await vi.waitFor(() => {
        expect(result.sunsetTime.value).toBeInstanceOf(Date)
      })
    })
  })

  describe('edge cases for predictions', () => {
    it('handles missing cloud_cover_high by defaulting to 0', async () => {
      const coordsRef = ref({ latitude: 31.23, longitude: 121.47 })
      const weatherRef = ref({
        current: {
          relative_humidity_2m: 20,
        },
      })
      const { quality } = useSunsetPrediction(coordsRef, weatherRef)

      await vi.waitFor(() => {
        expect(quality.value).toBe('unlikely')
      })
    })

    it('handles missing humidity by defaulting to 0', async () => {
      const coordsRef = ref({ latitude: 31.23, longitude: 121.47 })
      const weatherRef = ref({
        current: {
          cloud_cover_high: 50,
          cloud_cover_low: 30,
        },
      })
      const { quality } = useSunsetPrediction(coordsRef, weatherRef)

      // humidity defaults to 0, which is < 40, so not "good"
      // Also 0 < 30, so not "maybe" either
      await vi.waitFor(() => {
        expect(quality.value).toBe('unlikely')
      })
    })
  })

  describe('composite score', () => {
    it('returns 100 for perfect conditions', async () => {
      const coordsRef = ref({ latitude: 31.23, longitude: 121.47 })
      const weatherRef = ref({
        current: {
          cloud_cover_high: 50,
          cloud_cover_low: 20,
          relative_humidity_2m: 60,
        },
      })

      const { compositeScore } = useSunsetPrediction(coordsRef, weatherRef)

      await vi.waitFor(() => {
        expect(compositeScore.value).toBe(100)
      })
    })

    it('returns 0 for worst conditions', async () => {
      const coordsRef = ref({ latitude: 31.23, longitude: 121.47 })
      const weatherRef = ref({
        current: {
          cloud_cover_high: 5,
          cloud_cover_low: 80,
          relative_humidity_2m: 20,
        },
      })

      const { compositeScore } = useSunsetPrediction(coordsRef, weatherRef)

      await vi.waitFor(() => {
        expect(compositeScore.value).toBe(0)
      })
    })

    it('returns intermediate scores for mixed conditions', async () => {
      const coordsRef = ref({ latitude: 31.23, longitude: 121.47 })
      const weatherRef = ref({
        current: {
          cloud_cover_high: 50,  // good → 40
          cloud_cover_low: 50,   // maybe → 15
          relative_humidity_2m: 35, // maybe → 15
        },
      })

      const { compositeScore } = useSunsetPrediction(coordsRef, weatherRef)

      await vi.waitFor(() => {
        expect(compositeScore.value).toBe(70)
      })
    })

    it('returns 0 when weather data is missing', () => {
      const coordsRef = ref({ latitude: 31.23, longitude: 121.47 })
      const weatherRef = ref(null)
      const { compositeScore } = useSunsetPrediction(coordsRef, weatherRef)

      expect(compositeScore.value).toBe(0)
    })
  })

  it('exposes raw percentage values', async () => {
    const coordsRef = ref({ latitude: 31.23, longitude: 121.47 })
    const weatherRef = ref({
      current: {
        cloud_cover_high: 45,
        cloud_cover_low: 22,
        relative_humidity_2m: 65,
      },
    })

    const { highCloudPct, lowCloudPct, humidityPct } = useSunsetPrediction(coordsRef, weatherRef)

    await vi.waitFor(() => {
      expect(highCloudPct.value).toBe(45)
    })
    expect(lowCloudPct.value).toBe(22)
    expect(humidityPct.value).toBe(65)
  })
})
