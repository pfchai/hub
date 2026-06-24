/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useGeolocation } from '../useGeolocation.js'

describe('useGeolocation', () => {
  /** @type {import('vitest').Mock} */
  let mockGetCurrentPosition

  beforeEach(() => {
    mockGetCurrentPosition = vi.fn()
    // JSDOM doesn't have navigator.geolocation by default
    Object.defineProperty(globalThis.navigator, 'geolocation', {
      value: { getCurrentPosition: mockGetCurrentPosition },
      configurable: true,
      writable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns coordinates on success', () => {
    mockGetCurrentPosition.mockImplementation((success) => {
      success({ coords: { latitude: 31.23, longitude: 121.47 } })
    })

    const { coords, error, isLoading } = useGeolocation()

    expect(coords.value).toEqual({ latitude: 31.23, longitude: 121.47 })
    expect(error.value).toBeNull()
    expect(isLoading.value).toBe(false)
  })

  it('sets error when permission denied', () => {
    mockGetCurrentPosition.mockImplementation((_success, error) => {
      error({ code: 1, PERMISSION_DENIED: 1, message: 'User denied geolocation' })
    })

    const { coords, error, isLoading } = useGeolocation()

    expect(coords.value).toBeNull()
    expect(error.value).toContain('Location access denied')
    expect(isLoading.value).toBe(false)
  })

  it('sets error when position unavailable', () => {
    mockGetCurrentPosition.mockImplementation((_success, error) => {
      error({ code: 2, POSITION_UNAVAILABLE: 2, message: 'Position unavailable' })
    })

    const { coords, error, isLoading } = useGeolocation()

    expect(coords.value).toBeNull()
    expect(error.value).toBe('Location unavailable.')
    expect(isLoading.value).toBe(false)
  })

  it('retries once on timeout, then succeeds', () => {
    let callCount = 0
    mockGetCurrentPosition.mockImplementation((success, error) => {
      callCount++
      if (callCount === 1) {
        error({ code: 3, TIMEOUT: 3, message: 'Timeout' })
      } else {
        success({ coords: { latitude: 40.71, longitude: -74.01 } })
      }
    })

    const { coords, error, isLoading } = useGeolocation()

    expect(mockGetCurrentPosition).toHaveBeenCalledTimes(2)
    expect(coords.value).toEqual({ latitude: 40.71, longitude: -74.01 })
    expect(error.value).toBeNull()
    expect(isLoading.value).toBe(false)
  })

  it('gives up after two timeouts', () => {
    let callCount = 0
    mockGetCurrentPosition.mockImplementation((_success, error) => {
      callCount++
      error({ code: 3, TIMEOUT: 3, message: 'Timeout' })
    })

    const { coords, error } = useGeolocation()

    expect(mockGetCurrentPosition).toHaveBeenCalledTimes(2)
    expect(coords.value).toBeNull()
    expect(error.value).toBe('Timeout')
  })

  it('shows loading state while waiting for geolocation', () => {
    // Don't call either callback — simulate pending
    mockGetCurrentPosition.mockImplementation(() => {
      // never resolves
    })

    const { coords, error, isLoading } = useGeolocation()

    expect(coords.value).toBeNull()
    expect(error.value).toBeNull()
    expect(isLoading.value).toBe(true)
  })

  it('sets error when geolocation is not supported', () => {
    Object.defineProperty(globalThis.navigator, 'geolocation', {
      value: undefined,
      configurable: true,
    })

    const { coords, error, isLoading } = useGeolocation()

    expect(coords.value).toBeNull()
    expect(error.value).toBe('Geolocation is not supported by this browser')
    expect(isLoading.value).toBe(false)
  })

  it('retry method resets and tries again', () => {
    let callCount = 0
    mockGetCurrentPosition.mockImplementation((success, error) => {
      callCount++
      if (callCount === 1) {
        error({ code: 1, PERMISSION_DENIED: 1, message: 'denied' })
      } else {
        success({ coords: { latitude: 35.68, longitude: 139.69 } })
      }
    })

    const { coords, error, retry } = useGeolocation()
    expect(coords.value).toBeNull()
    expect(error.value).toContain('denied')

    retry()
    expect(mockGetCurrentPosition).toHaveBeenCalledTimes(2)
    expect(coords.value).toEqual({ latitude: 35.68, longitude: 139.69 })
  })
})
