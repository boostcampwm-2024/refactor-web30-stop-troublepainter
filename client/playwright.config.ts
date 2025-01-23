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
      testMatch: 'lighthouse/lighthouse.test.ts',
    },
  ],
  webServer: {
    command: 'pnpm start',
    port: 4173,
    reuseExistingServer: !process.env.CI,
  },
});
