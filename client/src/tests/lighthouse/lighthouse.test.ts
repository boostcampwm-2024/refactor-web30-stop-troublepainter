import test from '@playwright/test';
import { Page } from '@playwright/test';
import { BASE_URL } from './lighthouse.config';
import { TestCase } from './lighthouse.type';
import { runPerformanceTest } from './lighthouse.util';

export const testCases: TestCase[] = [
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
      await runPerformanceTest(testCase);
    });
  }
});
