/** The Movy sail mark. Uses the global defs from <BrandDefs />. */
export function MovyMark({
  size = 36,
  variant = 'color',
  color,
}: {
  size?: number
  variant?: 'color' | 'mono'
  color?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      aria-hidden
      style={{ display: 'block', overflow: 'visible', ...(color ? { color } : null) }}
    >
      <use href={variant === 'mono' ? '#movySymMono' : '#movySymColor'} />
    </svg>
  )
}

/** Full lockup: sail mark + MOVY wordmark + EDUCATION descriptor. */
export function MovyLockup({
  size = 34,
  theme = 'light',
  descriptor = true,
  monoMark = false,
}: {
  size?: number
  theme?: 'light' | 'dark'
  descriptor?: boolean
  monoMark?: boolean
}) {
  const nameColor = theme === 'dark' ? '#FFFFFF' : '#4B1A77'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <MovyMark size={size} variant={monoMark ? 'mono' : 'color'} color={monoMark ? nameColor : undefined} />
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 0.84 }}>
        <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: Math.round(size * 0.6), letterSpacing: '-0.01em', color: nameColor }}>
          MOVY
        </span>
        {descriptor && (
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: Math.max(8, Math.round(size * 0.2)), letterSpacing: '0.42em', color: '#FBB615', marginTop: 4 }}>
            EDUCATION
          </span>
        )}
      </div>
    </div>
  )
}
