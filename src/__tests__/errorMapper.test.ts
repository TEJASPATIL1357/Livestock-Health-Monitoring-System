import { test, describe } from 'node:test';
import assert from 'node:assert';
import { getAuthErrorMessageKey } from '../utils/errorMapper';

describe('ErrorMapper', () => {
  test('maps INVALID_CREDENTIALS to auth.errors.invalidCredentials', () => {
    const err = { code: 'INVALID_CREDENTIALS', status: 401 };
    assert.strictEqual(getAuthErrorMessageKey(err), 'auth.errors.invalidCredentials');
  });

  test('maps ACCOUNT_SUSPENDED to auth.errors.accountSuspended', () => {
    const err = { code: 'ACCOUNT_SUSPENDED', status: 403 };
    assert.strictEqual(getAuthErrorMessageKey(err), 'auth.errors.accountSuspended');
  });

  test('maps ACCOUNT_DEACTIVATED to auth.errors.accountDeactivated', () => {
    const err = { code: 'ACCOUNT_DEACTIVATED', status: 403 };
    assert.strictEqual(getAuthErrorMessageKey(err), 'auth.errors.accountDeactivated');
  });

  test('maps ACCOUNT_NOT_VERIFIED to auth.errors.accountNotVerified', () => {
    const err = { code: 'ACCOUNT_NOT_VERIFIED', status: 403 };
    assert.strictEqual(getAuthErrorMessageKey(err), 'auth.errors.accountNotVerified');
  });

  test('maps DUPLICATE_RESOURCE to auth.errors.emailAlreadyExists', () => {
    const err = { code: 'DUPLICATE_RESOURCE', status: 409 };
    assert.strictEqual(getAuthErrorMessageKey(err), 'auth.errors.emailAlreadyExists');
  });

  test('maps TOKEN_EXPIRED and REFRESH_TOKEN_INVALID to auth.errors.sessionExpired', () => {
    assert.strictEqual(getAuthErrorMessageKey({ code: 'TOKEN_EXPIRED', status: 401 }), 'auth.errors.sessionExpired');
    assert.strictEqual(getAuthErrorMessageKey({ code: 'REFRESH_TOKEN_INVALID', status: 401 }), 'auth.errors.sessionExpired');
  });

  test('maps network errors to auth.errors.networkError', () => {
    assert.strictEqual(getAuthErrorMessageKey({ code: 'CLIENT_ERROR', status: 500 }), 'auth.errors.networkError');
    assert.strictEqual(getAuthErrorMessageKey(new Error('Failed to fetch')), 'auth.errors.networkError');
  });

  test('fallback for unknown errors', () => {
    assert.strictEqual(getAuthErrorMessageKey(null), 'auth.errors.unexpectedError');
    assert.strictEqual(getAuthErrorMessageKey({ code: 'SOMETHING_ELSE', status: 500 }), 'auth.errors.unexpectedError');
  });
});
