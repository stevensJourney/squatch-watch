import { Capacitor } from '@capacitor/core';
import { IndexDBFileSystemStorageAdapter, LocalStorageAdapter } from '@powersync/web';
import { CapacitorLocalStorage } from './CapacitorLocalStorage';

export { CapacitorLocalStorage } from './CapacitorLocalStorage';
export { SupabaseRemoteStorage } from './SupabaseRemoteStorage';

/**
 * Create the appropriate local storage adapter for the current platform
 */
export function createLocalStorageAdapter(): LocalStorageAdapter {
  const isNative = Capacitor.isNativePlatform();

  if (isNative) {
    return new CapacitorLocalStorage();
  } else {
    return new IndexDBFileSystemStorageAdapter('squatch-watch-files');
  }
}
