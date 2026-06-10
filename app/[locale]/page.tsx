import { redirect } from 'next/navigation'

interface Props {
  params: { locale: string }
}

export default function LocaleRoot({ params }: Props) {
  redirect(`/${params.locale}/home`)
}
