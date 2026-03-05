import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    storageState: 'frontend/tests/e2e/storageState.json',
    baseURL: 'http://localhost:4200',
    headless: true
  },
  testDir: 'frontend/tests/e2e',
  timeout: 30000,
});
