import { getUser } from '@/lib/auth/get-user'
import { FinancialCalculator } from '@/components/financial/FinancialCalculator'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function FinancialPage({ params }: Props) {
  const { locale } = await params
  await getUser(locale)
  return <FinancialCalculator />
}
