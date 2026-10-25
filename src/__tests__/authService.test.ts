import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { AuthService } from '../services/authService';
import { SecureTokenStorage } from '../storage/secureStorage';

describe('AuthService Integration & Logic', () => {
  beforeEach(async () => {
    await SecureTokenStorage.clearTokens();
  });

  test('prevents public ADMIN role registration to protect against privilege escalation', async () => {
    try {
      await AuthService.register({
        fullName: 'Attacker Admin',
        emailOrPhone: 'admin@farm.com',
        role: 'ADMIN' as unknown as 'FARM_OWNER',
        password: 'password123',
      });
      assert.fail('Should have rejected ADMIN registration');
    } catch (err: unknown) {
      const errObj = err as { code: string; status: number };
      assert.strictEqual(errObj.code, 'ACCESS_DENIED');
      assert.strictEqual(errObj.status, 403);
    }
  });

  test('logout clears local SecureTokenStorage tokens unconditionally', async () => {
    await SecureTokenStorage.saveTokens('access_test', 'refresh_test');
    await AuthService.logout();

    const hasTokens = await SecureTokenStorage.hasTokens();
    assert.strictEqual(hasTokens, false);
    assert.strictEqual(await SecureTokenStorage.getAccessToken(), null);
    assert.strictEqual(await SecureTokenStorage.getRefreshToken(), null);
  });

  test('logout completes local cleanup even when server is unreachable or errors', async () => {
    await SecureTokenStorage.saveTokens('expired_access_token', 'invalid_refresh_token');

    // AuthService.logout() handles server errors in catch block and executes finally cleanup
    await AuthService.logout();

    const hasTokens = await SecureTokenStorage.hasTokens();
    assert.strictEqual(hasTokens, false);
  });

  test('restoreSession returns null after logout', async () => {
    await SecureTokenStorage.saveTokens('valid_access', 'valid_refresh');
    await AuthService.logout();

    const user = await AuthService.restoreSession();
    assert.strictEqual(user, null);
  });
});
