import { Fraunces, DM_Sans } from 'next/font/google';
import './globals.css';
import { ROOT_METADATA } from '@/lib/seo';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();

export const metadata = {
  ...ROOT_METADATA,
  ...(googleSiteVerification
    ? { verification: { google: googleSiteVerification } }
    : {}),
};

export default function RootLayout({ children }) {
  return (
    <html
      className={`${fraunces.variable} ${dmSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://openweathermap.org" />
      </head>
      <body className="flex min-h-full flex-col text-base leading-normal">{children}</body>
    </html>
  );
}
