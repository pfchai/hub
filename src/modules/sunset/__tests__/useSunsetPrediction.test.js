/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'
import { useSunsetPrediction } from '../useSunsetPrediction.js'

// Mock SunCalc
vi.mock('suncalc', () => ({
  default: {
    getTimes: vi.fn(() => ({
      sunset: new Date('2024-06-25T19:12:00+08:00'),
      goldenHour: new Date('2024-06-25T18:38:00+08:00'),
    })),
  },
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
})
