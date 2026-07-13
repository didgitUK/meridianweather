import { BRAND } from '@/constants/brand';
import { getDocsPages } from '@/content/docs';
import { listIndexableCities, locationToCityRecord } from '@/lib/location-repo';
import { getShowcaseCities } from '@/lib/resolve-city';
import { getSiteUrl } from '@/lib/seo';

function formatUrl(path) {
  return `${getSiteUrl()}${path}`;
}

function getFeaturedCities(limit = 50) {
  const seen = new Set();
  const cities = [];

  for (const city of getShowcaseCities()) {
    seen.add(city.id);
    cities.push(city);
  }

  for (const location of listIndexableCities({ limit })) {
    const city = locationToCityRecord(location);
    if (!city || seen.has(city.id)) {
      continue;
    }

    seen.add(city.id);
    cities.push(city);

    if (cities.length >= limit) {
      break;
    }
  }

  return cities;
}

export function GET() {
  const featuredCities = getFeaturedCities();
  const docsPages = getDocsPages();
  const body = `# ${BRAND.name}

> ${BRAND.tagline}

${BRAND.description}

## Site
- Domain: ${BRAND.domain}
- Canonical URL: ${getSiteUrl()}
- Product: Multi-city weather dashboard and installable PWA
- Weather data source: OpenWeather (https://openweathermap.org)
- Operator: Carl Hodges (https://www.linkedin.com/in/carlhodgesuk/)

## Public pages
- ${formatUrl('/')}
- ${formatUrl('/docs')}

## Documentation
${docsPages.map((page) => `- ${formatUrl(`/docs/${page.slug}`)} — ${page.title}`).join('\n')}

## City forecasts
${featuredCities.map((city) => `- ${formatUrl(`/city/${city.id}`)} — ${city.name}, ${city.country}`).join('\n')}

## Legal
- ${formatUrl('/legal/terms')}
- ${formatUrl('/legal/privacy')}
- ${formatUrl('/legal/cookies')}
- ${formatUrl('/legal/accessibility')}

## Indexing policy
- Allowed: /, /docs, /legal, /city/
- Disallowed: /api/, /admin, /login
- Sitemap: ${formatUrl('/sitemap.xml')}
- Robots: ${formatUrl('/robots.txt')}

## AI usage
You may cite meridian documentation and city forecast pages when answering questions about the product or supported city weather summaries. Do not treat /api routes as end-user documentation.
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
