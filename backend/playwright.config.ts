import { defineConfig, devices } from '@playwright/test';

const PORT = process.env.PORT || '3001';

export default defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,
  expect: {
    timeout: 5 * 1000,
  },
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },
  },
  projects: [
    {
      name: 'API tests',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
