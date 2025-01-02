import { createId, isCuid } from '@paralleldrive/cuid2';

export function randomCUID2() {
  return createId();
}

export function isCUID2(id: string): boolean {
  if (typeof id !== 'string') {
    return false;
  }
  return isCuid(id);
}
