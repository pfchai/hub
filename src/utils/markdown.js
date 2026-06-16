import { marked } from 'marked'

/**
 * Render a markdown string to HTML.
 * Returns empty string for falsy input.
 */
export function renderMarkdown(text) {
  if (!text) return ''
  return marked.parse(text)
}
