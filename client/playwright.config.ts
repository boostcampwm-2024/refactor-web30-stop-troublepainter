import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: 'list',
  use: {
    launchOptions: {
      args: ['--remote-debugging-port=9222'],
      headless: true,
    },
  },
  projects: [
    {
      name: 'lighthouse',
      testMatch: 'lighthouse.test.ts',
    },
  ],
  timeout: 300000,
});
