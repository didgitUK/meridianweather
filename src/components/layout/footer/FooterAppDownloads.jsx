import { FooterStoreBadge } from '@/components/layout/footer/FooterStoreBadge';
import { APP_STORE_LINKS } from '@/constants/brand';

export function FooterAppDownloads() {
  return (
    <div className="flex flex-wrap items-start gap-2">
      <FooterStoreBadge store="app-store" href={APP_STORE_LINKS.ios} disabled={!APP_STORE_LINKS.ios} />
      <FooterStoreBadge store="google-play" href={APP_STORE_LINKS.android} disabled={!APP_STORE_LINKS.android} />
    </div>
  );
}
