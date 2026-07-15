import { describe, expect, it } from 'vitest';
import {
  isPhotonPlaceFeature,
  normalizePhotonFeature,
  pickPhotonPlaceName,
} from './geocode-nominatim';

const hartlepoolFeature = {
  type: 'Feature',
  geometry: { type: 'Point', coordinates: [-1.2129, 54.6861] },
  properties: {
    name: 'Hartlepool',
    countrycode: 'gb',
    state: 'England',
    county: 'County Durham',
    type: 'city',
    osm_key: 'place',
    osm_value: 'town',
  },
};

const cafeFeature = {
  type: 'Feature',
  geometry: { type: 'Point', coordinates: [-1.2, 54.7] },
  properties: {
    name: 'Hart Cafe',
    countrycode: 'gb',
    type: 'house',
    osm_key: 'amenity',
    osm_value: 'cafe',
  },
};

describe('geocode-photon prefix mapper', () => {
  it('accepts settlement features that match the query prefix', () => {
    expect(isPhotonPlaceFeature(hartlepoolFeature, 'hart')).toBe(true);
    expect(isPhotonPlaceFeature(cafeFeature, 'hart')).toBe(false);
  });

  it('picks the Photon name', () => {
    expect(pickPhotonPlaceName(hartlepoolFeature.properties)).toBe('Hartlepool');
  });

  it('normalizes Photon features to geocode shape', () => {
    expect(normalizePhotonFeature(hartlepoolFeature, 'hart')).toEqual({
      name: 'Hartlepool',
      country: 'GB',
      state: 'England',
      county: 'County Durham',
      lat: 54.6861,
      lon: -1.2129,
      label: 'Hartlepool, County Durham, England, GB',
      source: 'photon',
    });
    expect(normalizePhotonFeature(cafeFeature, 'hart')).toBeNull();
  });
});
