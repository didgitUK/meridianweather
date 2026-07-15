/**
 * Filter vehicle/doc/crest subjects and prefer scenic city views for dashboard heroes.
 */

const SUBJECT_REJECT_PATTERNS = Object.freeze([
  /\bmercedes\b/,
  /\bbus(?:es)?\b/,
  /\bautobus\b/,
  /\btrolleybus\b/,
  /\bomnibus\b/,
  /\btram(way|s)?\b/,
  /\blocomo(tive|tiv)\b/,
  /\bfreight\b/,
  /\btruck\b/,
  /\blorry\b/,
  /\bautomobile\b/,
  /\bcoat of arms\b/,
  /\bheraldic\b/,
  /\bemblem\b/,
  /\bseal of\b/,
  /\bflag of\b/,
  /\bnational flag\b/,
  /\blocator map\b/,
  /\blocation map\b/,
  /\bstreet map\b/,
  /\bdiagram\b/,
  /\bschematic\b/,
  /\bfloor plan\b/,
  /\blogotype?\b/,
  /\bwordmark\b/,
  /\bsignature\b/,
  /\bpostage stamp\b/,
  /\bqr code\b/,
  /\bsvg\b/,
  /\b.+\.svg\b/,
]);

const SUBJECT_BOOST_PATTERNS = Object.freeze([
  [/\bskyline\b/, 5],
  [/\bcityscape\b/, 5],
  [/\bpanorama\b/, 4],
  [/\baerial\b/, 3],
  [/\bold town\b/, 3],
  [/\bstare miasto\b/, 3],
  [/\bwaterfront\b/, 3],
  [/\briverside\b/, 3],
  [/\bharbour\b/, 2],
  [/\bharbor\b/, 2],
  [/\bplaza\b/, 2],
  [/\bmarket square\b/, 3],
  [/\brynek\b/, 2],
  [/\bdusk\b/, 2],
  [/\bsunset\b/, 2],
  [/\bsunrise\b/, 2],
  [/\bevening view\b/, 3],
  [/\bview of\b/, 2],
  [/\bcathedral\b/, 1],
  [/\bbridge\b/, 1],
]);

/**
 * @param {string} haystack lowercase caption/title blob
 */
export function photoConflictsHeroSubject(haystack) {
  if (!haystack) {
    return false;
  }

  return SUBJECT_REJECT_PATTERNS.some((pattern) => pattern.test(haystack));
}

/**
 * @param {string} haystack lowercase caption/title blob
 */
export function scoreHeroSubjectBonus(haystack) {
  if (!haystack) {
    return 0;
  }

  let bonus = 0;
  for (const [pattern, weight] of SUBJECT_BOOST_PATTERNS) {
    if (pattern.test(haystack)) {
      bonus += weight;
    }
  }

  return bonus;
}
