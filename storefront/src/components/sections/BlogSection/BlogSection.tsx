import { BlogCard } from '@/components/organisms'
import { getTranslations } from 'next-intl/server'

export async function BlogSection() {
  const t = await getTranslations('blog')

  const blogPosts = [
    {
      id: 1,
      title: t('post1Title'),
      excerpt: t('post1Excerpt'),
      image: '/images/blog/post-1.jpg',
      category: t('categoryAccessories'),
      href: '#',
    },
    {
      id: 2,
      title: t('post2Title'),
      excerpt: t('post2Excerpt'),
      image: '/images/blog/post-2.jpg',
      category: t('categoryStyleGuide'),
      href: '#',
    },
    {
      id: 3,
      title: t('post3Title'),
      excerpt: t('post3Excerpt'),
      image: '/images/blog/post-3.jpg',
      category: t('categoryTrends'),
      href: '#',
    },
  ]

  return (
    <section className='bg-tertiary container'>
      <div className='flex items-center justify-between mb-12'>
        <h2 className='heading-lg text-tertiary'>{t('heading')}</h2>
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-3'>
        {blogPosts.map((post, index) => (
          <BlogCard key={post.id} index={index} post={post} />
        ))}
      </div>
    </section>
  )
}
