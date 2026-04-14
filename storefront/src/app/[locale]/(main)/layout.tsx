import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

import { Footer, Header } from '@/components/organisms';
import { BottomNavbar } from '@/components/cells';
import { TalkJsProvider } from '@/components/providers';
import { retrieveCustomer } from '@/lib/data/customer';

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

  const user = await retrieveCustomer().catch(() => null);
  const isLoggedIn = Boolean(user);

  if (!APP_ID || !user || !user.id || !user.email)
    return (
      <NextIntlClientProvider messages={messages}>
        <Header locale={locale} />
        <main className="overflow-x-hidden">
          {children}
        </main>
        <Footer />
        <BottomNavbar />
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
        <main className="overflow-x-hidden">
          {children}
        </main>
        <Footer />
        <BottomNavbar />
      </TalkJsProvider>
    </NextIntlClientProvider>
  );
}
