/**
 * Minimal scroll-triggered reveal via IntersectionObserver.
 * Staggered delay via CSS animation-delay (no JS setTimeout).
 */
export function useScrollReveal() {
  if (typeof window === 'undefined' || !window.IntersectionObserver) {
    return { register: (el) => el?.classList.add('reveal-item--visible') }
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-item--visible')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1 }
  )

  return {
    register(el, delay = 0) {
      if (!el) return
      el.style.animationDelay = `${delay}ms`
      observer.observe(el)
    },
  }
}
