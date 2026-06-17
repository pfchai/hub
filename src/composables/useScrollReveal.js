import { getCurrentInstance, onUnmounted } from 'vue'

/**
 * Scroll reveal composable using IntersectionObserver.
 *
 * Created for staggered reveal of card grid items.
 * Returns a `register` function to use as a template ref callback
 * in v-for loops.
 *
 * @param {object} [options]
 * @param {boolean} [options.once=true] - Only reveal on first scroll
 * @returns {{ register: (el: Element|null, delay?: number) => void }}
 */
export function useScrollReveal(options = {}) {
  const { once = true } = options

  // Respect prefers-reduced-motion
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion) {
    // Return a no-op register that immediately reveals
    return {
      register(el) {
        if (el) {
          el.classList.add('reveal-item--visible')
          el.classList.remove('reveal-item')
        }
      },
    }
  }

  if (typeof window === 'undefined' || !window.IntersectionObserver) {
    return {
      register(el) {
        if (el) {
          el.classList.add('reveal-item--visible')
          el.classList.remove('reveal-item')
        }
      },
    }
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.revealDelay || '0', 10)

          if (delay > 0) {
            setTimeout(() => {
              entry.target.classList.add('reveal-item--visible')
              entry.target.classList.remove('reveal-item')
            }, delay)
          } else {
            entry.target.classList.add('reveal-item--visible')
            entry.target.classList.remove('reveal-item')
          }

          if (once) {
            observer.unobserve(entry.target)
          }
        } else if (!once) {
          entry.target.classList.remove('reveal-item--visible')
          entry.target.classList.add('reveal-item')
        }
      }
    },
    { threshold: 0.1 }
  )

  /**
   * Register an element for scroll reveal observation.
   * Use as a template ref callback: `:ref="(el) => register(el, index * 50)"`
   *
   * @param {Element|null} el
   * @param {number} [delay=0] - Delay in ms before revealing
   */
  function register(el, delay = 0) {
    if (!el) return
    el.dataset.revealDelay = String(delay)
    observer.observe(el)
  }

  // Only register lifecycle hook when inside a component setup context
  if (getCurrentInstance()) {
    onUnmounted(() => {
      observer.disconnect()
    })
  }

  return { register }
}
