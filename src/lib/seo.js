import { BRAND, SOCIAL_LINKS } from '@/constants/brand';

const DEFAULT_SITE_URL = `https://${BRAND.domain}`;

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!configured) {
    return DEFAULT_SITE_URL;
  }

  return configured.replace(/\/$/, '');
}

export function absoluteUrl(path = '/') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}

export const ROBOTS_INDEX = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
  },
};

export const ROBOTS_NOINDEX = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
  },
};

export function buildPageTitle(title) {
  return title;
}

export function buildOpenGraph({
  title,
  description,
  path = '/',
  type = 'website',
  modifiedTime,
  locale = 'en_GB',
}) {
  return {
    type,
    locale,
    url: absoluteUrl(path),
    siteName: BRAND.name,
    title,
    description,
    ...(modifiedTime ? { modifiedTime } : {}),
  };
}

export function buildTwitterCard({ title, description }) {
  return {
    card: 'summary_large_image',
    title,
    description,
  };
}

export function buildCanonical(path = '/') {
  return {
    canonical: absoluteUrl(path),
  };
}

export function buildPageMetadata({
  title,
  description,
  path = '/',
  robots = ROBOTS_INDEX,
  modifiedTime,
  locale = 'en_GB',
  languages,
}) {
  const resolvedTitle = buildPageTitle(title);

  return {
    title: resolvedTitle,
    description,
    robots,
    alternates: {
      ...buildCanonical(path),
      ...(languages ? { languages } : {}),
    },
    openGraph: buildOpenGraph({
      title: resolvedTitle,
      description,
      path,
      modifiedTime,
      locale,
    }),
    twitter: buildTwitterCard({
      title: resolvedTitle,
      description,
    }),
  };
}

export const ROOT_METADATA = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${BRAND.name} — weather dashboard`,
    template: `%s — ${BRAND.name}`,
  },
  description: BRAND.description,
  applicationName: BRAND.name,
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: BRAND.name,
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: '/brand/favicon.png',
    apple: '/brand/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    siteName: BRAND.name,
    title: `${BRAND.name} — weather dashboard`,
    description: BRAND.description,
    url: getSiteUrl(),
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND.name} — weather dashboard`,
    description: BRAND.description,
  },
  alternates: {
    canonical: getSiteUrl(),
  },
};

export function buildOrganizationSchema() {
  const websiteLink = SOCIAL_LINKS.find((link) => link.id === 'website');
  const linkedInLink = SOCIAL_LINKS.find((link) => link.id === 'linkedin');

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BRAND.name,
    url: getSiteUrl(),
    logo: absoluteUrl('/brand/favicon.png'),
    description: BRAND.description,
    sameAs: [websiteLink?.href, linkedInLink?.href].filter(Boolean),
  };
}

export function buildWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BRAND.name,
    url: getSiteUrl(),
    description: BRAND.description,
    publisher: {
      '@type': 'Organization',
      name: BRAND.name,
      url: getSiteUrl(),
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${getSiteUrl()}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildBreadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildFaqSchema(faqItems) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function buildPlaceSchema(city) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: city.name,
    address: {
      '@type': 'PostalAddress',
      addressCountry: city.country,
      ...(city.state ? { addressRegion: city.state } : {}),
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: city.lat,
      longitude: city.lon,
    },
  };
}

export function buildCityWebPageSchema(city, path) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${city.name} weather forecast`,
    url: absoluteUrl(path),
    description: `Current conditions and forecast for ${city.name}.`,
    about: buildPlaceSchema(city),
    isPartOf: {
      '@type': 'WebSite',
      name: BRAND.name,
      url: getSiteUrl(),
    },
  };
}

export function excerptFromBody(body, maxLength = 160) {
  if (!body) {
    return BRAND.description;
  }

  if (body.length <= maxLength) {
    return body;
  }

  return `${body.slice(0, maxLength - 1).trimEnd()}…`;
}
