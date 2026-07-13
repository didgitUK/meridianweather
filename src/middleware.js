import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import { routing } from '@/i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request) {
  const host = request.headers.get('host') ?? '';
  const { pathname } = request.nextUrl;

  if (host.startsWith('docs.localhost')) {
    if (!pathname.startsWith('/docs') && !pathname.startsWith('/en/docs')) {
      const url = request.nextUrl.clone();
      url.pathname = pathname === '/' ? '/docs' : `/docs${pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  if (
    pathname.startsWith('/api/')
    || pathname.startsWith('/weather-icons/')
    || pathname.startsWith('/hero/')
    || pathname.startsWith('/ads/')
    || pathname === '/ads.txt'
    || pathname === '/llms.txt'
    || pathname === '/robots.txt'
    || pathname === '/sitemap.xml'
  ) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|brand/|weather-icons/|hero/|ads/).*)'],
};
