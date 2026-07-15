/**
 * Weather-aware hero scene: bias Unsplash/Pexels/Wikimedia queries toward current
 * conditions and reject photos whose captions scream a conflicting season.
 */

export const HERO_WEATHER_SCENE = Object.freeze({
  HOT_CLEAR: 'hot-clear',
  MILD_CLEAR: 'mild-clear',
  OVERCAST: 'overcast',
  RAIN: 'rain',
  STORM: 'storm',
  FOG: 'fog',
  SNOW: 'snow',
  COLD_CLEAR: 'cold-clear',
});

/** Phrases appended to place queries (first-pass searches). */
const SCENE_QUERY_CUES = Object.freeze({
  [HERO_WEATHER_SCENE.HOT_CLEAR]: ['sunny summer', 'blue sky summer day'],
  [HERO_WEATHER_SCENE.MILD_CLEAR]: ['sunny day', 'clear sky'],
  [HERO_WEATHER_SCENE.OVERCAST]: ['overcast cloudy'],
  [HERO_WEATHER_SCENE.RAIN]: ['rainy wet', 'rain clouds'],
  [HERO_WEATHER_SCENE.STORM]: ['storm clouds', 'dramatic sky'],
  [HERO_WEATHER_SCENE.FOG]: ['fog mist'],
  [HERO_WEATHER_SCENE.SNOW]: ['snow winter', 'snowy'],
  [HERO_WEATHER_SCENE.COLD_CLEAR]: ['winter clear', 'frosty morning'],
});

/**
 * Caption tokens that clash with the live weather scene.
 * Matching any token marks the photo as a weather conflict.
 */
const SCENE_CONFLICT_TOKENS = Object.freeze({
  [HERO_WEATHER_SCENE.HOT_CLEAR]: [
    'snow',
    'snowy',
    'snowfall',
    'blizzard',
    'frost',
    'icy',
    'ice covered',
    'winter storm',
  ],
  [HERO_WEATHER_SCENE.MILD_CLEAR]: [
    'snow',
    'snowy',
    'blizzard',
    'heavy rain',
    'thunderstorm',
  ],
  [HERO_WEATHER_SCENE.OVERCAST]: ['snow', 'blizzard', 'beach sunset paradise'],
  [HERO_WEATHER_SCENE.RAIN]: ['snow', 'snowy', 'blizzard', 'sunny beach'],
  [HERO_WEATHER_SCENE.STORM]: ['sunny beach', 'clear blue sky summer'],
  [HERO_WEATHER_SCENE.FOG]: ['snow blizzard', 'sunny beach'],
  [HERO_WEATHER_SCENE.SNOW]: [
    'summer',
    'beach',
    'tropical',
    'palm tree',
    'desert heat',
    'swimming pool',
  ],
  [HERO_WEATHER_SCENE.COLD_CLEAR]: [
    'summer beach',
    'tropical',
    'swimming pool',
    'desert heat',
  ],
});

/**
 * Soft positive tokens that boost score when present (not required).
 */
const SCENE_BONUS_TOKENS = Object.freeze({
  [HERO_WEATHER_SCENE.HOT_CLEAR]: ['sunny', 'summer', 'blue sky', 'warm'],
  [HERO_WEATHER_SCENE.MILD_CLEAR]: ['sunny', 'clear', 'blue sky'],
  [HERO_WEATHER_SCENE.OVERCAST]: ['cloudy', 'overcast', 'grey sky', 'gray sky'],
  [HERO_WEATHER_SCENE.RAIN]: ['rain', 'rainy', 'wet', 'drizzle'],
  [HERO_WEATHER_SCENE.STORM]: ['storm', 'thunder', 'lightning'],
  [HERO_WEATHER_SCENE.FOG]: ['fog', 'mist', 'haze'],
  [HERO_WEATHER_SCENE.SNOW]: ['snow', 'snowy', 'winter'],
  [HERO_WEATHER_SCENE.COLD_CLEAR]: ['winter', 'frost', 'cold'],
});

/**
 * @param {{
 *   temperature?: number | null,
 *   weatherId?: number | null,
 *   condition?: string | null,
 *   description?: string | null,
 *   icon?: string | null,
 * } | null | undefined} weather
 * @returns {string | null}
 */
export function deriveHeroWeatherScene(weather) {
  if (!weather) {
    return null;
  }

  const weatherId = Number(weather.weatherId);
  const temperature = Number(weather.temperature);
  const text = `${weather.condition ?? ''} ${weather.description ?? ''}`.toLowerCase();

  if (Number.isFinite(weatherId)) {
    if (weatherId >= 200 && weatherId < 300) {
      return HERO_WEATHER_SCENE.STORM;
    }
    if (weatherId >= 600 && weatherId < 700) {
      return HERO_WEATHER_SCENE.SNOW;
    }
    if (weatherId >= 300 && weatherId < 600) {
      return HERO_WEATHER_SCENE.RAIN;
    }
    if (weatherId >= 700 && weatherId < 800) {
      return HERO_WEATHER_SCENE.FOG;
    }
    if (weatherId === 800) {
      if (Number.isFinite(temperature) && temperature >= 24) {
        return HERO_WEATHER_SCENE.HOT_CLEAR;
      }
      if (Number.isFinite(temperature) && temperature <= 4) {
        return HERO_WEATHER_SCENE.COLD_CLEAR;
      }
      return HERO_WEATHER_SCENE.MILD_CLEAR;
    }
    if (weatherId > 800 && weatherId < 900) {
      return HERO_WEATHER_SCENE.OVERCAST;
    }
  }

  if (/thunder|storm|lightning/.test(text)) {
    return HERO_WEATHER_SCENE.STORM;
  }
  if (/snow|sleet|blizzard/.test(text)) {
    return HERO_WEATHER_SCENE.SNOW;
  }
  if (/rain|drizzle|shower/.test(text)) {
    return HERO_WEATHER_SCENE.RAIN;
  }
  if (/fog|mist|haze/.test(text)) {
    return HERO_WEATHER_SCENE.FOG;
  }
  if (/cloud|overcast/.test(text)) {
    return HERO_WEATHER_SCENE.OVERCAST;
  }

  if (Number.isFinite(temperature)) {
    if (temperature >= 24) {
      return HERO_WEATHER_SCENE.HOT_CLEAR;
    }
    if (temperature <= 4) {
      return HERO_WEATHER_SCENE.COLD_CLEAR;
    }
  }

  if (/clear|sun/.test(text)) {
    return HERO_WEATHER_SCENE.MILD_CLEAR;
  }

  return null;
}

/**
 * @param {string | null | undefined} scene
 * @returns {string[]}
 */
export function getHeroSceneQueryCues(scene) {
  if (!scene) {
    return [];
  }
  return SCENE_QUERY_CUES[scene] ?? [];
}

/**
 * @param {string} haystack lowercase text
 * @param {string | null | undefined} scene
 */
export function photoConflictsWeatherScene(haystack, scene) {
  if (!scene || !haystack) {
    return false;
  }

  const tokens = SCENE_CONFLICT_TOKENS[scene] ?? [];
  return tokens.some((token) => haystack.includes(token));
}

/**
 * @param {string} haystack lowercase text
 * @param {string | null | undefined} scene
 */
export function scoreWeatherSceneBonus(haystack, scene) {
  if (!scene || !haystack) {
    return 0;
  }

  const tokens = SCENE_BONUS_TOKENS[scene] ?? [];
  let hits = 0;
  for (const token of tokens) {
    if (haystack.includes(token)) {
      hits += 1;
    }
  }

  return Math.min(hits, 3);
}

/**
 * Attach weather fields onto a region for cache keys + resolvers.
 *
 * @param {object} region
 * @param {{
 *   temperature?: number | null,
 *   weatherId?: number | null,
 *   condition?: string | null,
 *   description?: string | null,
 *   icon?: string | null,
 * } | null | undefined} weather
 */
export function withHeroWeatherScene(region, weather) {
  const scene = deriveHeroWeatherScene(weather);
  if (!scene) {
    return { ...region };
  }

  return {
    ...region,
    weatherScene: scene,
    temperature: weather?.temperature ?? region?.temperature ?? null,
    weatherId: weather?.weatherId ?? region?.weatherId ?? null,
    condition: weather?.condition ?? weather?.description ?? region?.condition ?? null,
  };
}
