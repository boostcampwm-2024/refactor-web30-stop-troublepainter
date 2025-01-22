import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { test, Page, chromium } from '@playwright/test';
import { playAudit, playwrightLighthouseResult } from 'playwright-lighthouse';

const BASE_URL = 'http://localhost:4173';

type CategoryName = 'performance' | 'accessibility' | 'best-practices' | 'seo';

type MetricName =
  | 'first-contentful-paint'
  | 'largest-contentful-paint'
  | 'total-blocking-time'
  | 'cumulative-layout-shift'
  | 'speed-index';

type MetricNickname = 'FCP' | 'LCP' | 'TBT' | 'CLS' | 'SI';

interface MetricValue {
  displayValue: string;
  score: number;
}

interface CategoryValue {
  score: number;
}

type Categories = Record<CategoryName, CategoryValue>;
type Metrics = Record<MetricNickname, MetricValue>;

interface PageResult {
  pageName: string;
  categories: Categories;
  metrics: Metrics;
}

const results: PageResult[] = [];

const saveResults = () => {
  const resultsDir = './.lighthouse';
  if (!existsSync(resultsDir)) {
    mkdirSync(resultsDir, { recursive: true });
  }

  writeFileSync(join(resultsDir, 'results.json'), JSON.stringify(results, null, 2));
};

const getMetricScore = (result: playwrightLighthouseResult, metricName: MetricName) => {
  const audit = result.lhr.audits[metricName];
  return {
    displayValue: audit.displayValue || '',
    score: (audit.score || 0) * 100,
  };
};

const extractLighthouseResult = (result: playwrightLighthouseResult) => {
  const categories: Categories = {
    performance: { score: (result.lhr.categories.performance?.score || 0) * 100 },
    accessibility: { score: (result.lhr.categories.accessibility?.score || 0) * 100 },
    'best-practices': { score: (result.lhr.categories['best-practices']?.score || 0) * 100 },
    seo: { score: (result.lhr.categories.seo?.score || 0) * 100 },
  };

  const metrics: Metrics = {
    FCP: getMetricScore(result, 'first-contentful-paint'),
    LCP: getMetricScore(result, 'largest-contentful-paint'),
    TBT: getMetricScore(result, 'total-blocking-time'),
    CLS: getMetricScore(result, 'cumulative-layout-shift'),
    SI: getMetricScore(result, 'speed-index'),
  };

  return { categories, metrics };
};

const printScores = (pageName: string, categories: Categories, metrics: Metrics) => {
  console.log(`\n-----${pageName}-----`);
  console.table(categories);
  console.table(metrics);
};

const getLighthouseConfig = (pageName: string) => ({
  port: 9222,
  thresholds: {
    performance: 0,
    accessibility: 0,
    'best-practices': 0,
    seo: 0,
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
    const { categories, metrics } = extractLighthouseResult(result);
    printScores(pageName, categories, metrics);
    results.push({ pageName, categories, metrics });
    saveResults();
  } catch (error) {
    console.error(`Error during ${pageName} test:`, error);
    throw error;
  } finally {
    await browser.close();
  }
};

test.describe('Lighthouse Performance Tests', () => {
  test('MainPage Performance Check', async () => {
    await runTest(BASE_URL, 'MainPage');
  });

  test('LobbyPage Performance Check', async () => {
    await runTest(BASE_URL, 'LobbyPage', async (page) => {
      await page.getByRole('button', { name: '방 만들기' }).click();
      await page.waitForURL(`${BASE_URL}/lobby/*`);
    });
  });
});
