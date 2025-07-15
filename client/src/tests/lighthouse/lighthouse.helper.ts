import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Page, chromium } from '@playwright/test';
import lighthouse, { Result } from 'lighthouse';
import { LIGHTHOUSE_CONFIG } from './lighthouse.config';
import { TestCase, LighthouseResult, Score, CategoryName, Categories, Metrics, MetricName } from './lighthouse.type';

const results: LighthouseResult[] = [];

export const compare = (thresholds: Record<CategoryName, Score>, newValue: Record<CategoryName, Score>) => {
  const errors: string[] = [];
  const results: string[] = [];
  const CATEGORY_NAMES: CategoryName[] = ['performance', 'accessibility', 'best-practices', 'seo'];

  CATEGORY_NAMES.forEach((key) => {
    const thresholdValue = thresholds[key];
    const actualValue = newValue[key];

    if (thresholdValue > actualValue) {
      errors.push(`${key} record is ${actualValue} and is under the ${thresholdValue} threshold`);
    } else {
      results.push(`${key} record is ${actualValue} and desired threshold was ${thresholdValue}`);
    }
  });

  return { errors, results };
};

const runAudit = async (url: string, pageName: string) => {
  const options = {
    port: LIGHTHOUSE_CONFIG.port,
    onlyCategories: Object.keys(LIGHTHOUSE_CONFIG.thresholds),
    output: 'html' as const,
  };

  try {
    const result = await lighthouse(url, options);

    if (!result) throw new Error('Lighthouse audit failed');

    // HTML 보고서 저장
    if (LIGHTHOUSE_CONFIG.reports.formats.html) {
      if (!existsSync(LIGHTHOUSE_CONFIG.reports.directory))
        mkdirSync(LIGHTHOUSE_CONFIG.reports.directory, { recursive: true });
      const reportContent = Array.isArray(result.report) ? result.report[0] : result.report;
      writeFileSync(join(LIGHTHOUSE_CONFIG.reports.directory, `${pageName}.html`), reportContent);
    }

    return result.lhr;
  } catch (error) {
    console.error('Lighthouse audit failed:', error);
  }
};

const getMetricScore = (result: Result, metricName: MetricName) => {
  const audit = result.audits[metricName];
  return {
    displayValue: audit?.displayValue || '',
    score: Math.round((audit?.score || 0) * 100),
  };
};

const extractResults = (result: Result, pageName: string) => {
  const categories: Categories = {
    performance: { score: Math.round((result.categories.performance?.score || 0) * 100) },
    accessibility: { score: Math.round((result.categories.accessibility?.score || 0) * 100) },
    'best-practices': { score: Math.round((result.categories['best-practices']?.score || 0) * 100) },
    seo: { score: Math.round((result.categories.seo?.score || 0) * 100) },
  };

  const metrics: Metrics = {
    FCP: getMetricScore(result, 'first-contentful-paint'),
    LCP: getMetricScore(result, 'largest-contentful-paint'),
    TBT: getMetricScore(result, 'total-blocking-time'),
    CLS: getMetricScore(result, 'cumulative-layout-shift'),
    SI: getMetricScore(result, 'speed-index'),
  };

  return {
    pageName,
    categories,
    metrics,
  };
};

const saveResult = (result: LighthouseResult) => {
  results.push(result);
  persistResults();
};

const persistResults = () => {
  if (!existsSync(LIGHTHOUSE_CONFIG.reports.directory))
    mkdirSync(LIGHTHOUSE_CONFIG.reports.directory, { recursive: true });
  writeFileSync(join(LIGHTHOUSE_CONFIG.reports.directory, 'results.json'), JSON.stringify(results, null, 2));
};

export const printResult = (result: LighthouseResult) => {
  console.log(`\n-----${result.pageName}-----`);
  console.log('\n📊 Categories:');
  console.table(result.categories);
  console.log('\n⚡ Metrics:');
  console.table(result.metrics);

  // 임계값 체크 (categories만)
  const categoryScores: Record<CategoryName, Score> = {
    performance: result.categories.performance.score,
    accessibility: result.categories.accessibility.score,
    'best-practices': result.categories['best-practices'].score,
    seo: result.categories.seo.score,
  };

  const comparison = compare(LIGHTHOUSE_CONFIG.thresholds, categoryScores);

  if (comparison.results.length > 0) {
    console.log('\n✅ Passed thresholds:');
    comparison.results.forEach((res) => console.log(`  ${res}`));
  }

  if (comparison.errors.length > 0) {
    console.log('\n❌ Failed thresholds:');
    comparison.errors.forEach((error) => console.log(`  ${error}`));
  }
};

export const initBrowser = async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  return { browser, context, page };
};

export const navigateToPage = async (page: Page, { url, setup }: TestCase) => {
  await page.goto(url);
  if (setup) await setup(page);
  await page.waitForLoadState('networkidle');
  return page.url();
};

export const runPerformanceTest = async (testCase: TestCase): Promise<LighthouseResult | undefined> => {
  const { browser, page } = await initBrowser();
  try {
    const finalURL = await navigateToPage(page, testCase);
    const audit = await runAudit(finalURL, testCase.pageName);
    if (!audit) return;

    const result = extractResults(audit, testCase.pageName);
    saveResult(result);
    printResult(result);
    return result;
  } catch (err) {
    console.error(`[Error] Failed performance test:`, err);
  } finally {
    await browser.close();
  }
};
