import { expect } from '@playwright/test';
import { ACTIVE_USER } from './fixtures.js';

/** Wait for hydrated login form, fill credentials, submit, assert 200 + token. */
export async function loginAs(page, user = ACTIVE_USER) {
  const submit = page.getByTestId('login-submit');
  const emailInput = page.getByLabel('Email');
  const passwordInput = page.getByLabel('Password');

  await expect(submit).toBeEnabled();

  await expect(async () => {
    await emailInput.click();
    await emailInput.fill(user.email);
    await passwordInput.click();
    await passwordInput.fill(user.password);
    await expect(emailInput).toHaveValue(user.email);
    await expect(passwordInput).toHaveValue(user.password);
  }).toPass({ timeout: 15_000 });

  const [res] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/api/auth/login')),
    submit.click(),
  ]);

  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.token).toBeTruthy();

  await expect(page).toHaveURL('/', { timeout: 15_000 });
}
