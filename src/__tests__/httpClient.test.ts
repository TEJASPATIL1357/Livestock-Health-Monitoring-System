import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { HttpClient } from '../services/httpClient';
import { SecureTokenStorage } from '../storage/secureStorage';

describe('HttpClient Concurrency & Token Management', () => {
  beforeEach(async () => {
    await SecureTokenStorage.clearTokens();
  });

  test('registerSessionExpiredHandler registers and receives session expiration callback', () => {
    let handled = false;
    HttpClient.registerSessionExpiredHandler(() => {
      handled = true;
    });

    // Simulate session handler trigger
    HttpClient['onSessionExpiredCallback']?.();
    assert.strictEqual(handled, true);
  });

  test('bypasses public endpoints from 401 refresh logic', () => {
    const isLoginPublic = HttpClient['isPublicEndpoint']('/auth/login');
    const isRefreshPublic = HttpClient['isPublicEndpoint']('/auth/refresh');
    const isUsersPublic = HttpClient['isPublicEndpoint']('/users');
    const isMeProtected = HttpClient['isPublicEndpoint']('/auth/me');

    assert.strictEqual(isLoginPublic, true);
    assert.strictEqual(isRefreshPublic, true);
    assert.strictEqual(isUsersPublic, true);
    assert.strictEqual(isMeProtected, false);
  });
});
