export const SUBSCRIPTION_TYPES = {
  weekly: 'city_weekly',
  alerts: 'city_alerts',
  newsletter: 'newsletter',
};

const EMPTY_REGISTRY = {
  email: '',
  newsletter: null,
  cities: {},
};

export function parseSubscriptionRegistry(raw) {
  if (!raw) return EMPTY_REGISTRY;

  try {
    const parsed = JSON.parse(raw);
    return {
      email: parsed.email ?? '',
      newsletter: parsed.newsletter ?? null,
      cities: parsed.cities ?? {},
    };
  } catch {
    return EMPTY_REGISTRY;
  }
}

export function getCitySubscriptionState(registry, cityId) {
  const city = registry.cities?.[cityId];
  const weeklyActive = Boolean(city?.weekly?.active);
  const alertsActive = Boolean(city?.alerts?.active);

  return {
    weekly: weeklyActive,
    alerts: alertsActive,
    any: weeklyActive || alertsActive,
    both: weeklyActive && alertsActive,
  };
}

export function getButtonLabel(state) {
  if (state.both) return 'Manage updates';
  if (state.weekly) return 'Forecasts on';
  if (state.alerts) return 'Alerts on';
  return 'Email me updates';
}

export function hasActiveCitySubscriptions(registry, cityId) {
  return getCitySubscriptionState(registry, cityId).any;
}

export function mergeSubscriptionOnSuccess(registry, subscription, cityId = null) {
  const next = {
    email: subscription.email,
    newsletter: registry.newsletter,
    cities: { ...registry.cities },
  };

  if (subscription.type === 'newsletter') {
    next.newsletter = {
      active: true,
      subscribedAt: subscription.createdAt,
      subscriptionId: subscription.id,
      unsubscribeToken: subscription.unsubscribeToken,
    };
    return next;
  }

  const key = cityId ?? findCityIdForSubscription(next.cities, subscription);
  if (!key) return next;

  const existing = next.cities[key] ?? {};

  if (subscription.type === 'city_weekly') {
    next.cities[key] = {
      ...existing,
      weekly: {
        active: true,
        subscribedAt: subscription.createdAt,
        subscriptionId: subscription.id,
        unsubscribeToken: subscription.unsubscribeToken,
      },
    };
  }

  if (subscription.type === 'city_alerts') {
    next.cities[key] = {
      ...existing,
      alerts: {
        active: true,
        subscribedAt: subscription.createdAt,
        subscriptionId: subscription.id,
        unsubscribeToken: subscription.unsubscribeToken,
        alertOnRain: subscription.alertOnRain,
        alertOnStorm: subscription.alertOnStorm,
        alertPrefs: subscription.alertPrefs,
      },
    };
  }

  return next;
}

export function hydrateRegistryFromServer(registry, subscriptions, savedCities = []) {
  let next = { ...registry, cities: { ...registry.cities } };

  for (const sub of subscriptions) {
    const cityId = findCityIdFromSavedCities(savedCities, sub);
    next = mergeSubscriptionOnSuccess(next, sub, cityId);
  }

  return next;
}

function findCityIdFromSavedCities(savedCities, subscription) {
  if (subscription.cityLat == null || subscription.cityLon == null) return null;
  const match = savedCities.find(
    (city) =>
      Math.abs(city.lat - subscription.cityLat) < 0.0001 &&
      Math.abs(city.lon - subscription.cityLon) < 0.0001,
  );
  return match?.id ?? null;
}

function findCityIdForSubscription(cities, subscription) {
  const entry = Object.entries(cities).find(([, value]) => {
    return value?.weekly?.subscriptionId === subscription.id || value?.alerts?.subscriptionId === subscription.id;
  });
  if (entry) return entry[0];
  return findCityIdFromSavedCities([], subscription);
}

export function clearCitySubscriptions(registry, cityId, types = ['weekly', 'alerts']) {
  const city = registry.cities?.[cityId];
  if (!city) return registry;

  const nextCity = { ...city };
  for (const type of types) {
    if (nextCity[type]) {
      nextCity[type] = { ...nextCity[type], active: false };
    }
  }

  const hasAny = Boolean(nextCity.weekly?.active || nextCity.alerts?.active);
  const nextCities = { ...registry.cities };

  if (hasAny) {
    nextCities[cityId] = nextCity;
  } else {
    delete nextCities[cityId];
  }

  return { ...registry, cities: nextCities };
}

export function clearNewsletterSubscription(registry) {
  return {
    ...registry,
    newsletter: registry.newsletter ? { ...registry.newsletter, active: false } : null,
  };
}

export function getActiveTypesForCity(registry, cityId) {
  const state = getCitySubscriptionState(registry, cityId);
  const types = [];
  if (state.weekly) types.push('weekly');
  if (state.alerts) types.push('alerts');
  return types;
}

export function mapTypesToApi(types) {
  return types.map((type) => SUBSCRIPTION_TYPES[type]).filter(Boolean);
}
