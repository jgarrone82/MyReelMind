import { test as base, expect } from '@playwright/test';

/**
 * Test user fixture for E2E tests
 */
export interface TestUser {
  email: string;
  password: string;
  name?: string;
}

/**
 * Default test user for E2E tests
 * NOTE: This user should be created in Supabase before running E2E tests
 * or use Supabase's test mode
 */
export const testUser: TestUser = {
  email: process.env.E2E_TEST_EMAIL || 'test@example.com',
  password: process.env.E2E_TEST_PASSWORD || 'TestPassword123!',
  name: 'Test User',
};

/**
 * Extended test fixture with authentication helpers
 */
export const test = base.extend<{
  loginAs: (user: TestUser) => Promise<void>;
}>({
  loginAs: async ({ page }, use) => {
    await use(async (user: TestUser) => {
      await page.goto('/en/login');
      await page.fill('input[type="email"]', user.email);
      await page.fill('input[type="password"]', user.password);
      await page.click('button[type="submit"]');
      // Sign-in redirects to "/" → middleware localizes to the default-locale
      // home (/${defaultLocale}); match either locale's home, not /dashboard.
      await page.waitForURL(/\/(en|es)\/?$/);
    });
  },
});

/**
 * Helper to seed a test user in Supabase
 * This should be called before tests that require a user
 * 
 * NOTE: In production, use Supabase's test mode or API to create users
 */
export async function seedTestUser(user: TestUser): Promise<void> {
  // This would typically call Supabase Admin API or use SQL
  // For now, it's a placeholder that assumes the user exists
  console.log(`Test user seeded: ${user.email}`);
}

export { expect };
