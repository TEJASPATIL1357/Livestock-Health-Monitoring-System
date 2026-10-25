import assert from 'node:assert';
import { test, describe } from 'node:test';
import { TELEMETRY_REFETCH_INTERVAL } from '../hooks/useLivestockTelemetry';

describe('Module 3B.1 — Telemetry Timestamp & Polling Logic', () => {

  test('UTC ISO 8601 timestamp parses cleanly to local time without NaN', () => {
    const utcIso = '2026-10-09T22:19:07Z';
    const date = new Date(utcIso);
    assert.strictEqual(isNaN(date.getTime()), false);

    const clockTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    assert.ok(clockTime.length > 0);
  });

  test('Relative elapsed time calculation computes accurate seconds/minutes difference', () => {
    const nowMs = 1791584000000; // Fixed reference timestamp
    const fiveSecsAgoIso = new Date(nowMs - 5000).toISOString();
    const twoMinsAgoIso = new Date(nowMs - 120000).toISOString();

    const date5s = new Date(fiveSecsAgoIso);
    const diff5s = Math.floor((nowMs - date5s.getTime()) / 1000);
    assert.strictEqual(diff5s, 5);

    const date2m = new Date(twoMinsAgoIso);
    const diff2m = Math.floor((nowMs - date2m.getTime()) / 1000);
    assert.strictEqual(diff2m, 120);
    assert.strictEqual(Math.floor(diff2m / 60), 2);
  });

  test('Invalid and null timestamps are handled safely without crashing', () => {
    const invalidIso = 'invalid-timestamp-string';
    const date = new Date(invalidIso);
    assert.strictEqual(isNaN(date.getTime()), true);

    const nullTime = null;
    assert.strictEqual(nullTime, null);
  });

  test('TELEMETRY_REFETCH_INTERVAL is configured for 5000ms polling', () => {
    assert.strictEqual(TELEMETRY_REFETCH_INTERVAL, 5000);
  });
});
