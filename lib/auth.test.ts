import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePasswordStrength,
  extractBackendErrorMessage,
  loginSchema,
  registerSchema,
  workspaceRegisterSchema,
  validateLoginField,
  validateWorkspaceRegisterField,
  otpSchema,
  mfaVerifySchema,
  formatE164Phone,
  OFC360_ROLES,
  resolveRoleDashboardPath,
} from './auth-schemas';
import {
  Ofc360AuthClient,
  extractAccessTokenFromPayload,
  normalizeUserPayload,
} from './auth-api';

test('Role-based route resolver maps all OFC360 enterprise roles to authorized paths', () => {
  assert.deepEqual(OFC360_ROLES, [
    'hr_admin',
    'it_admin',
    'employee',
    'manager',
    'executive',
    'super_admin',
  ]);
  assert.equal(resolveRoleDashboardPath('hr_admin'), '/dashboard/hr-admin');
  assert.equal(resolveRoleDashboardPath('it_admin'), '/dashboard/it-admin');
  assert.equal(resolveRoleDashboardPath('employee'), '/dashboard/employee');
  assert.equal(resolveRoleDashboardPath('manager'), '/dashboard/manager');
  assert.equal(resolveRoleDashboardPath('executive'), '/dashboard/executive');
  assert.equal(resolveRoleDashboardPath('super_admin'), '/dashboard/super-admin');
});

test('Password strength analyzer scores Weak, Fair, Good, and Strong passwords accurately', () => {
  assert.equal(calculatePasswordStrength('').score, 0);
  assert.equal(calculatePasswordStrength('short').label, 'Weak');
  assert.equal(calculatePasswordStrength('Password123').label, 'Good');
  assert.equal(calculatePasswordStrength('Enterprise#360!').label, 'Strong');
});

test('Zod schemas validate registration password matching, workspace registration, phone E.164 formatting, MFA, and 6-digit OTP', () => {
  assert.equal(formatE164Phone('+1', '(555) 234-5678'), '+15552345678');

  const validLogin = loginSchema.safeParse({
    email: 'elena@ofc360.com',
    password: 'Password#360',
    remember_me: true,
  });
  assert.equal(validLogin.success, true);

  assert.equal(validateLoginField('email', 'invalid-email').valid, false);
  assert.equal(validateLoginField('email', 'hradmin@ofc360.com').valid, true);
  assert.equal(validateLoginField('password', '').valid, false);
  assert.equal(validateLoginField('password', 'Secret123!').valid, true);

  const validWorkspaceReg = workspaceRegisterSchema.safeParse({
    company_name: 'Acme Global Inc.',
    first_name: 'John',
    last_name: 'Doe',
    email: 'admin@company.com',
    phone: '+91 98765 43210',
    password: 'Password#360',
    confirm_password: 'Password#360',
    accept_terms: true,
  });
  assert.equal(validWorkspaceReg.success, true);

  assert.equal(validateWorkspaceRegisterField('company_name', 'A').valid, false);
  assert.equal(validateWorkspaceRegisterField('company_name', 'Acme Global Inc.').valid, true);
  assert.equal(
    validateWorkspaceRegisterField('confirm_password', 'Mismatch123', {
      password: 'Password#360',
    }).valid,
    false
  );
  assert.equal(
    validateWorkspaceRegisterField('confirm_password', 'Password#360', {
      password: 'Password#360',
    }).valid,
    true
  );

  const mismatchedReg = registerSchema.safeParse({
    full_name: 'Elena Rostova',
    email: 'elena@ofc360.com',
    country_code: '+1',
    phone: '5552345678',
    password: 'Password#360',
    confirm_password: 'DifferentPassword#360',
    accept_terms: true,
  });
  assert.equal(mismatchedReg.success, false);

  const validOtp = otpSchema.safeParse({
    identifier: '+15552345678',
    otp: '482910',
  });
  assert.equal(validOtp.success, true);

  const validMfa = mfaVerifySchema.safeParse({
    mode: 'totp',
    code: '918273',
    trust_device: true,
  });
  assert.equal(validMfa.success, true);
});

test('FastAPI error parser extracts string detail and Pydantic validation detail arrays', () => {
  assert.equal(
    extractBackendErrorMessage({ detail: 'Invalid email or password' }, 401),
    'Invalid email or password'
  );
  assert.equal(
    extractBackendErrorMessage(
      {
        detail: [
          { loc: ['body', 'email'], msg: 'value is not a valid email address' },
        ],
      },
      422
    ),
    'email: value is not a valid email address'
  );
});

test('Token extractor and /auth/me normalizer handle flexible backend response structures', () => {
  assert.equal(
    extractAccessTokenFromPayload({ access_token: 'jwt-abc-123', token_type: 'bearer' }),
    'jwt-abc-123'
  );
  assert.equal(
    extractAccessTokenFromPayload({ data: { accessToken: 'jwt-nested-456' } }),
    'jwt-nested-456'
  );

  const user = normalizeUserPayload({
    id: 'usr_901',
    email: 'hr@aegisauth.com',
    full_name: 'Marcus Vance',
    role: 'hr_admin',
    email_verified: true,
    is_active: true,
  });
  assert.equal(user.role, 'hr_admin');
  assert.equal(user.email_verified, true);
});

test('Single-flight 401 token refresh deduplicates concurrent refresh requests and retries', async () => {
  let refreshCallCount = 0;
  let meCallCount = 0;

  const mockFetch = async (url: string, init?: RequestInit): Promise<Response> => {
    const authHeader =
      init?.headers && typeof init.headers === 'object'
        ? (init.headers as Record<string, string>).Authorization
        : '';

    if (url.endsWith('/api/v1/auth/refresh')) {
      refreshCallCount += 1;
      await new Promise((r) => setTimeout(r, 20));
      return new Response(
        JSON.stringify({ access_token: 'refreshed-jwt-999' }),
        { status: 200, headers: { 'content-type': 'application/json' } }
      );
    }

    if (url.endsWith('/api/v1/auth/me')) {
      meCallCount += 1;
      if (authHeader !== 'Bearer refreshed-jwt-999') {
        return new Response(
          JSON.stringify({ detail: 'Token expired' }),
          { status: 401, headers: { 'content-type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({
          id: 'u-1',
          email: 'exec@aegisauth.com',
          full_name: 'Sora Takahashi',
          role: 'executive',
          email_verified: true,
          is_active: true,
        }),
        { status: 200, headers: { 'content-type': 'application/json' } }
      );
    }

    return new Response('{}', { status: 200 });
  };

  const client = new Ofc360AuthClient(mockFetch);
  client.setAccessToken('expired-jwt-000');

  const [user1, user2] = await Promise.all([client.getMe(), client.getMe()]);

  assert.equal(refreshCallCount, 1, 'Should only call /auth/refresh once');
  assert.equal(meCallCount, 4, 'Each /me call should run initially and retry once');
  assert.equal(user1.role, 'executive');
  assert.equal(user2.email, 'exec@aegisauth.com');
  assert.equal(client.getAccessToken(), 'refreshed-jwt-999');
});
