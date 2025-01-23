export const BASE_URL = 'http://localhost:4173';
export const LIGHTHOUSE_CONFIG = {
  port: 9222,
  thresholds: {
    performance: 0,
    accessibility: 0,
    'best-practices': 0,
    seo: 0,
  },
  reports: {
    formats: { html: true },
    directory: './.lighthouse',
  },
};
