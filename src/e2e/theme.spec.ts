import { test, expect } from './fixtures';

test.describe('Theme Toggle', () => {
  test('should persist dark mode across page reloads', async ({ page }) => {
    // Navigate to a page with the theme toggle (settings page after login)
    await page.goto('/en/settings');

    // Initially should not have dark class on html
    const htmlElement = page.locator('html');

    // Click the theme toggle to switch to dark mode
    const themeToggle = page.getByRole('button', { name: /system theme/i });
    await themeToggle.click();

    // After clicking from system, should go to light
    // Click again to go to dark
    await themeToggle.click();

    // Now reload the page
    await page.reload();

    // After reload, the dark class should persist on html
    const newClass = await htmlElement.getAttribute('class');
    expect(newClass).toContain('dark');
  });

  test('should cycle through all three themes', async ({ page }) => {
    await page.goto('/en/settings');

    const themeToggle = page.getByRole('button');

    // System → Light
    await themeToggle.click();
    await expect(themeToggle).toHaveAttribute('aria-label', /light theme/i);

    // Light → Dark
    await themeToggle.click();
    await expect(themeToggle).toHaveAttribute('aria-label', /dark theme/i);

    // Dark → System
    await themeToggle.click();
    await expect(themeToggle).toHaveAttribute('aria-label', /system theme/i);
  });

  test('should show correct icon for each theme', async ({ page }) => {
    await page.goto('/en/settings');

    const themeToggle = page.getByRole('button');

    // System shows 🖥
    await expect(themeToggle).toHaveText('🖥');

    // Light shows ☀
    await themeToggle.click();
    await expect(themeToggle).toHaveText('☀');

    // Dark shows 🌙
    await themeToggle.click();
    await expect(themeToggle).toHaveText('🌙');
  });
});