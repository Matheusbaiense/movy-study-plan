// Server-safe HTML sanitizer.
//
// We prefer DOMPurify (strong, spec-aware sanitization), but load it lazily
// inside a try/catch. `isomorphic-dompurify` pulls in jsdom, which can fail to
// evaluate in some serverless runtimes — a top-level import would then crash
// the whole route (HTTP 500) before any handler runs. Loading it lazily lets us
// fall back to a dependency-free regex sanitizer instead of throwing.
//
// Content here is authored by editors / imported from internal sources, so the
// regex fallback (strip dangerous elements + inline handlers) is an acceptable
// safety net.

const FORBID_TAGS = ['script', 'style', 'iframe', 'object', 'embed', 'form']
const FORBID_ATTR = ['onerror', 'onclick', 'onload', 'onmouseover', 'onfocus']

type Sanitizer = (html: string) => string

let cachedPurify: Sanitizer | null | undefined

function getPurify(): Sanitizer | null {
  if (cachedPurify !== undefined) return cachedPurify
  try {
    const mod = require('isomorphic-dompurify')
    const DOMPurify = (mod?.default ?? mod) as { sanitize: (html: string, opts?: unknown) => string }
    if (!DOMPurify || typeof DOMPurify.sanitize !== 'function') throw new Error('DOMPurify unavailable')
    cachedPurify = (html: string) =>
      DOMPurify.sanitize(html, { FORBID_TAGS, FORBID_ATTR, ALLOW_DATA_ATTR: false })
  } catch {
    cachedPurify = null
  }
  return cachedPurify
}

function regexSanitize(html: string): string {
  return html
    // Drop dangerous element blocks (open → close), including their content.
    .replace(/<\s*(script|style|iframe|object|embed|form)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    // Drop any leftover standalone/self-closing dangerous tags.
    .replace(/<\s*\/?\s*(script|style|iframe|object|embed|form)\b[^>]*>/gi, '')
    // Strip inline event handlers: onclick="...", onload='...', onerror=foo.
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    // Neutralise javascript: URLs in href/src.
    .replace(/(\b(?:href|src)\s*=\s*)(["'])\s*javascript:[^"']*\2/gi, '$1$2#$2')
}

export function sanitizeHtml(html: string): string {
  if (!html) return ''
  const purify = getPurify()
  if (purify) {
    try {
      return purify(html)
    } catch {
      // Fall through to the regex sanitizer below.
    }
  }
  return regexSanitize(html)
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

export function excerpt(html: string, maxLength = 200): string {
  const text = stripHtml(html)
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}
