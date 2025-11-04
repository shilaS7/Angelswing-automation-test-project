import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') });
//const res = { width: 1280, height: 720 };
const pixelDifference: number = parseInt(process.env.MAX_PIXEL_DIFFERENCE || '0');

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  timeout: 600000,
  globalTimeout: 36000000,

  expect: {
    timeout: 15000,
    toHaveScreenshot: {
      maxDiffPixels: pixelDifference,
      // threshold: 0.11
    }
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }],
  ["Allure-playwright"],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL,

    actionTimeout: 5000,
    // navigationTimeout: 10000,
    /* Disable animations globally */
    contextOptions: {
      reducedMotion: 'reduce',
    },

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: {
      mode: 'on',
      // size: res,
    },
  },

  /* Configure projects for major browsers */
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'desktop-chromium-default',
      use: {
        browserName: 'chromium',
        // colorScheme: 'dark',
        // viewport: res,
        storageState: 'playwright/.auth/user.json',
      },
      // dependencies: ['setup']
    },
    // {
    //   name: 'desktop-chromium-1912x962',
    //   use: {
    //     browserName: 'chromium',
    //     viewport: { width: 1912, height: 962 },
    //     storageState: 'playwright/.auth/user.json'
    //   },
    //   // dependencies: ['setup']
    // },
    // {
    //   name: 'desktop-edge-1912x962',
    //   use: {
    //     channel: 'msedge',
    //     viewport: { width: 1912, height: 962 },
    //     storageState: 'playwright/.auth/user.json'
    //   },
    //   // dependencies: ['setup']
    // },
    // {
    //   name: 'desktop-chromium-1912x954',
    //   use: {
    //     browserName: 'chromium',
    //     viewport: { width: 1912, height: 954 },
    //     storageState: 'playwright/.auth/user.json'
    //   },
    //   // dependencies: ['setup']
    // },
    // {
    //   name: 'desktop-edge-1912x954',
    //   use: {
    //     channel: 'msedge',
    //     viewport: { width: 1912, height: 954 },
    //     storageState: 'playwright/.auth/user.json'
    //   },
    //   // dependencies: ['setup']
    // },
    // {
    //   name: 'desktop-edge-default',
    //   use: {
    //     channel: 'msedge',
    //     storageState: 'playwright/.auth/user.json'
    //   },
    //   // dependencies: ['setup']
    // },

    // {
    //   name: 'smartDevice-samsung-s24-s25',
    //   use: {
    //     viewport: { width: 412, height: 915 },
    //     browserName: 'chromium',
    //     storageState: 'playwright/.auth/user.json',
    //   },
    //   // dependencies: ['setup']
    // },
    // {
    //   name: 'smartDevice-samsung-s24-s25-landscape-chromium',
    //   use: {
    //     viewport: { width: 915, height: 412 },
    //     browserName: 'chromium',
    //     storageState: 'playwright/.auth/user.json',
    //   },
    //   // dependencies: ['setup']
    // },
    // // Android phone using Chrome (Pixel 5 emulation)
    // {
    //   name: 'smartDevice-Pixel-7',
    //   use: {
    //     ...devices['Pixel 7'],
    //     browserName: 'chromium',
    //     storageState: 'playwright/.auth/user.json',
    //   },
    //   // dependencies: ['setup']
    // },
    // {
    //   name: 'smartDevice-Pixel-7-landscape-chromium',
    //   use: {
    //     ...devices['Pixel 7 landscape'],
    //     browserName: 'chromium',
    //     storageState: 'playwright/.auth/user.json',
    //   },
    //   // dependencies: ['setup']
    // },
    // {
    //   name: 'smartDevice-Galaxy-Tab-S4',
    //   use: {
    //     ...devices['Galaxy Tab S4'],
    //     browserName: 'chromium',
    //     storageState: 'playwright/.auth/user.json',
    //   },
    //   // dependencies: ['setup']
    // },
    // {
    //   name: 'smartDevice-Galaxy-Tab-S4-landscape-chromium',
    //   use: {
    //     ...devices['Galaxy Tab S4 landscape'],
    //     browserName: 'chromium',
    //     storageState: 'playwright/.auth/user.json',
    //   },
    //   // dependencies: ['setup']
    // },

    // {
    //   name: 'smartDevice-iPhone-15-Pro-Max',
    //   use: {
    //     ...devices['iPhone 15 Pro Max'],
    //     browserName: 'chromium',
    //     storageState: 'playwright/.auth/user.json',
    //   },
    //   // dependencies: ['setup']
    // },
    // {
    //   name: 'smartDevice-iPhone-15-Pro-Max-landscape-chromium',
    //   use: {
    //     ...devices['iPhone 15 Pro Max landscape'],
    //     browserName: 'chromium',
    //     storageState: 'playwright/.auth/user.json',
    //   },
    //   // dependencies: ['setup']
    // },

    // {
    //   name: 'smartDevice-iPad-Pro-11-chromium',
    //   use: {
    //     ...devices['iPad Pro 11'],
    //     browserName: 'chromium',
    //     storageState: 'playwright/.auth/user.json',
    //   },
    //   // dependencies: ['setup']
    // },
    // {
    //   name: 'smartDevice-iPad-Pro-11-landscape-chromium',
    //   use: {
    //     ...devices['iPad Pro 11 landscape'],
    //     browserName: 'chromium',
    //     storageState: 'playwright/.auth/user.json',
    //   },
    //   // dependencies: ['setup']
    // },
    // {
    //   name: 'smartDevice-iOs-webkit',
    //   use: {
    //     browserName: 'webkit',
    //     viewport: { width: 390, height: 663 },
    //     storageState: 'playwright/.auth/user.json',
    //   },
    //   // dependencies: ['setup']
    // },
    // {
    //   name: 'smartDevice-iOs-webkit-landscape',
    //   use: {
    //     browserName: 'webkit',
    //     viewport: { width: 663, height: 390 },
    //     storageState: 'playwright/.auth/user.json',
    //   },
    //   // dependencies: ['setup']
    // },

  ],
});
