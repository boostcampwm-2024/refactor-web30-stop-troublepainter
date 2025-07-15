import test, { expect } from '@playwright/test';
import { Page } from '@playwright/test';
import { BASE_URL, LIGHTHOUSE_CONFIG } from './lighthouse.config';
import { runPerformanceTest } from './lighthouse.helper';
import { TestCase } from './lighthouse.type';

const testCases: TestCase[] = [
  {
    url: BASE_URL,
    pageName: 'MainPage',
  },
  {
    url: BASE_URL,
    pageName: 'LobbyPage',
    setup: async (page: Page) => {
      await page.getByRole('button', { name: '방 만들기' }).click();
      await page.waitForURL(`${BASE_URL}/lobby/*`);
    },
  },
];

test.describe('Lighthouse Performance Tests', () => {
  for (const testCase of testCases) {
    test(`${testCase.pageName} Performance Check`, async () => {
      const result = await runPerformanceTest(testCase);
      expect(result).toBeTruthy();

      const { categories } = result!;
      const { thresholds } = LIGHTHOUSE_CONFIG;

      expect(categories.performance.score).toBeGreaterThanOrEqual(thresholds.performance);
      expect(categories.accessibility.score).toBeGreaterThanOrEqual(thresholds.accessibility);
      expect(categories['best-practices'].score).toBeGreaterThanOrEqual(thresholds['best-practices']);
      expect(categories.seo.score).toBeGreaterThanOrEqual(thresholds.seo);
    });
  }
});
