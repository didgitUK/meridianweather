import {
  PLACE_GUIDE_CATEGORY,
  PLACE_GUIDE_MIN_WORDS,
  PLACE_GUIDE_PROMPT_VERSION,
  PLACE_GUIDE_REQUIRED_H2,
} from '@/constants/place-content';

/**
 * Deterministic long-form guide used when PLACE_CONTENT_LLM_MODE=stub
 * or when no API key is configured in tests.
 * @param {Awaited<ReturnType<import('./build-place-context-pack').buildPlaceContextPack>>} pack
 */
export function buildStubPlaceGuide(pack) {
  const name = pack.place.name;
  const slug = pack.place.slug;
  const region = pack.place.adminArea || pack.place.country || 'the UK';
  const weatherLine = pack.weather?.description
    ? `Conditions look ${pack.weather.description} around ${pack.weather.temp ?? '—'}°C.`
    : 'Check the live Meridian forecast before you head out.';

  const poiLines = Object.entries(pack.pois || {})
    .flatMap(([category, items]) =>
      (items || []).slice(0, 4).map(
        (item) => `<li><strong>${escapeHtml(item.name)}</strong> (${escapeHtml(category)})</li>`,
      ),
    )
    .join('');

  const fillerParagraph = (topic) => {
    const chunks = [];
    while (chunks.join(' ').split(/\s+/).length < 280) {
      chunks.push(
        `${name} rewards a paced visit. Use the Meridian weather page for ${name} `
        + `(<a href="/weather/${slug}">/weather/${slug}</a>) so temperature, rain chance, `
        + `and wind stay aligned with your plans in ${region}. ${topic} matters when `
        + `choosing outdoor versus indoor options, and OpenStreetMap-listed venues nearby `
        + `give a grounded shortlist rather than invented attractions. Local rhythm, `
        + `coastal or inland microclimates, and weekend crowds all shift with the outlook. `
        + `Pack layers, confirm opening times on venue sites, and treat Wikipedia background `
        + `as orientation rather than a timetable. Returning visitors often re-check hourly `
        + `rain and gusts before committing to a pier walk, park picnic, or hillside trail.`,
      );
    }
    return `<p>${chunks.join(' ')}</p>`;
  };

  const sections = PLACE_GUIDE_REQUIRED_H2.map((heading) => {
    if (heading === 'Weather outlook') {
      return `<h2>${heading}</h2><p>${escapeHtml(weatherLine)}</p>${fillerParagraph('Weather timing')}`;
    }
    if (heading === 'Things to do') {
      return (
        `<h2>${heading}</h2>`
        + `<p>Nearby OpenStreetMap places for ${escapeHtml(name)} include:</p>`
        + (poiLines ? `<ul>${poiLines}</ul>` : '<p>Refresh Things to do on the place page for live OSM picks.</p>')
        + fillerParagraph('Choosing activities')
      );
    }
    if (heading === 'Getting around') {
      return `<h2>${heading}</h2>${fillerParagraph('Travel and access')}`;
    }
    return `<h2>${heading}</h2>${fillerParagraph('Practical preparation')}`;
  }).join('');

  let bodyHtml = sections;
  // Ensure minimum word count with an extra practical block if needed.
  while (bodyHtml.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length < PLACE_GUIDE_MIN_WORDS) {
    bodyHtml += fillerParagraph('Extra local planning detail');
  }

  const imageUrl =
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/United_Kingdom_relief_location_map.jpg/1280px-United_Kingdom_relief_location_map.jpg';

  return {
    title: `${name} weather weekend planner`,
    excerpt:
      `A Meridian guide to planning time in ${name} with the live forecast, `
      + 'OpenStreetMap things to do, and credited background sources.',
    category: PLACE_GUIDE_CATEGORY,
    bodyHtml,
    sources: pack.sources,
    imageUrl,
    imageCredit: 'Wikimedia Commons contributors',
    imageSourceUrl: 'https://commons.wikimedia.org/wiki/File:United_Kingdom_relief_location_map.jpg',
    model: 'stub',
    promptVersion: PLACE_GUIDE_PROMPT_VERSION,
    slug: 'weather-weekend-planner',
  };
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
