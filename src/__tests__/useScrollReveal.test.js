import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useScrollReveal } from '../composables/useScrollReveal.js'

// Mock IntersectionObserver
const mockObserve = vi.fn()
const mockDisconnect = vi.fn()
const mockUnobserve = vi.fn()
let intersectionCallback = null

global.IntersectionObserver = vi.fn((callback) => {
  intersectionCallback = callback
  return {
    observe: mockObserve,
    disconnect: mockDisconnect,
    unobserve: mockUnobserve,
  }
})

function createMockElement() {
  const el = document.createElement('div')
  el.classList.add('reveal-item')
  return el
}

describe('useScrollReveal', () => {
  beforeEach(() => {
    mockObserve.mockClear()
    mockDisconnect.mockClear()
    mockUnobserve.mockClear()
    intersectionCallback = null
    // Ensure prefers-reduced-motion is not set
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  it('returns a register function', () => {
    const { register } = useScrollReveal()
    expect(register).toBeTypeOf('function')
  })

  it('observes elements passed to register', () => {
    const { register } = useScrollReveal()
    const el = createMockElement()
    register(el)
    expect(mockObserve).toHaveBeenCalledWith(el)
  })

  it('adds reveal-item--visible when element is intersected', () => {
    const { register } = useScrollReveal()
    const el = createMockElement()
    register(el)
    expect(el.classList.contains('reveal-item')).toBe(true)
    expect(el.classList.contains('reveal-item--visible')).toBe(false)

    // Simulate intersection
    intersectionCallback([{ isIntersecting: true, target: el }])
    expect(el.classList.contains('reveal-item--visible')).toBe(true)
    expect(el.classList.contains('reveal-item')).toBe(false)
  })

  it('respects delay via dataset.revealDelay', () => {
    vi.useFakeTimers()
    const { register } = useScrollReveal()
    const el = createMockElement()
    register(el, 100)
    expect(mockObserve).toHaveBeenCalledWith(el)

    // Simulate intersection
    intersectionCallback([{ isIntersecting: true, target: el }])
    // Should not be visible yet (delay pending)
    expect(el.classList.contains('reveal-item--visible')).toBe(false)

    vi.advanceTimersByTime(100)
    expect(el.classList.contains('reveal-item--visible')).toBe(true)
    expect(el.classList.contains('reveal-item')).toBe(false)

    vi.useRealTimers()
  })

  it('unobserves after once: true (default)', () => {
    const { register } = useScrollReveal()
    const el = createMockElement()
    register(el)
    intersectionCallback([{ isIntersecting: true, target: el }])
    expect(mockUnobserve).toHaveBeenCalledWith(el)
  })

  it('handles prefers-reduced-motion by immediately revealing', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    const { register } = useScrollReveal()
    const el = createMockElement()
    register(el)
    expect(el.classList.contains('reveal-item--visible')).toBe(true)
    expect(mockObserve).not.toHaveBeenCalled()
  })

  it('handles null elements gracefully', () => {
    const { register } = useScrollReveal()
    expect(() => register(null)).not.toThrow()
    expect(() => register(undefined)).not.toThrow()
  })
})
