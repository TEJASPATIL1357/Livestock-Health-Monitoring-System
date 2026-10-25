import { test, describe } from 'node:test';
import assert from 'node:assert';
import { formatApiUrl } from '../configuration/env';

describe('Environment & API URL Resolution', () => {
  test('formats empty or undefined API URL with default fallback', () => {
    const formatted = formatApiUrl(undefined, 'http://localhost:8085/api/v1');
    assert.strictEqual(formatted, 'http://localhost:8085/api/v1');
  });

  test('appends /api/v1 to base URL if missing', () => {
    const formatted = formatApiUrl('http://10.58.113.19:8085');
    assert.strictEqual(formatted, 'http://10.58.113.19:8085/api/v1');
  });

  test('normalizes /v1 suffix to /api/v1', () => {
    const formatted = formatApiUrl('http://10.58.113.19:8085/v1');
    assert.strictEqual(formatted, 'http://10.58.113.19:8085/api/v1');
  });

  test('preserves existing /api/v1 suffix without duplicate trailing slashes', () => {
    const formatted = formatApiUrl('http://10.58.113.19:8085/api/v1///');
    assert.strictEqual(formatted, 'http://10.58.113.19:8085/api/v1');
  });
});
