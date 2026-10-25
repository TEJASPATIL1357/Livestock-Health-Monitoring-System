import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { FarmService } from '../services/farmService';
import { HttpClient } from '../services/httpClient';

describe('FarmService', () => {
  test('createFarm formats request payload cleanly', async () => {
    let capturedUrl = '';
    let capturedBody: any = null;

    const originalPost = HttpClient.post;
    HttpClient.post = async <T>(url: string, body?: unknown) => {
      capturedUrl = url;
      capturedBody = body;
      return {
        data: {
          id: 'farm-uuid-1',
          name: (body as any).name,
          district: (body as any).district,
          state: (body as any).state,
          country: (body as any).country,
          livestockType: (body as any).livestockType,
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        } as unknown as T,
        status: 201,
      };
    };

    try {
      const result = await FarmService.createFarm({
        name: '  Green Acres Farm  ',
        district: 'Kolhapur',
        state: 'Maharashtra',
        country: 'India',
        livestockType: 'DAIRY',
      });

      assert.equal(capturedUrl, '/farms');
      assert.equal(capturedBody.name, 'Green Acres Farm');
      assert.equal(capturedBody.livestockType, 'DAIRY');
      assert.equal(result.id, 'farm-uuid-1');
      assert.equal(result.status, 'ACTIVE');
    } finally {
      HttpClient.post = originalPost;
    }
  });

  test('getMyFarms retrieves authenticated user memberships', async () => {
    let capturedUrl = '';

    const originalGet = HttpClient.get;
    HttpClient.get = async <T>(url: string) => {
      capturedUrl = url;
      return {
        data: [
          {
            id: 'membership-uuid-1',
            farmId: 'farm-uuid-1',
            userId: 'user-uuid-1',
            role: 'FARM_OWNER',
            status: 'ACTIVE',
            farm: {
              id: 'farm-uuid-1',
              name: 'Green Acres Farm',
              livestockType: 'DAIRY',
              status: 'ACTIVE',
              createdAt: new Date().toISOString(),
            },
            createdAt: new Date().toISOString(),
          },
        ] as unknown as T,
        status: 200,
      };
    };

    try {
      const memberships = await FarmService.getMyFarms();
      assert.equal(capturedUrl, '/farms/me');
      assert.equal(memberships.length, 1);
      assert.equal(memberships[0].role, 'FARM_OWNER');
      assert.equal(memberships[0].farm.name, 'Green Acres Farm');
    } finally {
      HttpClient.get = originalGet;
    }
  });
});
