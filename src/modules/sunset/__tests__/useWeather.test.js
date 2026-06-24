/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { useWeather } from '../useWeather.js'
import { useApi, ApiError } from '@/composables/useApi.js'

vi.mock('@/composables/useApi.js', () => ({
  useApi: vi.fn(),
  ApiError: class ApiError extends Error {
    constructor(code, message, status) {
      super(message)
      this.name = 'ApiError'
      this.code = code
      this.status = status
    }
  },
}))

describe('useWeather', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches weather data when coords are provided', async () => {
    const mockResponse = {
      current: {
        cloud_cover: 50,
        cloud_cover_high: 40,
        cloud_cover_low: 20,
        relative_humidity_2m: 60,
      },
    }
    useApi.mockResolvedValue(mockResponse)

    const coordsRef = ref({ latitude: 31.23, longitude: 121.47 })
    const { data, error, isLoading } = useWeather(coordsRef)

    // Wait for the async watcher to complete
    await vi.waitFor(() => {
      expect(data.value).toEqual(mockResponse)
    })

    expect(error.value).toBeNull()
    expect(isLoading.value).toBe(false)
  })

  it('does not fetch when coords are null', async () => {
    const coordsRef = ref(null)
    const { data, error, isLoading } = useWeather(coordsRef)

    // Give any pending microtasks time to run
    await nextTick()

    expect(useApi).not.toHaveBeenCalled()
    expect(data.value).toBeNull()
    expect(error.value).toBeNull()
    expect(isLoading.value).toBe(false)
  })

  it('sets error when useApi fails with ApiError', async () => {
    useApi.mockRejectedValue(new ApiError('network', 'Network request failed'))

    const coordsRef = ref({ latitude: 31.23, longitude: 121.47 })
    const { data, error, isLoading } = useWeather(coordsRef)

    await vi.waitFor(() => {
      expect(error.value).toBe('Network request failed')
    })

    expect(data.value).toBeNull()
    expect(isLoading.value).toBe(false)
  })

  it('refetches when coords change', async () => {
    useApi
      .mockResolvedValueOnce({ current: { cloud_cover: 10 } })
      .mockResolvedValueOnce({ current: { cloud_cover: 80 } })

    const coordsRef = ref({ latitude: 31.23, longitude: 121.47 })
    const { data } = useWeather(coordsRef)

    await vi.waitFor(() => {
      expect(data.value).toEqual({ current: { cloud_cover: 10 } })
    })

    coordsRef.value = { latitude: 40.71, longitude: -74.01 }

    await vi.waitFor(() => {
      expect(data.value).toEqual({ current: { cloud_cover: 80 } })
    })

    expect(useApi).toHaveBeenCalledTimes(2)
  })

  it('validates response structure and errors on missing current', async () => {
    useApi.mockResolvedValue({ hourly: { cloud_cover: [] } })

    const coordsRef = ref({ latitude: 31.23, longitude: 121.47 })
    const { data, error, isLoading } = useWeather(coordsRef)

    await vi.waitFor(() => {
      expect(error.value).toBe('Weather data missing current conditions')
    })

    expect(data.value).toBeNull()
    expect(isLoading.value).toBe(false)
  })

  it('handles malformed response (null)', async () => {
    useApi.mockResolvedValue(null)

    const coordsRef = ref({ latitude: 31.23, longitude: 121.47 })
    const { data, error, isLoading } = useWeather(coordsRef)

    await vi.waitFor(() => {
      expect(error.value).toBe('Invalid response from weather API')
    })

    expect(data.value).toBeNull()
    expect(isLoading.value).toBe(false)
  })

  it('sets loading true during fetch', async () => {
    let resolvePromise
    useApi.mockReturnValue(new Promise((resolve) => { resolvePromise = resolve }))

    const coordsRef = ref({ latitude: 31.23, longitude: 121.47 })
    const { data, isLoading } = useWeather(coordsRef)

    // Give the watch callback time to start
    await nextTick()
    expect(isLoading.value).toBe(true)

    resolvePromise({ current: { cloud_cover: 50 } })

    await vi.waitFor(() => {
      expect(isLoading.value).toBe(false)
    })
  })

  it('calls useApi with correct Open-Meteo URL', async () => {
    useApi.mockResolvedValue({ current: { cloud_cover: 50 } })

    const coordsRef = ref({ latitude: 31.23, longitude: 121.47 })
    useWeather(coordsRef)

    await vi.waitFor(() => {
      expect(useApi).toHaveBeenCalledTimes(1)
    })

    const calledUrl = useApi.mock.calls[0][0]
    expect(calledUrl).toContain('api.open-meteo.com')
    expect(calledUrl).toContain('latitude=31.23')
    expect(calledUrl).toContain('longitude=121.47')
    expect(calledUrl).toContain('cloud_cover_high')
    expect(calledUrl).toContain('cloud_cover_low')
    expect(calledUrl).toContain('relative_humidity_2m')
  })
})
