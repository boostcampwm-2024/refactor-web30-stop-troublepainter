import { test, Page, chromium } from '@playwright/test';
import { playAudit, playwrightLighthouseResult } from 'playwright-lighthouse';

const BASE_URL = 'http://localhost:4173';

/* const disableNavigation = async (page: Page) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'sessionStorage', {
      value: { getItem: () => null },
    });
  });
}; */

const printScores = (result: playwrightLighthouseResult) => {
  const performanceScore = (result.lhr.categories.performance?.score || 0) * 100;
  const performanceMetrics = {
    FCP: result.lhr.audits['first-contentful-paint'].displayValue,
    LCP: result.lhr.audits['largest-contentful-paint'].displayValue,
    TBT: result.lhr.audits['total-blocking-time'].displayValue,
    CLS: result.lhr.audits['cumulative-layout-shift'].displayValue,
    SI: result.lhr.audits['speed-index'].displayValue,
  };

  console.log('Performance Score:', performanceScore);
  console.table(performanceMetrics);
};

const getLighthouseConfig = (pageName: string) => ({
  port: 9222,
  thresholds: {
    performance: 0,
  },
  reports: {
    formats: { html: true },
    name: pageName,
    directory: './.lighthouse',
  },
});

const runLighthouseAudit = async (page: Page, pageName: string) => {
  return await playAudit({
    page,
    ...getLighthouseConfig(pageName),
  });
};

const runTest = async (url: string, pageName: string, setupPage?: (page: Page) => Promise<void>) => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(url);
    if (setupPage) {
      await setupPage(page);
    }
    const result = await runLighthouseAudit(page, pageName);
    console.log('-----' + pageName + '-----');
    printScores(result);
  } catch (error) {
    console.error(`Error during ${pageName} test:`, error);
  } finally {
    await browser.close();
  }
};

test.describe('Lighthouse Performance Tests', () => {
  test('MainPage Performance Check', async () => {
    await runTest(BASE_URL, 'MainPage');
  });

  /*   test('LobbyPage Performance Check', async () => {
    await runTest(BASE_URL, 'LobbyPage', async (page) => {
      await page.getByRole('button', { name: '방 만들기' }).click();
      await page.waitForURL(`${BASE_URL}/lobby/*`, { waitUntil: 'networkidle' });
      await disableNavigation(page);
    });
  }); */
});
