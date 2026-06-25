/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import SunsetView from '../SunsetView.vue'

// ── Mock composables ────────────────────────────────────────────────
const mockCoords = ref(null)
const mockGeoError = ref(null)
const mockGeoLoading = ref(false)
const mockRetry = vi.fn()

vi.mock('../useGeolocation.js', () => ({
  useGeolocation: () => ({
    coords: mockCoords,
    error: mockGeoError,
    isLoading: mockGeoLoading,
    retry: mockRetry,
  }),
}))

const mockWeatherData = ref(null)
const mockDaily = ref([])
const mockWeatherError = ref(null)
const mockWeatherLoading = ref(false)

vi.mock('../useWeather.js', () => ({
  useWeather: () => ({
    data: mockWeatherData,
    daily: mockDaily,
    error: mockWeatherError,
    isLoading: mockWeatherLoading,
  }),
}))

// Mock SunCalc
vi.mock('suncalc', () => ({
  getTimes: vi.fn(() => ({
    sunrise: new Date('2026-06-26T05:00:00+08:00'),
    sunset: new Date('2026-06-26T19:12:00+08:00'),
    goldenHour: new Date('2026-06-26T18:38:00+08:00'),
  })),
}))

// ── Helper: build a weather daily snapshot ──────────────────────────
function makeSnapshot(highCloud, lowCloud, humidity) {
  return {
    cloud_cover: highCloud + lowCloud,
    cloud_cover_high: highCloud,
    cloud_cover_low: lowCloud,
    relative_humidity_2m: humidity,
  }
}

describe('SunsetView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCoords.value = null
    mockGeoError.value = null
    mockGeoLoading.value = false
    mockWeatherData.value = null
    mockDaily.value = []
    mockWeatherError.value = null
    mockWeatherLoading.value = false
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ── State: manual input ─────────────────────────────────────────

  it('shows manual input card when no coordinates', () => {
    const wrapper = mount(SunsetView)
    expect(wrapper.find('.manual-input-card').exists()).toBe(true)
    expect(wrapper.find('.dashboard').exists()).toBe(false)
  })

  it('shows geo error message when geolocation denied', async () => {
    mockGeoError.value = 'Location access denied. You can enter coordinates manually.'
    const wrapper = mount(SunsetView)
    expect(wrapper.find('.manual-hint').text()).toContain('Location access denied')
  })

  it('enables submit button only when both lat and lng are filled', async () => {
    const wrapper = mount(SunsetView)
    const btn = wrapper.find('.submit-btn')
    expect(btn.attributes('disabled')).toBeDefined()

    await wrapper.find('#manual-lat').setValue(31.23)
    expect(btn.attributes('disabled')).toBeDefined()

    await wrapper.find('#manual-lng').setValue(121.47)
    expect(btn.attributes('disabled')).toBeUndefined()
  })

  // ── State: dashboard with data ──────────────────────────────────

  it('renders dashboard when weather data is available', () => {
    mockCoords.value = { latitude: 31.23, longitude: 121.47 }
    mockDaily.value = [
      makeSnapshot(50, 20, 60),
      makeSnapshot(20, 50, 35),
      makeSnapshot(5, 80, 20),
    ]
    mockWeatherData.value = {
      current: mockDaily.value[0],
      hourly: {},
    }

    const wrapper = mount(SunsetView)
    expect(wrapper.find('.dashboard').exists()).toBe(true)
  })

  it('renders three day tabs', () => {
    mockCoords.value = { latitude: 31.23, longitude: 121.47 }
    mockDaily.value = [
      makeSnapshot(50, 20, 60),
      makeSnapshot(20, 50, 35),
      makeSnapshot(5, 80, 20),
    ]
    mockWeatherData.value = {
      current: mockDaily.value[0],
      hourly: {},
    }

    const wrapper = mount(SunsetView)
    const tabs = wrapper.findAll('.day-tab')
    expect(tabs).toHaveLength(3)
    expect(tabs[0].classes()).toContain('day-tab--active')
  })

  // ── Donut ring colors ───────────────────────────────────────────

  it('renders donut rings with green stroke for good quality', () => {
    mockCoords.value = { latitude: 31.23, longitude: 121.47 }
    mockDaily.value = [
      makeSnapshot(50, 20, 60),  // all good
    ]
    mockWeatherData.value = {
      current: mockDaily.value[0],
      hourly: {},
    }

    const wrapper = mount(SunsetView)
    const rings = wrapper.findAll('.donut-ring')
    expect(rings).toHaveLength(3)
    // All rings should be green (#16a34a) for good conditions
    for (const ring of rings) {
      expect(ring.attributes('stroke')).toBe('#16a34a')
    }
  })

  it('renders donut rings with yellow stroke for maybe quality', () => {
    mockCoords.value = { latitude: 31.23, longitude: 121.47 }
    mockDaily.value = [
      makeSnapshot(20, 50, 35),  // all maybe
    ]
    mockWeatherData.value = {
      current: mockDaily.value[0],
      hourly: {},
    }

    const wrapper = mount(SunsetView)
    const rings = wrapper.findAll('.donut-ring')
    for (const ring of rings) {
      expect(ring.attributes('stroke')).toBe('#ca8a04')
    }
  })

  it('renders donut rings with muted color for poor quality', () => {
    mockCoords.value = { latitude: 31.23, longitude: 121.47 }
    mockDaily.value = [
      makeSnapshot(5, 80, 20),  // all poor
    ]
    mockWeatherData.value = {
      current: mockDaily.value[0],
      hourly: {},
    }

    const wrapper = mount(SunsetView)
    const rings = wrapper.findAll('.donut-ring')
    for (const ring of rings) {
      expect(ring.attributes('stroke')).toBe('var(--text-muted)')
    }
  })

  // ── Day tab switching ───────────────────────────────────────────

  it('switches day tabs and renders different day data', async () => {
    mockCoords.value = { latitude: 31.23, longitude: 121.47 }
    mockDaily.value = [
      makeSnapshot(50, 20, 60),  // day 0: good
      makeSnapshot(20, 50, 35),  // day 1: maybe
      makeSnapshot(5, 80, 20),   // day 2: poor
    ]
    mockWeatherData.value = {
      current: mockDaily.value[0],
      hourly: {},
    }

    const wrapper = mount(SunsetView)
    const tabs = wrapper.findAll('.day-tab')

    // Day 0: active, green rings
    expect(tabs[0].classes()).toContain('day-tab--active')

    // Click day 1 (tomorrow)
    await tabs[1].trigger('click')
    expect(tabs[1].classes()).toContain('day-tab--active')
    const ringsAfter = wrapper.findAll('.donut-ring')
    for (const ring of ringsAfter) {
      expect(ring.attributes('stroke')).toBe('#ca8a04')
    }
  })

  // ── Degraded state ──────────────────────────────────────────────

  it('shows degraded card when weather API fails', () => {
    mockCoords.value = { latitude: 31.23, longitude: 121.47 }
    mockWeatherError.value = 'API error'

    const wrapper = mount(SunsetView)
    expect(wrapper.find('.degraded-card').exists()).toBe(true)
    expect(wrapper.find('.degraded-banner').text()).toBe('天气数据暂不可用')
  })

  // ── Loading skeleton ────────────────────────────────────────────

  it('shows loading skeleton while fetching', () => {
    mockCoords.value = { latitude: 31.23, longitude: 121.47 }
    mockWeatherLoading.value = true

    const wrapper = mount(SunsetView)
    expect(wrapper.find('.skeleton-card').exists()).toBe(true)
  })
})
