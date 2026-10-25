/**
 * Local Database Interface Stub
 *
 * This provides the abstraction boundary for future SQLite local storage
 * and offline synchronization engine (Module 1 Architecture Foundation).
 */

export interface SyncQueueItem {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string;
  payload: Record<string, unknown>;
  createdAt: string;
  synced: boolean;
}

export interface LocalDatabaseDriver {
  initialize(): Promise<void>;
  isInitialized(): boolean;
  enqueueOfflineMutation(action: SyncQueueItem['action'], entity: string, payload: Record<string, unknown>): Promise<void>;
  getPendingSyncQueue(): Promise<SyncQueueItem[]>;
  clearSyncedQueue(): Promise<void>;
}

class LocalDatabaseStub implements LocalDatabaseDriver {
  private initialized = false;
  private queue: SyncQueueItem[] = [];

  async initialize(): Promise<void> {
    this.initialized = true;
    // SQLite table initialization logic for future offline sync module
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async enqueueOfflineMutation(
    action: SyncQueueItem['action'],
    entity: string,
    payload: Record<string, unknown>
  ): Promise<void> {
    this.queue.push({
      id: Math.random().toString(36).substring(7),
      action,
      entity,
      payload,
      createdAt: new Date().toISOString(),
      synced: false,
    });
  }

  async getPendingSyncQueue(): Promise<SyncQueueItem[]> {
    return this.queue.filter((q) => !q.synced);
  }

  async clearSyncedQueue(): Promise<void> {
    this.queue = this.queue.filter((q) => !q.synced);
  }
}

export const LocalDatabase: LocalDatabaseDriver = new LocalDatabaseStub();
