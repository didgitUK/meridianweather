import { setRequestLocale } from 'next-intl/server';
import { PageSection } from '@/components/layout/PageSection';
import { AcceptInviteForm } from '@/features/admin/components/AcceptInviteForm';
import { buildPageMetadata, ROBOTS_NOINDEX } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Accept admin invite',
  description: 'Accept an invitation to administer meridian.',
  path: '/invite',
  robots: ROBOTS_NOINDEX,
});

export default async function InvitePage({ params }) {
  const { locale, token } = await params;
  setRequestLocale(locale);

  return (
    <PageSection innerClassName="py-16">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <div>
          <h1 className="font-heading text-3xl">Accept admin invite</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose a password to finish creating your administrator account.
          </p>
        </div>
        <AcceptInviteForm token={token} />
      </div>
    </PageSection>
  );
}
