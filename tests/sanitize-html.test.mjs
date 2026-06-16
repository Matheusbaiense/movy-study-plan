import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { sanitizeHtml, stripHtml, excerpt } from '../lib/security/sanitize-html.ts'

describe('sanitizeHtml — script removal', () => {
  it('removes <script> tag', () => {
    const out = sanitizeHtml('<p>ok</p><script>alert(1)</script>')
    assert.ok(!out.includes('<script'), `expected no <script>, got: ${out}`)
    assert.ok(out.includes('ok'), 'safe content preserved')
  })

  it('removes <script> with content', () => {
    const out = sanitizeHtml('<script type="text/javascript">document.cookie="x=1"</script>hello')
    assert.ok(!out.includes('<script'), `got: ${out}`)
    assert.ok(out.includes('hello'))
  })

  it('removes <iframe>', () => {
    const out = sanitizeHtml('<iframe src="https://evil.com"></iframe>')
    assert.ok(!out.includes('<iframe'), `got: ${out}`)
  })

  it('removes <object>', () => {
    const out = sanitizeHtml('<object data="evil.swf"></object>')
    assert.ok(!out.includes('<object'), `got: ${out}`)
  })
})

describe('sanitizeHtml — inline event handlers', () => {
  it('strips onerror attribute', () => {
    const out = sanitizeHtml('<img src="x" onerror="alert(1)">')
    assert.ok(!out.includes('onerror'), `got: ${out}`)
  })

  it('strips onclick attribute', () => {
    const out = sanitizeHtml('<div onclick="evil()">click</div>')
    assert.ok(!out.includes('onclick'), `got: ${out}`)
  })

  it('strips onload attribute', () => {
    const out = sanitizeHtml('<body onload="steal()">')
    assert.ok(!out.includes('onload'), `got: ${out}`)
  })
})

describe('sanitizeHtml — javascript: URLs', () => {
  it('neutralises javascript: href', () => {
    const out = sanitizeHtml('<a href="javascript:alert(1)">click</a>')
    assert.ok(!out.includes('javascript:alert'), `got: ${out}`)
  })

  it('preserves normal hrefs', () => {
    const out = sanitizeHtml('<a href="https://example.com">link</a>')
    assert.ok(out.includes('https://example.com'), `normal href removed: ${out}`)
  })
})

describe('sanitizeHtml — safe HTML passthrough', () => {
  it('preserves <b> and <i>', () => {
    const out = sanitizeHtml('<b>bold</b> and <i>italic</i>')
    assert.ok(out.includes('bold') && out.includes('italic'), `got: ${out}`)
  })

  it('preserves <a> with safe href', () => {
    const out = sanitizeHtml('<a href="https://movy.com.au">Movy</a>')
    assert.ok(out.includes('Movy'), `got: ${out}`)
  })

  it('preserves <ul>/<li>', () => {
    const out = sanitizeHtml('<ul><li>item</li></ul>')
    assert.ok(out.includes('item'), `got: ${out}`)
  })

  it('returns empty string for falsy input', () => {
    assert.equal(sanitizeHtml(''), '')
  })
})

describe('stripHtml', () => {
  it('removes all tags', () => {
    assert.equal(stripHtml('<p>Hello <b>world</b></p>'), 'Hello world')
  })

  it('returns plain text unchanged', () => {
    assert.equal(stripHtml('plain text'), 'plain text')
  })
})

describe('excerpt', () => {
  it('truncates long text', () => {
    const long = 'a'.repeat(300)
    const out = excerpt(`<p>${long}</p>`, 200)
    assert.ok(out.length <= 204, `too long: ${out.length}`)
    assert.ok(out.endsWith('…'), `missing ellipsis: ${out}`)
  })

  it('returns full text if within limit', () => {
    assert.equal(excerpt('<p>Short</p>', 200), 'Short')
  })
})
