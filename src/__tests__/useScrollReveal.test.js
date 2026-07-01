import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useScrollReveal } from '../composables/useScrollReveal.js'

const mockObserve = vi.fn()
const mockUnobserve = vi.fn()
let intersectionCallback = null

global.IntersectionObserver = vi.fn((callback) => {
  intersectionCallback = callback
  return { observe: mockObserve, disconnect: vi.fn(), unobserve: mockUnobserve }
})

function createMockElement() {
  const el = document.createElement('div')
  el.classList.add('reveal-item')
  return el
}

describe('useScrollReveal', () => {
  beforeEach(() => {
    mockObserve.mockClear()
    mockUnobserve.mockClear()
    intersectionCallback = null
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

  it('adds reveal-item--visible when intersected', () => {
    const { register } = useScrollReveal()
    const el = createMockElement()
    register(el)
    intersectionCallback([{ isIntersecting: true, target: el }])
    expect(el.classList.contains('reveal-item--visible')).toBe(true)
  })

  it('unobserves after first intersection', () => {
    const { register } = useScrollReveal()
    const el = createMockElement()
    register(el)
    intersectionCallback([{ isIntersecting: true, target: el }])
    expect(mockUnobserve).toHaveBeenCalledWith(el)
  })

  it('sets animation-delay via register delay argument', () => {
    const { register } = useScrollReveal()
    const el = createMockElement()
    register(el, 100)
    expect(el.style.animationDelay).toBe('100ms')
  })

  it('handles null elements gracefully', () => {
    const { register } = useScrollReveal()
    expect(() => register(null)).not.toThrow()
    expect(() => register(undefined)).not.toThrow()
  })
})
