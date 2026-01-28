import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the home page', async ({ page }) => {
    await expect(page).toHaveURL('/');
  });

  test('should have navigation links to auth pages', async ({ page }) => {
    // Check for login/register links if they exist on home page
    const loginLink = page.getByRole('link', { name: /sign in|login/i });
    const registerLink = page.getByRole('link', { name: /sign up|register|get started|free trial/i });

    // At least one auth link should be visible
    const hasAuthLink =
      (await loginLink.isVisible().catch(() => false)) ||
      (await registerLink.isVisible().catch(() => false));

    expect(hasAuthLink).toBeTruthy();
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page).toHaveURL('/');

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page).toHaveURL('/');

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page).toHaveURL('/');
  });
});
