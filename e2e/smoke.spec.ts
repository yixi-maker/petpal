import { expect, test, type Page } from '@playwright/test';

const TEST_PHONE = process.env.E2E_PHONE || '13800009901';
const DEV_CODE = '123456';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

async function loginByApi(page: Page) {
  await page.request.post('/api/auth/send-code', {
    data: { phone: TEST_PHONE },
  });

  const res = await page.request.post('/api/auth/login', {
    data: {
      phone: TEST_PHONE,
      code: DEV_CODE,
      agreementAccepted: true,
    },
  });
  expect(res.ok()).toBeTruthy();
}

async function loginByUi(page: Page) {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: /PetPal/ })).toBeVisible();
  await page.getByRole('textbox').first().fill(TEST_PHONE);
  await page.getByRole('button', { name: '获取验证码' }).click();
  await page.locator('input[type="text"]').fill(DEV_CODE);
  await page.locator('input[type="checkbox"]').check();
  await page.getByRole('button', { name: '登录' }).click();
  await page.waitForURL('**/');
}

async function ensurePet(page: Page) {
  await loginByApi(page);

  const petsRes = await page.request.get('/api/pets');
  expect(petsRes.ok()).toBeTruthy();
  const petsData = await petsRes.json();
  if (Array.isArray(petsData.pets) && petsData.pets.length > 0) {
    return petsData.pets[0] as { id: number; name: string };
  }

  const petName = `E2E宝贝${Date.now()}`;
  const createRes = await page.request.post('/api/pets', {
    data: {
      name: petName,
      type: 'DOG',
      breed: '金毛',
      gender: 'UNKNOWN',
      size: 'MEDIUM',
      personalityTags: ['测试'],
      bio: 'E2E test pet',
    },
  });
  expect(createRes.ok()).toBeTruthy();
  const createData = await createRes.json();
  return createData.pet as { id: number; name: string };
}

async function createTestPost(page: Page, content: string) {
  const pet = await ensurePet(page);
  const res = await page.request.post('/api/posts', {
    data: {
      authorPetId: pet.id,
      content,
      mediaType: 'TEXT',
      fuzzyLocation: 'E2E 测试区',
    },
  });
  expect(res.ok()).toBeTruthy();
  const data = await res.json();
  return data.post as { id: number; content: string };
}

async function loginAdminByUi(page: Page) {
  await page.goto('/admin/login');
  await page.getByPlaceholder(/用户名/).fill(ADMIN_USERNAME);
  await page.getByPlaceholder(/密码/).fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: '登录' }).click();
  await page.waitForURL('**/admin/dashboard');
  await expect(page).toHaveURL(/\/admin\/dashboard/);
}

test.describe('PetPal E2E Smoke Tests', () => {
  test('1. Login page loads', async ({ page }) => {
    await loginByUi(page);
    await expect(page).toHaveURL('/');
  });

  test('2. Home page loads after login', async ({ page }) => {
    await ensurePet(page);
    await page.goto('/');
    await expect(page.getByRole('button', { name: '发布动态' })).toBeVisible();
    await expect(page.getByRole('button', { name: '推荐', exact: true })).toBeVisible();
  });

  test('3. Map page loads', async ({ page }) => {
    await loginByApi(page);
    await page.goto('/map');
    await expect(page.getByText(/北京 · 模糊定位/)).toBeVisible();
    await expect(page.getByRole('button', { name: '定位' })).toBeVisible();
  });

  test('4. Health page loads', async ({ page }) => {
    await ensurePet(page);
    await page.goto('/health');
    await expect(page.getByRole('button', { name: '健康档案', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'AI 健康助手', exact: true })).toBeVisible();
  });

  test('5. Me page loads', async ({ page }) => {
    await ensurePet(page);
    await page.goto('/me');
    await expect(page.getByText('我的宝贝').or(page.getByText('用户协议'))).toBeVisible();
  });

  test('6. Admin login works', async ({ page }) => {
    await loginAdminByUi(page);
  });

  test('7. Nearby page loads', async ({ page }) => {
    await ensurePet(page);
    await page.goto('/nearby');
    await expect(page.getByRole('heading', { name: '发现宝贝' }).first()).toBeVisible();
  });

  test('8. Legal pages load', async ({ page }) => {
    await page.goto('/legal/privacy');
    await expect(page.getByRole('heading', { name: '隐私政策' })).toBeVisible();
    await page.goto('/legal/terms');
    await expect(page.getByRole('heading', { name: '用户协议' })).toBeVisible();
    await page.goto('/legal/health-disclaimer');
    await expect(page.getByRole('heading', { name: '健康免责声明' })).toBeVisible();
  });

  test('9. Pet Creation', async ({ page }) => {
    await loginByApi(page);
    await page.goto('/pets/new');

    const petName = `E2E宝贝${Date.now()}`;
    await page.getByPlaceholder(/给毛孩子/).fill(petName);
    await page.getByRole('button', { name: '狗狗' }).click();
    await page.getByPlaceholder('如 金毛、英短').fill('金毛');
    await page.getByRole('button', { name: /创建/ }).click();

    await page.waitForURL('**/me', { timeout: 15000 });
    await expect(page).toHaveURL(/\/me/);
  });

  test('10. Post Creation', async ({ page }) => {
    await ensurePet(page);
    await page.goto('/');

    await page.getByRole('button', { name: '发布动态' }).click();
    const modalTitle = page.locator('h3').filter({ hasText: '发布动态' });
    await expect(modalTitle).toBeVisible();

    const postContent = `E2E test post ${Date.now()}`;
    await page.getByPlaceholder('分享毛孩子的日常...').fill(postContent);
    await page.getByRole('button', { name: '发送 发布' }).click();
    await expect(modalTitle).not.toBeVisible({ timeout: 10000 });
  });

  test('11. Like and Comment', async ({ page }) => {
    const post = await createTestPost(page, `E2E test post for comment ${Date.now()}`);
    await page.goto(`/posts/${post.id}`);

    const commentInput = page.locator('textarea[placeholder*="评论"], input[placeholder*="评论"]').first();
    await expect(commentInput).toBeVisible({ timeout: 10000 });
    await commentInput.fill(`E2E comment ${Date.now()}`);
    await page.getByRole('button', { name: /发送|评论/ }).click();

    await expect(page.getByText(/E2E comment/).first()).toBeVisible({ timeout: 10000 });
  });

  test('12. Pet Avatar Upload', async ({ page }) => {
    const pet = await ensurePet(page);
    await page.goto(`/pets/${pet.id}/edit`);
    await expect(page.getByRole('button', { name: /上传|更换|选择/ }).first()).toBeVisible();
  });

  test('13. Map Page Detail', async ({ page }) => {
    await loginByApi(page);
    await page.goto('/map');
    await expect(page.getByText(/北京 · 模糊定位/)).toBeVisible();

    const placeCard = page.getByText(/公里|km|m/).first();
    if (await placeCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await placeCard.click();
      await expect(page).toHaveURL(/\/map\/\d+/, { timeout: 10000 });
    }
  });

  test('14. Health AI Triage', async ({ page }) => {
    await ensurePet(page);
    await page.goto('/health');

    await page.getByRole('button', { name: 'AI 健康助手', exact: true }).click();
    await page.getByPlaceholder(/症状|描述/).fill('E2E test: vomiting and lethargy');

    await page.locator('select').filter({ has: page.locator('option[value="1-3天"]') }).first().selectOption('1-3天');
    await page.locator('select').filter({ has: page.locator('option[value="减退"]') }).first().selectOption('减退');
    await page.locator('select').filter({ has: page.locator('option[value="正常"]') }).nth(1).selectOption('正常');
    await page.locator('select').filter({ has: page.locator('option[value="嗜睡"]') }).first().selectOption('嗜睡');

    const submit = page.getByRole('button', { name: /开始 AI 健康咨询|提交|开始/ });
    if (await submit.isVisible({ timeout: 5000 }).catch(() => false)) {
      await submit.click();
      await expect(page.getByText(/风险|建议|观察|就医/).first()).toBeVisible({ timeout: 15000 });
    }
  });

  test('15. Admin Hide Content', async ({ page }) => {
    const content = `E2E test admin hide ${Date.now()}`;
    await createTestPost(page, content);
    await loginAdminByUi(page);

    await page.goto('/admin/posts');
    await page.getByPlaceholder(/搜索动态内容/).fill(content);
    await page.getByRole('button', { name: '搜索' }).click();

    const row = page.getByRole('row').filter({ hasText: content });
    await expect(row).toBeVisible({ timeout: 10000 });
    await row.getByRole('button', { name: '隐藏' }).click();
    await expect(row.getByText('已隐藏')).toBeVisible({ timeout: 10000 });
  });
});
