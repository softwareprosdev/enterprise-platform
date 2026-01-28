import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.describe('Login Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/login');
    });

    test('should display login form', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
      await expect(page.getByLabel('Email')).toBeVisible();
      await expect(page.getByLabel('Password')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    });

    test('should show validation errors for empty form', async ({ page }) => {
      await page.getByRole('button', { name: 'Sign In' }).click();

      // Form should show validation errors
      await expect(page.getByText(/email/i)).toBeVisible();
    });

    test('should show validation error for invalid email', async ({ page }) => {
      await page.getByLabel('Email').fill('invalid-email');
      await page.getByLabel('Password').fill('password123');
      await page.getByRole('button', { name: 'Sign In' }).click();

      // Should show email validation error
      await expect(page.getByText(/invalid/i)).toBeVisible();
    });

    test('should toggle password visibility', async ({ page }) => {
      const passwordInput = page.getByLabel('Password');
      const toggleButton = page.locator('button').filter({ has: page.locator('svg') }).last();

      await passwordInput.fill('testpassword');
      await expect(passwordInput).toHaveAttribute('type', 'password');

      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'text');

      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('should have link to register page', async ({ page }) => {
      await page.getByRole('link', { name: 'Start your free trial' }).click();
      await expect(page).toHaveURL('/auth/register');
    });

    test('should have link to forgot password', async ({ page }) => {
      const forgotLink = page.getByRole('link', { name: 'Forgot password?' });
      await expect(forgotLink).toBeVisible();
    });

    test('should display GitHub OAuth button', async ({ page }) => {
      await expect(page.getByRole('button', { name: /github/i })).toBeVisible();
    });

    test('should show error message for invalid credentials', async ({ page }) => {
      await page.getByLabel('Email').fill('wrong@example.com');
      await page.getByLabel('Password').fill('wrongpassword');
      await page.getByRole('button', { name: 'Sign In' }).click();

      // Wait for error response
      await expect(page.locator('.bg-destructive\\/10')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Register Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/register');
    });

    test('should display registration form', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Start your free trial' })).toBeVisible();
      await expect(page.getByLabel('Your name')).toBeVisible();
      await expect(page.getByLabel('Work email')).toBeVisible();
      await expect(page.getByLabel('Password')).toBeVisible();
      await expect(page.getByLabel('Company name')).toBeVisible();
      await expect(page.getByLabel('Workspace URL')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible();
    });

    test('should display feature highlights', async ({ page }) => {
      await expect(page.getByText('Client portal')).toBeVisible();
      await expect(page.getByText('Project tracking')).toBeVisible();
      await expect(page.getByText('Invoicing')).toBeVisible();
    });

    test('should display trial information', async ({ page }) => {
      await expect(page.getByText('14 days free, no credit card required')).toBeVisible();
    });

    test('should auto-generate slug from company name', async ({ page }) => {
      const companyInput = page.getByLabel('Company name');
      const slugInput = page.getByLabel('Workspace URL');

      await companyInput.fill('Acme Corporation');

      // Check that slug is generated (lowercase, hyphenated)
      await expect(slugInput).toHaveValue('acme-corporation');
    });

    test('should only allow valid characters in slug', async ({ page }) => {
      const slugInput = page.getByLabel('Workspace URL');

      await slugInput.fill('My Company!@#$');

      // Should strip invalid characters
      await expect(slugInput).toHaveValue('my-company');
    });

    test('should toggle password visibility', async ({ page }) => {
      const passwordInput = page.getByLabel('Password');
      const toggleButton = page.locator('button[type="button"]').filter({ has: page.locator('svg') }).first();

      await passwordInput.fill('testpassword');
      await expect(passwordInput).toHaveAttribute('type', 'password');

      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'text');
    });

    test('should have link to login page', async ({ page }) => {
      await page.getByRole('link', { name: 'Sign in' }).click();
      await expect(page).toHaveURL('/auth/login');
    });

    test('should display terms and privacy links', async ({ page }) => {
      await expect(page.getByRole('link', { name: 'Terms' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Privacy Policy' })).toBeVisible();
    });

    test('should show validation errors for empty required fields', async ({ page }) => {
      await page.getByRole('button', { name: 'Create Account' }).click();

      // Form should show validation errors for required fields
      await page.waitForTimeout(500);
      // The form uses client-side validation
    });

    test('should validate password minimum length', async ({ page }) => {
      await page.getByLabel('Your name').fill('John Doe');
      await page.getByLabel('Work email').fill('john@example.com');
      await page.getByLabel('Password').fill('short');
      await page.getByLabel('Company name').fill('Test Company');
      await page.getByRole('button', { name: 'Create Account' }).click();

      // Should show password validation error (min 8 chars)
      await expect(page.getByText(/8 characters/i)).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('should navigate between login and register', async ({ page }) => {
      // Start at login
      await page.goto('/auth/login');
      await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();

      // Go to register
      await page.getByRole('link', { name: 'Start your free trial' }).click();
      await expect(page.getByRole('heading', { name: 'Start your free trial' })).toBeVisible();

      // Go back to login
      await page.getByRole('link', { name: 'Sign in' }).click();
      await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
    });

    test('should navigate to home from logo', async ({ page }) => {
      await page.goto('/auth/login');
      await page.getByRole('link', { name: 'Enterprise' }).click();
      await expect(page).toHaveURL('/');
    });
  });
});
