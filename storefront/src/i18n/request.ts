import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async ({ requestLocale }) => {
  const cookieStore = await cookies();
  const savedLocale = cookieStore.get('NEXT_LOCALE')?.value;
  
  let locale = savedLocale || await requestLocale || 'ar';
  
  if (locale !== 'ar' && locale !== 'en') {
    locale = 'ar';
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
