/**
 * Hand-written regional blurbs for hot UK place pages.
 * Used instead of keyword-stuffed SEO bridge copy.
 */

export const PLACE_EDITORIAL_BLURBS = Object.freeze({
  london:
    'London’s weather is famously changeable: river-basin humidity, urban heat, and Atlantic fronts that can turn a bright lunchtime into a wet commute. Use the live strip below for showers and gusts before you commit to parks, the Thames Path, or an evening walk.',
  birmingham:
    'Birmingham sits inland on the West Midlands plateau, so mornings can stay cooler in valleys while the city centre warms faster. Watch wind and rain timing if you are crossing between Bullring, canals, and outlying suburbs.',
  glasgow:
    'Glasgow’s Atlantic exposure means wet spells arrive quickly, but clear breaks are common between systems. Check hourly rain and wind before riverside walks or a trip out toward the west coast.',
  manchester:
    'Manchester’s weather often feels breezier and wetter than maps suggest, with showers drifting in from the west. Use hourly rain chance for outdoor markets, football travel, and evening plans across the city and Salford.',
  edinburgh:
    'Edinburgh’s ridges and coast create sharp local differences — the Old Town can feel colder and windier than sheltered courtyards. Gusts and haar (sea fog) matter as much as temperature for castle walks and day trips to the Forth.',
  leeds:
    'Leeds sits on the eastern side of the Pennines, so western rain can arrive moderated — or dump when fronts stall. Check wind and showers before heading out toward Roundhay, the waterfront, or a drive over the hills.',
  liverpool:
    'Liverpool’s waterfront weather is shaped by the Mersey and Irish Sea air: cooler breezes, sudden showers, and clearer evenings after fronts pass. Gusts matter for ferry decks and open promenades.',
  bristol:
    'Bristol’s hills and harbour create microclimates — Clifton can feel breezier than the city centre. Watch rain timing for harbour walks and trips toward the Avon Gorge.',
  sheffield:
    'Sheffield climbs quickly from the Don valley into Peak District foothills, so temperatures and wind can differ street by street. Check gusts and showers before moorland walks or evening plans in the city.',
  croydon:
    'Croydon sits south of the Thames basin with a mix of suburban warmth and exposed higher ground. Use hourly rain and wind for commuting and outdoor plans toward Crystal Palace or the Downs.',
  cardiff:
    'Cardiff’s weather mixes Bristol Channel moisture with shelter from inland hills. Coastal breezes and shower timing matter for Bay walks and trips into the Valleys.',
  leicester:
    'Leicester’s inland Midlands setting often means cooler nights and convective showers in summer. Check the next few hours before parks, markets, and travel across the city.',
  bradford:
    'Bradford sits on Yorkshire’s western slopes where Pennine weather arrives early. Wind and drizzle can persist even when lower Aire valley towns look clearer — check hourly detail before outdoor plans.',
  coventry:
    'Coventry’s central England location brings continental swings: warm spells, sharp showers, and cooler nights. Use the hourly strip for outdoor events and travel across Warwickshire.',
  belfast:
    'Belfast’s weather is Atlantic-led: frequent showers, soft light, and coastal breezes up Belfast Lough. Gusts and rain timing matter for waterfront walks and day trips toward the coast.',
  nottingham:
    'Nottingham sits in the Trent valley with relatively sheltered air, but showers still track in from the west. Check short-range rain before parks, cave visits, and evening plans.',
  'newcastle-upon-tyne':
    'Newcastle and the Tyne corridor feel North Sea influence — cooler onshore breezes, sharp showers, and clearer spells after fronts. Gusts matter on bridges and quayside walks.',
  southampton:
    'Southampton’s weather is shaped by the Solent: milder winters, sea breezes, and showers that can skirt or soak the waterfront. Check wind for ferry and harbour plans.',
  brighton:
    'Brighton’s south-coast weather swings with Channel fronts — bright and breezy one hour, showery the next. Gusts and UV on the promenade matter as much as temperature.',
  plymouth:
    'Plymouth’s maritime climate keeps winters milder and summers tempered, with frequent Atlantic showers. Check wind and rain before Hoe walks, ferry crossings, and coastal paths.',
  portsmouth:
    'Portsmouth’s island and harbour setting means sea breezes, salt air, and showers that arrive quickly across the Solent. Check gusts before waterfront and ferry plans.',
  derby:
    'Derby sits in the Derwent valley with shelter from surrounding hills, so fog and cool mornings can linger. Showers still push in from the west — check hourly rain before outdoor plans.',
  'stoke-on-trent':
    'Stoke-on-Trent’s pottery towns sit in a rolling Midlands basin where drizzle can hang in valleys. Wind and rain timing matter for outdoor markets and trips toward the Peak District.',
  stockport:
    'Stockport sits where Greater Manchester meets the foothills, so western rain often arrives early. Check showers and gusts before Merseyway plans or trips toward the Peak District.',
  harrow:
    'Harrow’s north-west London ridges can feel breezier and cooler than central London. Use hourly rain for commuting and outdoor plans toward the hills.',
  bromley:
    'Bromley sits on London’s south-eastern fringe with a mix of suburban shelter and open higher ground. Shower timing matters for parks and travel toward the Downs.',
  enfield:
    'Enfield’s northern London setting can stay cooler overnight with mist after clear spells. Check short-range rain before parks and Lea Valley trips.',
  'kingston-upon-hull':
    'Hull’s east-coast position brings North Sea air — cooler breezes, sharp showers, and clearer breaks after fronts. Gusts matter on waterfront and Humber-side walks.',
  walsall:
    'Walsall sits in the West Midlands urban belt where showers can linger in cooler air. Check hourly rain before parks and travel across the Black Country.',
  northampton:
    'Northampton’s inland Midlands weather brings warm summer peaks and cooler clear nights. Convective showers can arrive quickly — check the next few hours before outdoor plans.',
});

/**
 * @param {string | null | undefined} placeSlug
 * @returns {string | null}
 */
export function getPlaceEditorialBlurb(placeSlug) {
  const slug = String(placeSlug ?? '').trim().toLowerCase();
  if (!slug) {
    return null;
  }
  return PLACE_EDITORIAL_BLURBS[slug] ?? null;
}
