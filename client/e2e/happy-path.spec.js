// unauth && / --> login --> home --> edit (persists) --> logout && clears token --> /login
import { test, expect } from '@playwright/test';
import { ACTIVE_USER, E2E_PHONE, TOKEN_KEY } from './fixtures.js';
import { loginAs } from './login.js';

test.beforeAll(async ({ request }) => {
  const res = await request.get('/api/health');
  if (!res.ok()) {
    throw new Error(
      'Stack not reachable at BASE_URL (default http://localhost:82). Start with: make dev',
    );
  }
});

test.beforeEach(async ({ page }) => {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate((key) => localStorage.removeItem(key), TOKEN_KEY);
  await expect(page.getByTestId('login-submit')).toBeEnabled();
});

test('guest visiting home is redirected to login', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/login/);
});

test('login, view balance, edit phone, logout clears token', async ({ page }) => {
  await loginAs(page);
  await expect(page.getByText('Balance')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(ACTIVE_USER.balance)).toBeVisible();
  await expect(page.getByText(ACTIVE_USER.email).first()).toBeVisible();

  await page.getByTestId('edit-profile').click();
  await expect(page.getByTestId('save-profile')).toBeEnabled();
  await page.getByTestId('edit-phone').fill(E2E_PHONE);
  await page.getByTestId('save-profile').click();

  await expect(page.getByText(E2E_PHONE)).toBeVisible();

  await page.reload();
  await expect(page.getByText(E2E_PHONE)).toBeVisible();

  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL(/\/login/);

  const token = await page.evaluate((key) => localStorage.getItem(key), TOKEN_KEY);
  expect(token).toBeNull();
});
