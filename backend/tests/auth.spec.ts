import {
  test,
  expect,
  request,
  APIRequestContext,
} from '@playwright/test';

const adminCredentials = {
  email: 'adm@gmail.com',
  password: '123456',
};

test.describe('Auth API', () => {
  test('should login with admin credentials and return access token', async ({ request }) => {
    const response = await request.post('/auth/login', {
      data: adminCredentials,
    });

    expect(response.status(), 'login status').toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('access_token');
    expect(body.user.email).toBe(adminCredentials.email);
  });
});

test.describe('Protected endpoints', () => {
  let token: string;
  let apiRequest: APIRequestContext;

  test.beforeAll(async ({ playwright, baseURL }) => {
    apiRequest = await playwright.request.newContext({ baseURL });
    const loginResponse = await apiRequest.post('/auth/login', {
      data: adminCredentials,
    });
    expect(loginResponse.ok()).toBeTruthy();
    const { access_token } = await loginResponse.json();
    token = access_token;
  });

  test('should list animais', async () => {
    const response = await apiRequest.get('/animais', {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.ok()).toBeTruthy();
    const animais = await response.json();
    expect(Array.isArray(animais)).toBeTruthy();
  });

  test('should list instituições', async () => {
    const response = await apiRequest.get('/instituicoes', {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.ok()).toBeTruthy();
    const instituicoes = await response.json();
    expect(Array.isArray(instituicoes)).toBeTruthy();
  });
});
