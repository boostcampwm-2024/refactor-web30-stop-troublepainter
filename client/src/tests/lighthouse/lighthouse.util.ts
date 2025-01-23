import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Page, chromium } from '@playwright/test';
import { playAudit, playwrightLighthouseResult } from 'playwright-lighthouse';
import { LIGHTHOUSE_CONFIG } from './lighthouse.config';
import { Categories, LighthouseResult, MetricName, Metrics } from './lighthouse.type';
import { TestCase } from './testCases';

const RESULTS_DIR = './.lighthouse';
const results: LighthouseResult[] = [];

export const runAudit = async (page: Page, pageName: string): Promise<playwrightLighthouseResult> => {
  return playAudit({
    page,
    ...LIGHTHOUSE_CONFIG,
    reports: {
      ...LIGHTHOUSE_CONFIG.reports,
      name: pageName,
    },
  });
};

export const getMetricScore = (result: playwrightLighthouseResult, metricName: MetricName) => {
  const audit = result.lhr.audits[metricName];
  return {
    displayValue: audit.displayValue || '',
    score: (audit.score || 0) * 100,
  };
};

export const extractResults = (result: playwrightLighthouseResult) => {
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

export const saveResult = (result: LighthouseResult) => {
  results.push(result);
  persistResults();
};

export const persistResults = () => {
  if (!existsSync(RESULTS_DIR)) {
    mkdirSync(RESULTS_DIR, { recursive: true });
  }
  writeFileSync(join(RESULTS_DIR, 'results.json'), JSON.stringify(results, null, 2));
};

export const printScores = (result: LighthouseResult) => {
  console.log(`\n-----${result.pageName}-----`);
  console.table(result.categories);
  console.table(result.metrics);
};

export const initBrowser = async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  return { browser, context, page };
};

export const navigateToPage = async (page: Page, { url, setup }: TestCase) => {
  await page.goto(url);
  if (setup) {
    await setup(page);
  }
};

export const collectMetrics = async (page: Page, pageName: string) => {
  const rawResults = await runAudit(page, pageName);
  return {
    pageName,
    ...extractResults(rawResults),
  };
};

export const runPerformanceTest = async (config: TestCase) => {
  const { browser, page } = await initBrowser();

  try {
    await navigateToPage(page, config);
    const testResults = await collectMetrics(page, config.pageName);
    printScores(testResults);
    saveResult(testResults);
  } finally {
    await browser.close();
  }
};
