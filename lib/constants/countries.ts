// ISO-3166 alpha-2 codes; names are resolved via Intl.DisplayNames (no dependency).
// The list is the full common set so the new-lead form can offer "any country".

export const COUNTRY_CODES: readonly string[] = [
  'AF','AL','DZ','AD','AO','AR','AM','AU','AT','AZ','BS','BH','BD','BB','BY','BE','BZ','BJ','BO','BA',
  'BW','BR','BN','BG','BF','BI','KH','CM','CA','CV','CF','TD','CL','CN','CO','KM','CG','CD','CR','CI',
  'HR','CU','CY','CZ','DK','DJ','DM','DO','EC','EG','SV','GQ','ER','EE','ET','FJ','FI','FR','GA','GM',
  'GE','DE','GH','GR','GD','GT','GN','GW','GY','HT','HN','HU','IS','IN','ID','IR','IQ','IE','IL','IT',
  'JM','JP','JO','KZ','KE','KI','KW','KG','LA','LV','LB','LS','LR','LY','LI','LT','LU','MG','MW','MY',
  'MV','ML','MT','MR','MU','MX','MD','MC','MN','ME','MA','MZ','MM','NA','NP','NL','NZ','NI','NE','NG',
  'KP','MK','NO','OM','PK','PA','PG','PY','PE','PH','PL','PT','QA','RO','RU','RW','KN','LC','VC','WS',
  'SM','ST','SA','SN','RS','SC','SL','SG','SK','SI','SB','SO','ZA','KR','SS','ES','LK','SD','SR','SE',
  'CH','SY','TW','TJ','TZ','TH','TL','TG','TO','TT','TN','TR','TM','TV','UG','UA','AE','GB','US','UY',
  'UZ','VU','VE','VN','YE','ZM','ZW',
]

// Sentinel: what Intl returns for a known-invalid code in English.
// Node 24 returns "Unknown Region" rather than throwing or returning undefined.
const _unknownEn = (() => {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of('ZZ') ?? ''
  } catch {
    return ''
  }
})()

/** Localized country name for an alpha-2 code; falls back to the upper-cased code. */
export function countryName(code: string, locale = 'pt-BR'): string {
  const upper = (code ?? '').toUpperCase()
  try {
    // Validate via English first: if Intl doesn't recognize the code it returns
    // the same "Unknown Region" sentinel regardless of locale.
    const enName = new Intl.DisplayNames(['en'], { type: 'region' }).of(upper)
    if (!enName || (_unknownEn && enName === _unknownEn)) return upper
    return new Intl.DisplayNames([locale], { type: 'region' }).of(upper) ?? upper
  } catch {
    return upper
  }
}

export interface CountryOption {
  code: string
  name: string
}

/** All countries as {code, name}, sorted by localized name. */
export function countryOptions(locale = 'pt-BR'): CountryOption[] {
  return COUNTRY_CODES.map((code) => ({ code, name: countryName(code, locale) })).sort((a, b) =>
    a.name.localeCompare(b.name, locale),
  )
}
