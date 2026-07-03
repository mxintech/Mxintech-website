import { describe, it, expect } from 'vitest';
import {
  COMMUNITY_METRICS,
  totalSocialFollowers,
  FEATURED_COLLABORATIONS,
} from './community';

describe('community metrics config', () => {
  it('has a fresh-data marker and positive counts per network', () => {
    expect(COMMUNITY_METRICS.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(COMMUNITY_METRICS.socials.length).toBeGreaterThanOrEqual(3);
    COMMUNITY_METRICS.socials.forEach(({ network, count }) => {
      expect(network).toBeTruthy();
      expect(count).toBeGreaterThan(0);
    });
  });

  it('sums the total followers across networks', () => {
    const manual = COMMUNITY_METRICS.socials.reduce((sum, s) => sum + s.count, 0);
    expect(totalSocialFollowers()).toBe(manual);
    expect(totalSocialFollowers()).toBeGreaterThan(0);
  });

  it('lists the featured collaborations', () => {
    const names = FEATURED_COLLABORATIONS.map((c) => c.name);
    expect(names).toContain('KCD México 2026');
    expect(names).toContain('AWS Community Day 2025');
    FEATURED_COLLABORATIONS.forEach(({ detail }) => expect(detail).toBeTruthy());
  });
});
