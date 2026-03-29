import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

import { Footer, Header } from '@/components/organisms';
import { BottomNavbar } from '@/components/cells';
import { TalkJsProvider } from '@/components/providers';
import { retrieveCustomer } from '@/lib/data/customer';
import { retrieveCart } from '@/lib/data/cart';
import { getUserWishlists } from '@/lib/data/wishlist';
import { Wishlist } from '@/types/wishlist';

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const APP_ID = process.env.NEXT_PUBLIC_TALKJS_APP_ID;
  const { locale } = await params;
  const messages = await getMessages();

  const user = await retrieveCustomer();
  const isLoggedIn = Boolean(user)
  
  let cart = null
  let cartItemsCount = 0
  try {
    cart = await retrieveCart()
    cartItemsCount = cart?.items?.length || 0
  } catch (e) {
    // cart might not exist
  }
  
  let wishlistCount = 0
  if (user) {
    try {
      const wishlist: Wishlist = await getUserWishlists({countryCode: locale})
      wishlistCount = wishlist?.products?.length || 0
    } catch (e) {
      // wishlist might not exist
    }
  }

  if (!APP_ID || !user || !user.id || !user.email)
    return (
      <NextIntlClientProvider messages={messages}>
        <Header locale={locale} />
        <main>
          {children}
        </main>
        <BottomNavbar 
          isLoggedIn={isLoggedIn} 
          cartItemsCount={cartItemsCount}
          wishlistCount={wishlistCount}
        />
        <Footer />
      </NextIntlClientProvider>
    );

  const userName = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'User';

  return (
    <NextIntlClientProvider messages={messages}>
      <TalkJsProvider
        appId={APP_ID}
        userId={user.id}
        userName={userName}
        userEmail={user.email}
      >
        <Header locale={locale} />
        <main>
          {children}
        </main>
        <BottomNavbar 
          isLoggedIn={isLoggedIn} 
          cartItemsCount={cartItemsCount}
          wishlistCount={wishlistCount}
        />
        <Footer />
      </TalkJsProvider>
    </NextIntlClientProvider>
  );
}
