import type { CourseType, StudyCourse } from './types'

/** Row shape of the public.course_presets table (snake_case). */
export interface DbPreset {
  id: string
  type: CourseType
  provider: string
  name: string
  rate_per_week: number
  tuition: number
  enrolment_fee: number
  material_fee: number
  has_material: boolean
  scholarship: number
  timetable: string
  payment_parts: number
  payment_frequency: string
  deposit_weeks: number
  sort_order: number
  is_active: boolean
}

/** Same shape consumed by the editor's `applyPreset` (mirrors COURSE_PRESETS). */
export type PresetOption = Partial<StudyCourse> & Pick<StudyCourse, 'type' | 'provider' | 'name'>

export function dbPresetToOption(p: DbPreset): PresetOption {
  const base: PresetOption = {
    type: p.type,
    provider: p.provider,
    name: p.name,
    enrolmentFee: p.enrolment_fee,
    materialFee: p.material_fee,
    hasMaterial: p.has_material,
    scholarship: p.scholarship,
    timetable: p.timetable,
    paymentParts: p.payment_parts,
    paymentFrequency: p.payment_frequency,
    depositWeeks: p.deposit_weeks,
  }
  if (p.type === 'elicos') base.ratePerWeek = p.rate_per_week
  else base.tuition = p.tuition
  return base
}
