import { test } from 'vitest';
import assert from 'node:assert/strict';
import { LocalProductRepository } from '../frontend/services/repositories.js';

function makeStorage(initial = []) {
  const values = new Map(initial);
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}

test('local inventory persists add, edit, and delete across reloads', () => {
  const storage = makeStorage();
  const repository = new LocalProductRepository(storage, [{ id: 1, name: 'Rice' }]);
  assert.equal(repository.list()[0].name, 'Rice');
  const added = repository.save({ name: 'Coffee' });
  repository.save({ ...added, name: 'Milk' });
  assert.equal(new LocalProductRepository(storage, []).list()[1].name, 'Milk');
  repository.remove(added.id);
  assert.deepEqual(repository.list(), [{ id: 1, name: 'Rice' }]);
});

test('legacy browser demo inventory migrates to permanent local storage', () => {
  const products = [{ id: 7, name: 'Saved rice' }];
  const storage = makeStorage([['3a-demo-inventory', JSON.stringify(products)]]);
  const repository = new LocalProductRepository(storage, []);
  assert.deepEqual(repository.list(), products);
  assert.equal(storage.getItem('3a-demo-inventory'), null);
  assert.deepEqual(JSON.parse(storage.getItem('3a-store-inventory')), products);
});

test('backup replaces inventory and rejects repeated IDs', () => {
  const repository = new LocalProductRepository(makeStorage(), [{ id: 1, name: 'Rice' }]);
  repository.list();
  repository.replace([{ id: 9, name: 'New stock' }]);
  assert.deepEqual(repository.list(), [{ id: 9, name: 'New stock' }]);
  assert.throws(() => repository.replace([{ id: 1 }, { id: 1 }]), /repeated product IDs/);
});

test('storage quota errors explain how to recover', () => {
  const repository = new LocalProductRepository(
    {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    },
    [],
  );
  assert.throws(() => repository.list(), /Browser storage is full/);
});
