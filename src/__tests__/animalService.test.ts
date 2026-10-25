import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { AnimalService } from '../services/animalService';
import { DeviceService } from '../services/deviceService';
import { HttpClient } from '../services/httpClient';

describe('AnimalService & DeviceService Integration (Module 3A)', () => {
  test('createAnimal posts correct payload to /animals endpoint', async () => {
    let capturedUrl = '';
    let capturedBody: any = null;

    const originalPost = HttpClient.post;
    HttpClient.post = async <T>(url: string, body?: unknown) => {
      capturedUrl = url;
      capturedBody = body;
      return {
        data: {
          id: 'animal-uuid-1',
          farmId: (body as any).farmId,
          name: (body as any).name,
          tagNumber: (body as any).tagNumber,
          species: (body as any).species || 'CATTLE',
          breed: (body as any).breed,
          dateOfBirth: (body as any).dateOfBirth,
          gender: (body as any).gender,
          status: 'HEALTHY',
          createdAt: new Date().toISOString(),
        } as unknown as T,
        status: 201,
      };
    };

    try {
      const result = await AnimalService.createAnimal({
        farmId: 'farm-123',
        name: 'Gauri',
        tagNumber: 'TAG-101',
        species: 'CATTLE',
        breed: 'Gir',
        gender: 'FEMALE',
        dateOfBirth: '2023-05-12',
      });

      assert.equal(capturedUrl, '/animals');
      assert.equal(capturedBody.farmId, 'farm-123');
      assert.equal(capturedBody.name, 'Gauri');
      assert.equal(capturedBody.tagNumber, 'TAG-101');
      assert.equal(capturedBody.species, 'CATTLE');
      assert.equal(result.id, 'animal-uuid-1');
      assert.equal(result.status, 'HEALTHY');
    } finally {
      HttpClient.post = originalPost;
    }
  });

  test('getAnimalsByFarm fetches animals for specific farm', async () => {
    let capturedUrl = '';

    const originalGet = HttpClient.get;
    HttpClient.get = async <T>(url: string) => {
      capturedUrl = url;
      return {
        data: [
          {
            id: 'animal-uuid-1',
            farmId: 'farm-123',
            name: 'Gauri',
            tagNumber: 'TAG-101',
            species: 'CATTLE',
            status: 'HEALTHY',
          },
        ] as unknown as T,
        status: 200,
      };
    };

    try {
      const animals = await AnimalService.getAnimalsByFarm('farm-123');
      assert.equal(capturedUrl, '/animals/farm/farm-123');
      assert.equal(animals.length, 1);
      assert.equal(animals[0].name, 'Gauri');
    } finally {
      HttpClient.get = originalGet;
    }
  });

  test('assignDevice puts correct payload to /devices/{deviceId}/assign', async () => {
    let capturedUrl = '';
    let capturedBody: any = null;

    const originalPut = HttpClient.put;
    HttpClient.put = async <T>(url: string, body?: unknown) => {
      capturedUrl = url;
      capturedBody = body;
      return {
        data: {
          id: 'device-123',
          deviceIdentifier: 'ESP32-COLLAR-001',
          farmId: 'farm-123',
          animalId: (body as any).animalId,
          animalName: 'Gauri',
          status: 'ACTIVE',
        } as unknown as T,
        status: 200,
      };
    };

    try {
      const updatedDevice = await DeviceService.assignDevice('device-123', 'animal-uuid-1');
      assert.equal(capturedUrl, '/devices/device-123/assign');
      assert.equal(capturedBody.animalId, 'animal-uuid-1');
      assert.equal(updatedDevice.animalId, 'animal-uuid-1');
      assert.equal(updatedDevice.animalName, 'Gauri');
    } finally {
      HttpClient.put = originalPut;
    }
  });
});
