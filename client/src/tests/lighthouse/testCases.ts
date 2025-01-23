import { Page } from '@playwright/test';
import { BASE_URL } from './lighthouse.config';

export interface TestCase {
  url: string;
  pageName: string;
  setup?: (page: Page) => Promise<void>;
}

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
