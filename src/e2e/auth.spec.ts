import { test, expect } from './fixtures';

test.describe('Auth Flow', () => {
  test.describe('Login', () => {
    test('should display login page with form', async ({ page }) => {
      await page.goto('/en/login');

      await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    });

    test('should show error with invalid credentials', async ({ page }) => {
      await page.goto('/en/login');

      await page.fill('input[type="email"]', 'wrong@example.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');

      // Should show error message (Supabase will reject invalid credentials)
      await expect(page.getByRole('alert')).toBeVisible({ timeout: 10000 });
    });

    test('should have forgot password link', async ({ page }) => {
      await page.goto('/en/login');

      await expect(page.getByRole('link', { name: /forgot password/i })).toBeVisible();
    });

    test('should have signup link', async ({ page }) => {
      await page.goto('/en/login');

      await expect(page.getByRole('link', { name: /create account/i })).toBeVisible();
    });
  });

  test.describe('Signup', () => {
    test('should display signup page with form', async ({ page }) => {
      await page.goto('/en/signup');

      await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/password/i, { exact: true })).toBeVisible();
      await expect(page.getByLabel(/confirm password/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
    });

    test('should navigate to login from signup page', async ({ page }) => {
      await page.goto('/en/signup');

      await page.getByRole('link', { name: /sign in/i }).click();
      await expect(page).toHaveURL(/\/en\/login/);
    });
  });

  test.describe('Password Reset', () => {
    test('should display forgot password page', async ({ page }) => {
      await page.goto('/en/forgot-password');

      await expect(page.getByRole('heading', { name: /reset your password/i })).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /send reset link/i })).toBeVisible();
    });

    test('should navigate to login from forgot password page', async ({ page }) => {
      await page.goto('/en/forgot-password');

      await page.getByRole('link', { name: /back to login/i }).click();
      await expect(page).toHaveURL(/\/en\/login/);
    });
  });

  test.describe('Navigation', () => {
    test('should navigate from login to forgot password', async ({ page }) => {
      await page.goto('/en/login');

      await page.getByRole('link', { name: /forgot password/i }).click();
      await expect(page).toHaveURL(/\/en\/forgot-password/);
    });

    test('should navigate from login to signup', async ({ page }) => {
      await page.goto('/en/login');

      await page.getByRole('link', { name: /create account/i }).click();
      await expect(page).toHaveURL(/\/en\/signup/);
    });
  });
});
