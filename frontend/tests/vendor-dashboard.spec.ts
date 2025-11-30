import { test, expect } from '@playwright/test';

test.describe('Vendor dashboard pipeline', () => {
  test('shows mock pipeline after upload', async ({ page }) => {
    await page.goto('/');
    await page.goto('/vendor/dashboard');

    await expect(page.getByText('Vendor Console')).toBeVisible();
    await page.getByRole('button', { name: /mock mode/i }).click();
    await expect(page.getByText(/media · uploaded/i)).toBeVisible();

    await page.getByRole('button', { name: /Upload to pipeline/i }).click();
    await expect(page.getByText(/Media sent to pipeline/i)).toBeVisible();
  });
});

