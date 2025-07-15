import { Page } from '@playwright/test';

export interface TestCase {
  url: string;
  pageName: string;
  setup?: (page: Page) => Promise<void>;
}

export type CategoryName = 'performance' | 'accessibility' | 'best-practices' | 'seo';

export type MetricName =
  | 'first-contentful-paint'
  | 'largest-contentful-paint'
  | 'total-blocking-time'
  | 'cumulative-layout-shift'
  | 'speed-index';

export type MetricNickname = 'FCP' | 'LCP' | 'TBT' | 'CLS' | 'SI';

export type Score = number;

export interface MetricValue {
  displayValue: string;
  score: Score;
}

export interface CategoryValue {
  score: Score;
}

export type Categories = Record<CategoryName, CategoryValue>;
export type Metrics = Record<MetricNickname, MetricValue>;

export interface LighthouseResult {
  pageName: string;
  categories: Categories;
  metrics: Metrics;
}
