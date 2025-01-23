type CategoryName = 'performance' | 'accessibility' | 'best-practices' | 'seo';

export type MetricName =
  | 'first-contentful-paint'
  | 'largest-contentful-paint'
  | 'total-blocking-time'
  | 'cumulative-layout-shift'
  | 'speed-index';

export type MetricNickname = 'FCP' | 'LCP' | 'TBT' | 'CLS' | 'SI';

export interface MetricValue {
  displayValue: string;
  score: number;
}

export interface CategoryValue {
  score: number;
}

export type Categories = Record<CategoryName, CategoryValue>;
export type Metrics = Record<MetricNickname, MetricValue>;

export interface LighthouseResult {
  pageName: string;
  categories: Categories;
  metrics: Metrics;
}
