import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAssetQueryString,
  maskAssetSensitiveValue,
  formatAssetCurrency,
  AssetHttpClient,
  AssetApiError,
} from './client';
import { getAssetPermission } from '../../hooks/useAssetPermission';

describe('Asset Management API Client & 10-Role RBAC Utilities', () => {
  test('buildAssetQueryString serializes defined parameters and skips blanks', () => {
    const qs = buildAssetQueryString({
      category: 'Laptop',
      status: '',
      page: 1,
      lowStockOnly: true,
    });
    assert.equal(qs, '?category=Laptop&page=1&lowStockOnly=true');
  });

  test('maskAssetSensitiveValue masks serial/IMEI leaving last 4 characters', () => {
    assert.equal(maskAssetSensitiveValue('C02X9481ABCD'), '••••-••••-ABCD');
    assert.equal(maskAssetSensitiveValue('9876'), '••••');
    assert.equal(maskAssetSensitiveValue(''), '••••••••');
  });

  test('formatAssetCurrency formats values via Intl.NumberFormat', () => {
    const formatted = formatAssetCurrency(85000, 'INR', 'en-IN');
    assert.ok(formatted.includes('85,000'));
    assert.equal(formatAssetCurrency(null), '—');
  });

  test('AssetHttpClient retries GET on 503 and throws AssetApiError on 403', async () => {
    let attempts = 0;
    const client = new AssetHttpClient(
      'https://api.example.com',
      async () => {
        attempts += 1;
        if (attempts === 1) {
          return new Response(JSON.stringify({ message: 'Service Unavailable' }), {
            status: 503,
          });
        }
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      }
    );

    const res = await client.request<{ ok: boolean }>('GET', '/register', undefined, {
      retriesForGet: 1,
    });
    assert.equal(res.ok, true);
    assert.equal(attempts, 2);

    const forbiddenClient = new AssetHttpClient(
      'https://api.example.com',
      async () =>
        new Response(JSON.stringify({ message: 'Forbidden Role' }), {
          status: 403,
        })
    );

    await assert.rejects(
      () => forbiddenClient.request('POST', '/settings', {}),
      (err: unknown) => {
        assert.ok(err instanceof AssetApiError);
        assert.equal(err.isPermissionDenied(), true);
        return true;
      }
    );
  });

  test('10-Role RBAC matrix grants AssetAdmin full access and restricts Employee from Depreciation', () => {
    const adminPerm = getAssetPermission('depreciation', 'asset_admin');
    assert.equal(adminPerm.canView, true);
    assert.equal(adminPerm.canEdit, true);
    assert.equal(adminPerm.canRevealSensitive, true);

    const empDeprPerm = getAssetPermission('depreciation', 'employee');
    assert.equal(empDeprPerm.canView, false);
    assert.equal(empDeprPerm.canEdit, false);

    const empPortalPerm = getAssetPermission('employee-portal', 'employee');
    assert.equal(empPortalPerm.canView, true);
    assert.equal(empPortalPerm.canEdit, true);
  });
});
