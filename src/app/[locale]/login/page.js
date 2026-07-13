import { setRequestLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { PageSection } from '@/components/layout/PageSection';
import { LoginForm } from '@/features/admin/components/LoginForm';
import { isAdminSessionActive } from '@/lib/server/admin-auth';
import { buildPageMetadata, ROBOTS_NOINDEX } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Admin sign in',
  description: 'Private administrator sign-in for meridian.',
  path: '/login',
  robots: ROBOTS_NOINDEX,
});

export default async function LoginPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  if (await isAdminSessionActive()) {
    redirect({ href: '/admin', locale });
  }

  return (
    <PageSection innerClassName="py-16">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <div>
          <h1 className="font-heading text-3xl">Admin sign in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to manage weather API settings, AdSense, and platform limits.
          </p>
        </div>
        <LoginForm />
      </div>
    </PageSection>
  );
}
