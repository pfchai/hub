/**
 * Dark Mode Color Contrast Checker
 *
 * Validates that all registered module accent colors meet WCAG AA contrast
 * ratio (≥4.5:1) against the dark mode background (#1a1815).
 *
 * Usage: node scripts/check-contrast.js
 * Exit codes: 0 = all pass, 1 = any fail
 *
 * No external dependencies — uses the standard WCAG relative luminance
 * formula.
 *
 * NOTE: Colors listed here must be kept in sync with `src/modules/registry.js`.
 * The registry uses `import.meta.env` (Vite-specific) so we can't import it
 * directly in a standalone Node script.
 *
 * @module scripts/check-contrast
 */

// ── Constants ──────────────────────────────────────────────────────

/** Dark mode `--bg-primary` from `src/styles/global.css` */
const DARK_BG = '#1a1815'

/** WCAG AA normal-text threshold */
const MIN_RATIO = 4.5

/**
 * Module accent colors — keep in sync with `src/modules/registry.js`.
 * Each entry: [id, color]
 * @type {Array<[string, string]>}
 */
const MODULE_COLORS = [
  ['curation', '#3b82f6'],
  ['sunset', '#e07b5a'],
]

// ── Helpers ────────────────────────────────────────────────────────

/**
 * Parse a 6-char hex color to { r, g, b } in 0-255 range.
 * @param {string} hex — e.g. "#2563eb"
 * @returns {{ r: number, g: number, b: number }}
 */
function parseHex(hex) {
  const val = parseInt(hex.slice(1), 16)
  return {
    r: (val >> 16) & 0xff,
    g: (val >> 8) & 0xff,
    b: val & 0xff,
  }
}

/**
 * Linearize an sRGB channel value (0-255) per WCAG 2.1.
 * @param {number} channel — 0-255
 * @returns {number} — linearized value
 */
function linearize(channel) {
  const srgb = channel / 255
  if (srgb <= 0.04045) {
    return srgb / 12.92
  }
  return Math.pow((srgb + 0.055) / 1.055, 2.4)
}

/**
 * Calculate WCAG relative luminance for a hex color.
 * @param {string} hex — e.g. "#1a1815"
 * @returns {number} — luminance value 0-1
 */
function relativeLuminance(hex) {
  const { r, g, b } = parseHex(hex)
  return (
    0.2126 * linearize(r) +
    0.7152 * linearize(g) +
    0.0722 * linearize(b)
  )
}

/**
 * Calculate contrast ratio between two hex colors per WCAG 2.1.
 * @param {string} hex1
 * @param {string} hex2
 * @returns {number} — contrast ratio (1-21)
 */
function contrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hex1)
  const l2 = relativeLuminance(hex2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

// ── Main ───────────────────────────────────────────────────────────

let allPass = true

for (const [id, color] of MODULE_COLORS) {
  // Validate the hex format first
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
    console.log(`  SKIP  ${id} — invalid color format "${color}"`)
    continue
  }

  const ratio = contrastRatio(color, DARK_BG)
  const pass = ratio >= MIN_RATIO
  const status = pass ? 'PASS' : 'FAIL'
  const padded = ratio.toFixed(2).padStart(5)

  console.log(`  ${status}  ${padded}:1  ${id}  (${color})`)

  if (!pass) {
    allPass = false
  }
}

console.log('') // blank line

if (allPass) {
  console.log(`✓ All module colors meet WCAG AA (≥${MIN_RATIO}:1) against dark bg ${DARK_BG}`)
  process.exit(0)
} else {
  console.log(`✗ Some module colors FAIL the WCAG AA (≥${MIN_RATIO}:1) check against dark bg ${DARK_BG}`)
  process.exit(1)
}
