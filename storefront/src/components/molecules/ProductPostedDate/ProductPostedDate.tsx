import { formatDistanceToNow } from 'date-fns'
import { getTranslations } from 'next-intl/server'

export const ProductPostedDate = async ({ posted }: { posted: string | null }) => {
  const t = await getTranslations('product')
  const postedDate = formatDistanceToNow(new Date(posted || ''), { addSuffix: true })

  return (
    <p className='label-md text-secondary'>
      {t('postedDate')}: {postedDate}
    </p>
  )
}
