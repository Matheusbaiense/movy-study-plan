import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        background: '#7C3AED',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '6px',
      }}
    >
      <span
        style={{
          color: '#ffffff',
          fontSize: 20,
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: '-0.5px',
        }}
      >
        M
      </span>
    </div>,
    { ...size },
  )
}
