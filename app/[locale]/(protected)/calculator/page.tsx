import { getUser } from '@/lib/auth/get-user'
import { CourseCalculator } from '@/components/calculator/CourseCalculator'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function CalculatorPage({ params }: Props) {
  const { locale } = await params
  await getUser(locale)
  return <CourseCalculator locale={locale} />
}
