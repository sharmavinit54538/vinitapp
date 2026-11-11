import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildOnboardingQueryString,
  maskOnboardingSensitiveId,
  OnboardingHttpClient,
  OnboardingApiError,
} from './client';
import { getOnboardingPermission } from '../../hooks/useOnboardingPermission';

describe('Onboarding API Client & RBAC Utilities', () => {
  test('buildOnboardingQueryString serializes defined parameters and skips blanks', () => {
    const qs = buildOnboardingQueryString({
      stage: 'PreBoarding',
      department: '',
      page: 2,
      readyOnly: true,
    });
    assert.equal(qs, '?stage=PreBoarding&page=2&readyOnly=true');
  });

  test('maskOnboardingSensitiveId masks sensitive IDs leaving last 4 characters', () => {
    assert.equal(maskOnboardingSensitiveId('123456789012'), '••••-••••-9012');
    assert.equal(maskOnboardingSensitiveId('1234'), '••••');
    assert.equal(maskOnboardingSensitiveId(''), '••••••••');
  });

  test('OnboardingHttpClient retries GET on 502 and throws OnboardingApiError on 403', async () => {
    let attempts = 0;
    const client = new OnboardingHttpClient(
      'https://api.example.com',
      async () => {
        attempts += 1;
        if (attempts === 1) {
          return new Response(JSON.stringify({ message: 'Bad Gateway' }), {
            status: 502,
          });
        }
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }
    );

    const res = await client.request<{ ok: boolean }>('GET', '/joiners', undefined, {
      retriesForGet: 1,
    });
    assert.equal(res.ok, true);
    assert.equal(attempts, 2);

    const forbiddenClient = new OnboardingHttpClient(
      'https://api.example.com',
      async () =>
        new Response(JSON.stringify({ message: 'Forbidden Role' }), {
          status: 403,
        })
    );

    await assert.rejects(
      () => forbiddenClient.request('POST', '/settings', {}),
      (err: unknown) => {
        assert.ok(err instanceof OnboardingApiError);
        assert.equal(err.isPermissionDenied(), true);
        return true;
      }
    );
  });

  test('RBAC matrix grants SuperAdmin full access and restricts NewJoiner from Settings', () => {
    const adminPerm = getOnboardingPermission('settings', 'super_admin');
    assert.equal(adminPerm.canView, true);
    assert.equal(adminPerm.canEdit, true);
    assert.equal(adminPerm.canRevealSensitive, true);

    const joinerSettingsPerm = getOnboardingPermission('settings', 'new_joiner');
    assert.equal(joinerSettingsPerm.canView, false);
    assert.equal(joinerSettingsPerm.canEdit, false);

    const joinerPortalPerm = getOnboardingPermission('joiner-portal', 'new_joiner');
    assert.equal(joinerPortalPerm.canView, true);
    assert.equal(joinerPortalPerm.canEdit, true);
  });
});
