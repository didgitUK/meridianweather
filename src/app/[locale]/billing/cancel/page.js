import { Link } from '@/i18n/navigation';
import { PageSection } from '@/components/layout/PageSection';

export default function BillingCancelPage() {
  return (
    <PageSection>
      <div className="mx-auto max-w-lg py-12 text-center">
        <h1 className="font-heading text-2xl">Checkout cancelled</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No charge was made. You can remove ads anytime from Settings.
        </p>
        <Link href="/" className="mt-6 inline-block text-sm font-medium underline-offset-4 hover:underline">
          Back to home
        </Link>
      </div>
    </PageSection>
  );
}
