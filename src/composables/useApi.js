/**
 * Minimal fetch wrapper with timeout and JSON parsing.
 * Only used by useWeather.js — tuned for Open-Meteo API calls.
 */
export async function useApi(url, options = {}) {
  const { timeout = 8000, headers = {} } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      headers,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (response.status === 429) {
      const err = new Error('API rate limit exceeded')
      err.code = 'rate-limit'; err.status = 429
      throw err
    }
    if (!response.ok) {
      const err = new Error(`HTTP ${response.status}: ${response.statusText}`)
      err.code = 'http'; err.status = response.status
      throw err
    }

    const text = await response.text()
    try {
      return JSON.parse(text)
    } catch {
      const err = new Error('Response is not valid JSON')
      err.code = 'parse'
      throw err
    }
  } catch (err) {
    clearTimeout(timeoutId)
    // DOMException has a numeric `code` (e.g. 20 = ABORT_ERR); our custom
    // errors use string codes ('timeout', 'parse', etc.) — only re-throw ours.
    if (typeof err.code === 'string') throw err
    const e = new Error(`Request timed out after ${timeout}ms`)
    e.code = 'timeout'; e.name = 'TimeoutError'
    throw e
  }
}
