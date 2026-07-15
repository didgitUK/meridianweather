import { setRequestLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { PageSection } from '@/components/layout/PageSection';
import { ForgotPasswordForm } from '@/features/admin/components/ForgotPasswordForm';
import { isAdminSessionActive } from '@/lib/server/admin-auth';
import { buildPageMetadata, ROBOTS_NOINDEX } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Forgot password',
  description: 'Request an administrator password reset for meridian.',
  path: '/forgot-password',
  robots: ROBOTS_NOINDEX,
});

export default async function ForgotPasswordPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  if (await isAdminSessionActive()) {
    redirect({ href: '/admin', locale });
  }

  return (
    <PageSection innerClassName="py-16">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <div>
          <h1 className="font-heading text-3xl">Forgot password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your admin email and we will send a reset link if an account exists.
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </PageSection>
  );
}
