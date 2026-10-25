import { test, describe } from 'node:test';
import assert from 'node:assert';
import { SecureTokenStorage } from '../storage/secureStorage';

describe('SecureTokenStorage', () => {
  test('saves and retrieves access and refresh tokens', async () => {
    await SecureTokenStorage.saveTokens('access_123', 'refresh_456');

    const access = await SecureTokenStorage.getAccessToken();
    const refresh = await SecureTokenStorage.getRefreshToken();
    const hasTokens = await SecureTokenStorage.hasTokens();

    assert.strictEqual(access, 'access_123');
    assert.strictEqual(refresh, 'refresh_456');
    assert.strictEqual(hasTokens, true);
  });

  test('clears tokens properly', async () => {
    await SecureTokenStorage.saveTokens('access_abc', 'refresh_xyz');
    await SecureTokenStorage.clearTokens();

    const access = await SecureTokenStorage.getAccessToken();
    const refresh = await SecureTokenStorage.getRefreshToken();
    const hasTokens = await SecureTokenStorage.hasTokens();

    assert.strictEqual(access, null);
    assert.strictEqual(refresh, null);
    assert.strictEqual(hasTokens, false);
  });

  test('returns hasTokens false if one token is missing', async () => {
    await SecureTokenStorage.clearTokens();
    await SecureTokenStorage.setItem('slh_access_token', 'only_access');

    const hasTokens = await SecureTokenStorage.hasTokens();
    assert.strictEqual(hasTokens, false);

    await SecureTokenStorage.clearTokens();
  });
});
