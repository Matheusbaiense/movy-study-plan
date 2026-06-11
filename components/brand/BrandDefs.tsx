/**
 * Movy mark definitions — the "sail in motion" (Brand Guide 2026, p.12–13).
 * Rendered once at the app root; consumed via <use href="#movySymColor|Mono">.
 * Two sails: the purple wing grounds, the golden sail carries the energy.
 */
export function BrandDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
      <defs>
        <linearGradient id="movySail" x1="0.4" y1="0" x2="0.55" y2="1">
          <stop offset="0" stopColor="#FFC51C" />
          <stop offset="0.55" stopColor="#FBA81A" />
          <stop offset="1" stopColor="#F2641A" />
        </linearGradient>
        <linearGradient id="movyWing" x1="0" y1="0" x2="1" y2="0.6">
          <stop offset="0" stopColor="#371457" />
          <stop offset="0.75" stopColor="#4E1A7D" />
          <stop offset="1" stopColor="#7A1E7E" />
        </linearGradient>
        <g id="movySymColor">
          <path d="M25 49 L64 48 L78 89 Z" fill="url(#movyWing)" stroke="url(#movyWing)" strokeWidth="5" strokeLinejoin="round" />
          <path d="M95 32 L66 56 L78 89 Z" fill="url(#movySail)" stroke="url(#movySail)" strokeWidth="5" strokeLinejoin="round" />
        </g>
        <g id="movySymMono">
          <path d="M25 49 L64 48 L78 89 Z" fill="currentColor" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
          <path d="M95 32 L66 56 L78 89 Z" fill="currentColor" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
        </g>
      </defs>
    </svg>
  )
}
