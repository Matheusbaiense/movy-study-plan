// Generates public/favicon.ico, favicon.png, icon-192.png, icon-512.png
// No external dependencies — uses only built-in Node.js modules.
const zlib = require('zlib')
const fs = require('fs')

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
  return c
})

function crc32(buf) {
  let c = 0xFFFFFFFF
  for (const b of buf) c = crcTable[(c ^ b) & 0xFF] ^ (c >>> 8)
  return (c ^ 0xFFFFFFFF) >>> 0
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const tb = Buffer.from(type)
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([tb, data])))
  return Buffer.concat([len, tb, data, crcBuf])
}

function makePNG(pixels, w, h) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0)
  ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8  // bit depth
  ihdr[9] = 2  // RGB color type

  const rowBytes = w * 3 + 1
  const raw = Buffer.alloc(h * rowBytes)
  for (let y = 0; y < h; y++) {
    raw[y * rowBytes] = 0 // filter: none
    for (let x = 0; x < w; x++) {
      const p = pixels[y * w + x]
      const off = y * rowBytes + 1 + x * 3
      raw[off] = p.r; raw[off + 1] = p.g; raw[off + 2] = p.b
    }
  }

  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', zlib.deflateSync(raw)),
    makeChunk('IEND', Buffer.alloc(0)),
  ])
}

const BG = { r: 124, g: 58, b: 237 }  // #7C3AED purple
const FG = { r: 255, g: 255, b: 255 } // white

// 7-col x 9-row pixel-art M (1 = white, 0 = purple)
const M_PATTERN = [
  [1, 0, 0, 0, 0, 0, 1],
  [1, 1, 0, 0, 0, 1, 1],
  [1, 1, 1, 0, 1, 1, 1],
  [1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 1, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 1],
]
const MW = 7, MH = 9

function makeIcon(size) {
  const pixels = Array.from({ length: size * size }, () => ({ ...BG }))

  const targetW = Math.floor(size * 0.62)
  const targetH = Math.floor(targetW * MH / MW)
  const offsetX = Math.floor((size - targetW) / 2)
  const offsetY = Math.floor((size - targetH) / 2)

  for (let my = 0; my < MH; my++) {
    for (let mx = 0; mx < MW; mx++) {
      if (!M_PATTERN[my][mx]) continue
      const x0 = Math.floor(mx * targetW / MW)
      const x1 = Math.floor((mx + 1) * targetW / MW)
      const y0 = Math.floor(my * targetH / MH)
      const y1 = Math.floor((my + 1) * targetH / MH)
      for (let py = y0; py < y1; py++) {
        for (let px = x0; px < x1; px++) {
          const ix = offsetX + px
          const iy = offsetY + py
          if (ix >= 0 && ix < size && iy >= 0 && iy < size) {
            pixels[iy * size + ix] = { ...FG }
          }
        }
      }
    }
  }

  return makePNG(pixels, size, size)
}

function makeICO(pngData) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2) // ICO
  header.writeUInt16LE(1, 4) // 1 image

  const dir = Buffer.alloc(16)
  dir[0] = 16; dir[1] = 16 // 16x16
  dir.writeUInt16LE(1, 4)   // planes
  dir.writeUInt16LE(32, 6)  // bits
  dir.writeUInt32LE(pngData.length, 8)
  dir.writeUInt32LE(22, 12) // offset after header+dir

  return Buffer.concat([header, dir, pngData])
}

fs.mkdirSync('public', { recursive: true })

const png16 = makeIcon(16)
const png32 = makeIcon(32)
const png192 = makeIcon(192)
const png512 = makeIcon(512)

fs.writeFileSync('public/favicon.ico', makeICO(png16))
fs.writeFileSync('public/favicon.png', png32)
fs.writeFileSync('public/icon-192.png', png192)
fs.writeFileSync('public/icon-512.png', png512)

console.log('Icons generated: favicon.ico, favicon.png, icon-192.png, icon-512.png')
