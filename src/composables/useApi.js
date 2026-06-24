/**
 * useApi — lightweight shared fetch utility
 *
 * Provides fetch with timeout and normalized error handling.
 * No sessionStorage cache (YAGNI for this scale — one API call per visit).
 *
 * @module composables/useApi
 */

/**
 * Normalized API error with machine-readable code.
 */
export class ApiError extends Error {
  /**
   * @param {string} code - Error code: 'timeout' | 'rate-limit' | 'parse' | 'network' | 'http'
   * @param {string} message - Human-readable description
   * @param {number} [status] - HTTP status code, if applicable
   */
  constructor(code, message, status) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

/**
 * Fetch a URL with timeout and JSON response parsing.
 *
 * @param {string} url - The URL to fetch
 * @param {Object} [options]
 * @param {number} [options.timeout=8000] - Timeout in milliseconds
 * @param {Object} [options.headers] - Additional request headers
 * @param {AbortSignal} [options.signal] - External abort signal
 * @returns {Promise<any>} Parsed JSON response
 * @throws {ApiError} On network, timeout, rate-limit, or parse failure
 *
 * @example
 * ```js
 * import { useApi } from '@/composables/useApi.js'
 * const data = await useApi('https://api.open-meteo.com/v1/forecast?...')
 * ```
 */
export async function useApi(url, options = {}) {
  const { timeout = 8000, headers = {}, signal: externalSignal } = options

  // Create an AbortController for timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  // Combine with external signal if provided
  const signal = externalSignal
    ? combineSignals(controller.signal, externalSignal)
    : controller.signal

  try {
    const response = await fetch(url, {
      headers: { ...headers },
      signal,
    })

    clearTimeout(timeoutId)

    if (response.status === 429) {
      throw new ApiError('rate-limit', 'API rate limit exceeded', 429)
    }

    if (!response.ok) {
      throw new ApiError('http', `HTTP ${response.status}: ${response.statusText}`, response.status)
    }

    const text = await response.text()

    try {
      return JSON.parse(text)
    } catch {
      throw new ApiError('parse', 'Response is not valid JSON')
    }
  } catch (err) {
    clearTimeout(timeoutId)

    if (err instanceof ApiError) throw err

    if (err.name === 'AbortError') {
      throw new ApiError('timeout', `Request timed out after ${timeout}ms`)
    }

    throw new ApiError('network', err.message || 'Network request failed')
  }
}

/**
 * Combine two AbortSignals into one.
 * Useful when you need both timeout and external cancellation.
 *
 * @param {AbortSignal} s1
 * @param {AbortSignal} s2
 * @returns {AbortSignal}
 */
function combineSignals(s1, s2) {
  const controller = new AbortController()

  const abort = () => controller.abort()
  s1.addEventListener('abort', abort)
  s2.addEventListener('abort', abort)

  return controller.signal
}
