import { test, expect } from '@playwright/test';

const email = 'e2euser_storage@test.com';
const password = 'testpassword';

test('setup auth', async ({ page }) => {
  // Création du compte si besoin
  await page.goto('http://localhost:4200/signup');
  await page.fill('input[formcontrolname="email"]', email);
  await page.fill('input[formcontrolname="password"]', password);
  await page.fill('input[formcontrolname="confirmPassword"]', password);
  await page.click('button[type="submit"]');
  // On tente la redirection, mais on ignore l'échec (compte déjà existant)
  try {
    await expect(page).toHaveURL(/mes-fichiers/, { timeout: 5000 });
  } catch (e) {
    // Si on reste sur /signup, on suppose que le compte existe déjà
  }

  // Login pour générer le storageState
  await page.goto('http://localhost:4200/login');
  await page.fill('input[formcontrolname="email"]', email);
  await page.fill('input[formcontrolname="password"]', password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/mes-fichiers/);

  await page.context().storageState({ path: 'frontend/tests/e2e/storageState.json' });
});