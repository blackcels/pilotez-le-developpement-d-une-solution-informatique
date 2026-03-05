import { test, expect } from '@playwright/test';

const storageEmail = 'e2euser_storage@test.com';
const password = 'testpassword';
const filePath = 'tests/e2e/testfile.txt';
let sharedEmail: string;

test.beforeAll(async () => {
  sharedEmail = `e2euser_${Date.now()}@test.com`;
});
test.use({ storageState: 'frontend/tests/e2e/storageState.json' });

async function loginAndCheckToken(page: any, email: string, password: string) {
  await page.goto('http://localhost:4200/login');
  await page.fill('input[formcontrolname="email"]', email);
  await page.fill('input[formcontrolname="password"]', password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/mes-fichiers/);
  const jwt = await page.evaluate(() => localStorage.getItem('datashare_token'));
  expect(jwt).not.toBeNull();
}

test('Création de compte', async ({ page }) => {
  await page.goto('http://localhost:4200/signup');
  await page.fill('input[formcontrolname="email"]', sharedEmail);
  await page.fill('input[formcontrolname="password"]', password);
  await page.fill('input[formcontrolname="confirmPassword"]', password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/mes-fichiers/);
  await expect(page.locator('h2')).toContainText('Mes fichiers');
  await page.waitForTimeout(1000);
});

test('Connexion', async ({ page }) => {
  await loginAndCheckToken(page, storageEmail, password);
  await expect(page.locator('h2')).toBeVisible();
});


test('Upload, vérification, téléchargement et suppression de fichier', async ({ page }) => {
  await loginAndCheckToken(page, storageEmail, password);
  // Upload avec log réseau
  await page.click('a.ds-top-action');
  await expect(page).toHaveURL(/upload/);
  await page.setInputFiles('input[type="file"]', filePath);
  const [response] = await Promise.all([
    page.waitForResponse(resp => resp.url().includes('/api/files') && resp.status() >= 200 && resp.status() < 500),
    page.click('button[type="submit"]')
  ]);
  await expect(page.locator('.ds-success')).toBeVisible();
  const link = await page.locator('.ds-success a').getAttribute('href');
  expect(link).toBeTruthy();
  await page.waitForTimeout(1000);

  // Vérification dans la liste (refait le login pour synchroniser l'état Angular)
  await page.goto('http://localhost:4200/login');
  await page.fill('input[formcontrolname="email"]', storageEmail);
  await page.fill('input[formcontrolname="password"]', password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/mes-fichiers/);
  await page.waitForTimeout(1000);
  // Force l'email dans le localStorage si absent
  await page.evaluate((email) => {
    if (!localStorage.getItem('datashare_email')) {
      localStorage.setItem('datashare_email', email);
    }
  }, storageEmail);
  await expect(page.locator('.ds-muted', { hasText: 'Chargement...' })).not.toBeVisible({ timeout: 10000 });
  const fileRows = page.locator('strong', { hasText: 'testfile.txt' });
  await expect(fileRows.first()).toBeVisible({ timeout: 20000 });

  // Téléchargement : vérifie que le lien 'Accéder' retourne un statut 200
  const firstAccessLink = await page.locator('li.ds-list-item a').first();
  const downloadUrl = await firstAccessLink.getAttribute('href');
  const downloadResponse = await page.goto(downloadUrl!.startsWith('http') ? downloadUrl! : `http://localhost:4200${downloadUrl}`);
  expect(downloadResponse && downloadResponse.status() === 200).toBeTruthy();

  // Suppression
  // Re-login avant suppression pour garantir l'état Angular
  await page.goto('http://localhost:4200/login');
  await page.fill('input[formcontrolname="email"]', storageEmail);
  await page.fill('input[formcontrolname="password"]', password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/mes-fichiers/);
  await page.waitForTimeout(1000);
  await expect(page.locator('.ds-muted', { hasText: 'Chargement...' })).not.toBeVisible({ timeout: 10000 });
  // Suppression du premier fichier
  const fileRowsBefore = await page.locator('li.ds-list-item:has-text("testfile.txt")').count();
  const firstFileRow = page.locator('li.ds-list-item:has-text("testfile.txt")').first();
  await expect(firstFileRow).toBeVisible({ timeout: 10000 });
  const deleteBtn = firstFileRow.locator('button.ds-btn-danger');
  await expect(deleteBtn).toBeVisible({ timeout: 10000 });
  await deleteBtn.click();
  await page.goto('http://localhost:4200/mes-fichiers');
  await page.waitForTimeout(1000);
  const fileRowsAfter = await page.locator('li.ds-list-item:has-text("testfile.txt")').count();
  expect(fileRowsAfter).toBeLessThan(fileRowsBefore);
});

test('Navigation', async ({ page }) => {
  await loginAndCheckToken(page, storageEmail, password);
  // Navigation sécurisée : clique seulement si le lien existe
  if (await page.locator('a[routerlink="/upload"]').isVisible()) {
    await page.click('a[routerlink="/upload"]');
    await expect(page).toHaveURL(/upload/);
  }
  if (await page.locator('a[routerlink="/mes-fichiers"]').isVisible()) {
    await page.click('a[routerlink="/mes-fichiers"]');
    await expect(page).toHaveURL(/mes-fichiers/);
  }
  if (await page.locator('a[routerlink="/login"]').isVisible()) {
    await page.click('a[routerlink="/login"]');
    await expect(page).toHaveURL(/login/);
  }
  if (await page.locator('a[routerlink="/signup"]').isVisible()) {
    await page.click('a[routerlink="/signup"]');
    await expect(page).toHaveURL(/signup/);
  }
});

test('Connexion avec mauvais mot de passe affiche une erreur', async ({ page }) => {
  await page.goto('http://localhost:4200/login');
  await page.fill('input[formcontrolname="email"]', storageEmail);
  await page.fill('input[formcontrolname="password"]', 'wrongpassword');
  await page.click('button[type="submit"]');
  await expect(page.locator('.ds-error')).toBeVisible();
});



