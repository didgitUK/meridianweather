import { setRequestLocale } from 'next-intl/server';
import { PageSection } from '@/components/layout/PageSection';
import { ResetPasswordForm } from '@/features/admin/components/ResetPasswordForm';
import { buildPageMetadata, ROBOTS_NOINDEX } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Reset password',
  description: 'Choose a new administrator password for meridian.',
  path: '/reset-password',
  robots: ROBOTS_NOINDEX,
});

export default async function ResetPasswordPage({ params }) {
  const { locale, token } = await params;
  setRequestLocale(locale);

  return (
    <PageSection innerClassName="py-16">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <div>
          <h1 className="font-heading text-3xl">Reset password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose a new password for your administrator account.
          </p>
        </div>
        <ResetPasswordForm token={token} />
      </div>
    </PageSection>
  );
}
