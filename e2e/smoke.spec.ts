import { test, expect } from '@playwright/test';

const TEST_PHONE = '13800009901';
const DEV_CODE = '123456';

test.describe('PetPal E2E Smoke Tests', () => {

  test('1. Login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText('PetPal');
    await page.fill('input[type="tel"]', TEST_PHONE);
    await page.click('button:has-text("获取验证码")');
    await page.fill('input[type="text"]', DEV_CODE);
    await page.check('input[type="checkbox"]');
    await page.click('button:has-text("登录")');
    await page.waitForURL('**/');
    await expect(page).toHaveURL('/');
  });

  test('2. Home page loads after login', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="tel"]', TEST_PHONE);
    await page.click('button:has-text("获取验证码")');
    await page.fill('input[type="text"]', DEV_CODE);
    await page.check('input[type="checkbox"]');
    await page.click('button:has-text("登录")');
    await page.waitForURL('**/');
    // Home page should have content
    await expect(page).toHaveURL('/');
  });

  test('3. Map page loads', async ({ page }) => {
    await page.goto('/map');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=发现周边').or(page.locator('[class*="map"]'))).toBeVisible();
  });

  test('4. Health page loads', async ({ page }) => {
    await page.goto('/health');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=健康').or(page.locator('text=AI'))).toBeVisible();
  });

  test('5. Me page loads', async ({ page }) => {
    await page.goto('/me');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=设置').or(page.locator('text=私信'))).toBeVisible();
  });

  test('6. Admin login works', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('input[placeholder*="用户名"]', 'admin');
    await page.fill('input[placeholder*="密码"]', 'admin123');
    await page.click('button:has-text("登录")');
    await page.waitForURL('**/admin/dashboard');
    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });

  test('7. Nearby page loads', async ({ page }) => {
    await page.goto('/nearby');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=发现').or(page.locator('text=附近'))).toBeVisible();
  });

  test('8. Legal pages load', async ({ page }) => {
    await page.goto('/legal/privacy');
    await expect(page.locator('text=隐私')).toBeVisible();
    await page.goto('/legal/terms');
    await expect(page.locator('text=协议')).toBeVisible();
    await page.goto('/legal/health-disclaimer');
    await expect(page.locator('text=免责')).toBeVisible();
  });
});
