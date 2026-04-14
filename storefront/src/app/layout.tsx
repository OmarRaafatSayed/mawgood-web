import type { Metadata } from 'next';
import { Tajawal, Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';

import './globals.css';
import './rtl.css';

import { Toaster } from '@medusajs/ui';
import Head from 'next/head';

import { HtmlLangSetter } from '@/components/atoms/HtmlLangSetter/HtmlLangSetter';
import { retrieveCart } from '@/lib/data/cart';

import { Providers } from './providers';

const tajawal = Tajawal({
  variable: '--font-tajawal',
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '700', '800'],
  display: 'swap'
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap'
});

export const metadata: Metadata = {
  title: {
    template: `%s | ${
      process.env.NEXT_PUBLIC_SITE_NAME || 'Mawgood - موجود'
    }`,
    default: process.env.NEXT_PUBLIC_SITE_NAME || 'Mawgood - موجود'
  },
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'موقع الكتروني يضم كل المنتجات المحليه المصريه والعربيه - Egyptian and Arab local products marketplace',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  alternates: {
    languages: {
      'x-default': process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    }
  }
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cart = await retrieveCart();
  const locale = await getLocale();
  const messages = await getMessages();

  const ALGOLIA_APP = process.env.NEXT_PUBLIC_ALGOLIA_ID;
  const htmlLang = locale || 'ar';

  return (
    <html
      lang={htmlLang}
      dir={htmlLang === 'ar' ? 'rtl' : 'ltr'}
      className=""
    >
      <Head>
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://fonts.gstatic.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://i.imgur.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://i.imgur.com"
        />
        {ALGOLIA_APP && (
          <>
            <link
              rel="preconnect"
              href="https://algolia.net"
              crossOrigin="anonymous"
            />
            <link
              rel="preconnect"
              href="https://algolianet.com"
              crossOrigin="anonymous"
            />
            <link
              rel="dns-prefetch"
              href="https://algolia.net"
            />
            <link
              rel="dns-prefetch"
              href="https://algolianet.com"
            />
          </>
        )}
        {/* Image origins for faster LCP */}
        <link
          rel="preconnect"
          href="https://medusa-public-images.s3.eu-west-1.amazonaws.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://medusa-public-images.s3.eu-west-1.amazonaws.com"
        />
        <link
          rel="preconnect"
          href="https://mercur-connect.s3.eu-central-1.amazonaws.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://mercur-connect.s3.eu-central-1.amazonaws.com"
        />
        <link
          rel="preconnect"
          href="https://s3.eu-central-1.amazonaws.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://s3.eu-central-1.amazonaws.com"
        />
        <link
          rel="preconnect"
          href="https://api.mercurjs.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://api.mercurjs.com"
        />
      </Head>
      <body className={`${tajawal.variable} ${inter.variable} font-sans relative bg-primary text-secondary antialiased overflow-x-hidden`}>
        <NextIntlClientProvider messages={messages}>
          <HtmlLangSetter />
          <Providers cart={cart}>{children}</Providers>
          <Toaster 
            position="top-right" 
            className="!max-w-[90vw] sm:!max-w-md"
            toastOptions={{
              className: '!max-w-full break-words',
              style: {
                maxWidth: '100%',
                wordBreak: 'break-word'
              }
            }}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
