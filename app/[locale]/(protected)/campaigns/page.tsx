import { redirect } from 'next/navigation'

interface CampaignsPageProps {
  params: Promise<{ locale: string }>
}

export default async function CampaignsPage({ params }: CampaignsPageProps) {
  const { locale } = await params
  redirect(`/${locale}/wiki`)
}
