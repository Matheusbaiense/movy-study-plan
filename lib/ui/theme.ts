/**
 * Movy design tokens for inline-style surfaces.
 *
 * The app renders most UI with inline styles. Import from here instead of
 * hardcoding hex/rgba so the palette, depth and rhythm stay consistent and
 * map 1:1 to the CSS variables in `app/globals.css` and `tailwind.config.ts`.
 *
 * Direction: "Editorial Movement" — the light counterpart of the deep-purple
 * login. Layered surfaces, purple-tinted depth, gold as the one bright accent.
 */

export const color = {
  purple: '#4B1A77',
  purpleMid: '#3A1560',
  purpleDeep: '#2A1153',
  purpleDeeper: '#190A38',
  gold: '#FBB615',
  goldSoft: '#FFC51C',
  orange: '#F36B1C',
  red: '#D23B2B',
  ink: '#1C1233',
  inkSoft: '#5A4E72',
  paper: '#F8F7FB',
  lilac: '#EFE9F6',
  lilac2: '#E6DCF3',
  line: '#E0D6EE',
  white: '#FFFFFF',
} as const

/** Ink tints — the workhorse text/border opacities used across the UI. */
export const ink = (a: number) => `rgba(28,18,51,${a})`
/** Purple tints — for accent fills and rings. */
export const purpleA = (a: number) => `rgba(75,26,119,${a})`

export const font = {
  /** Display + headlines — Outfit, geometric & confident, echoes the wordmark (Brand Guide p.19) */
  display: 'Outfit, system-ui, sans-serif',
  /** UI: buttons, nav, labels, table cells */
  ui: 'Outfit, system-ui, sans-serif',
  /** Reading / body copy — Manrope */
  body: 'Manrope, system-ui, sans-serif',
  /** Kickers, meta, hex codes, technical labels — Space Mono */
  mono: '"Space Mono", ui-monospace, monospace',
} as const

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
} as const

/** Editorial: structure comes from hairline borders, not soft shadow.
 *  Shadows reserved for genuine elevation (hover, overlays) only. */
export const shadow = {
  none: 'none',
  sm: '0 1px 2px rgba(42,17,83,0.05)',
  card: 'none',
  lift: '0 10px 28px -18px rgba(42,17,83,0.45)',
  inset: 'inset 0 1px 0 rgba(255,255,255,0.6)',
} as const

/** Role → brand colour, shared by sidebar, settings and badges. */
export const roleColor: Record<string, string> = {
  super_admin: color.red,
  admin: color.orange,
  editor: color.purple,
  reader: color.purpleDeep,
}

/** Accent ramp reused for area/department cards and category kickers. */
export const accentRamp = [
  color.purple,
  color.orange,
  color.gold,
  color.red,
  color.purpleDeep,
] as const
