import test from '@playwright/test';
import { runPerformanceTest } from './lighthouse.util';
import { testCases } from './testCases';

test.describe('Lighthouse Performance Tests', () => {
  for (const testCase of testCases) {
    test(`${testCase.pageName} Performance Check`, async () => {
      await runPerformanceTest(testCase);
    });
  }
});
