import { describe, it, expect } from 'vitest'
import { formatStars } from '../utils/format.js'

describe('formatStars', () => {
  it('returns "0" for 0', () => {
    expect(formatStars(0)).toBe('0')
  })

  it('returns the number as string for values under 1000', () => {
    expect(formatStars(999)).toBe('999')
  })

  it('formats 1000 as "1k"', () => {
    expect(formatStars(1000)).toBe('1k')
  })

  it('formats 1500 as "1.5k"', () => {
    expect(formatStars(1500)).toBe('1.5k')
  })

  it('formats 50000 as "50k"', () => {
    expect(formatStars(50000)).toBe('50k')
  })

  it('strips trailing .0 (e.g. 5000 → "5k")', () => {
    expect(formatStars(5000)).toBe('5k')
  })
})
