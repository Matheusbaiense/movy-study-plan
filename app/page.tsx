import { redirect } from 'next/navigation'

interface RootPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function RootPage({ searchParams }: RootPageProps) {
  const params = (await searchParams) ?? {}
  const code = typeof params.code === 'string' ? params.code : null

  if (code) {
    const locale = typeof params.locale === 'string' ? params.locale : 'pt'
    const callbackParams = new URLSearchParams({
      code,
      locale,
    })

    redirect(`/auth/callback?${callbackParams.toString()}`)
  }

  redirect('/en/home')
}
