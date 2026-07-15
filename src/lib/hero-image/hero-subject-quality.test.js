import { describe, expect, it } from 'vitest';
import {
  photoConflictsHeroSubject,
  scoreHeroSubjectBonus,
} from '@/lib/hero-image/hero-subject-quality';
import {
  passesHeroRelevanceGate,
  scoreHeroPhotoRelevance,
} from '@/lib/hero-image/unsplash-resolver';

describe('hero subject quality', () => {
  it('rejects bus and crest captions', () => {
    expect(
      photoConflictsHeroSubject(
        'mercedes-benz o530g owned by mpk wrocław (poland, june 2012)',
      ),
    ).toBe(true);
    expect(photoConflictsHeroSubject('coat of arms of wrocław')).toBe(true);
  });

  it('boosts skyline / panorama captions', () => {
    expect(scoreHeroSubjectBonus('wrocław panorama evening view of the city center')).toBeGreaterThan(4);
  });

  it('gates out vehicle photos even when the city matches', () => {
    const relevance = scoreHeroPhotoRelevance(
      {
        description: 'Mercedes-Benz O530G owned by MPK Wrocław (Poland, June 2012)',
        alt_description: 'city bus',
        location: { city: 'Wrocław', country: 'Poland' },
        urls: { raw: 'https://example.com/bus.jpg' },
      },
      { city: 'Wrocław', countryName: 'Poland', countryCode: 'PL' },
    );

    expect(relevance.subjectConflict).toBe(true);
    expect(passesHeroRelevanceGate(relevance, 'place', {
      city: 'Wrocław',
      countryName: 'Poland',
    })).toBe(false);
  });
});
