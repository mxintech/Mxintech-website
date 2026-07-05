/**
 * Community metrics shown in the Acerca de section.
 * Counts are collected manually from each network's public profile —
 * update the numbers and `asOf` together. Facebook, X, and Twitch don't
 * expose public counts, so the UI presents the total as a minimum ("+").
 */
export const COMMUNITY_METRICS = {
  asOf: '2026-07-04',
  /* Total recorded webinars on the YouTube channel (not just the featured
     cards in config/content.js). */
  webinarsRecorded: 60,
  socials: [
    { network: 'YouTube', count: 485 },
    { network: 'LinkedIn', count: 173 },
    { network: 'TikTok', count: 128 },
    { network: 'Meetup', count: 28 },
  ],
};

export const totalSocialFollowers = () =>
  COMMUNITY_METRICS.socials.reduce((sum, s) => sum + s.count, 0);

export const FEATURED_COLLABORATIONS = [
  { name: 'KCD México 2026', detail: 'Guadalajara' },
  { name: 'AWS Community Day 2025', detail: 'Junio de 2025' },
];
