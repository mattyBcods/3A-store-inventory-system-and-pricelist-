/** Small-store inventory, saved only to this browser's local storage. */
export class LocalProductRepository {
  constructor(storage, seed, { key = '3a-store-inventory', legacyKey = '3a-demo-inventory' } = {}) {
    this.storage = storage;
    this.seed = seed;
    this.key = key;
    this.legacyKey = legacyKey;
    this.sequenceKey = `${key}-sequence`;
  }

  readStored() {
    const saved = this.storage.getItem(this.key);
    if (saved !== null) {
      const products = JSON.parse(saved);
      if (!Array.isArray(products))
        throw new Error('Inventory data is invalid. Restore a JSON backup.');
      return products;
    }
    const legacy = this.storage.getItem(this.legacyKey);
    const products = legacy === null ? structuredClone(this.seed) : JSON.parse(legacy);
    if (!Array.isArray(products)) throw new Error('Saved inventory is invalid.');
    this.write(products);
    this.storage.removeItem?.(this.legacyKey);
    return products;
  }

  list() {
    return this.readStored();
  }

  save(product) {
    const products = this.readStored();
    const largestId = Math.max(0, ...products.map((item) => Number(item.id)));
    const sequence = Math.max(largestId, Number(this.storage.getItem(this.sequenceKey)) || 0);
    const id = product.id ? Number(product.id) : sequence + 1;
    if (product.id && !products.some((item) => Number(item.id) === id)) {
      throw new Error('This product no longer exists. Refresh the inventory.');
    }
    const saved = { ...product, id };
    this.write([...products.filter((item) => Number(item.id) !== id), saved]);
    this.storage.setItem(this.sequenceKey, String(Math.max(sequence, id)));
    return saved;
  }

  remove(id) {
    const products = this.readStored();
    if (!products.some((item) => Number(item.id) === Number(id))) {
      throw new Error('This product no longer exists. Refresh the inventory.');
    }
    this.write(products.filter((item) => Number(item.id) !== Number(id)));
  }

  replace(products) {
    const ids = new Set();
    for (const product of products) {
      const id = Number(product.id);
      if (!Number.isSafeInteger(id) || id < 1 || ids.has(id)) {
        throw new Error('Backup contains missing, invalid, or repeated product IDs.');
      }
      ids.add(id);
    }
    this.write(products);
    this.storage.setItem(this.sequenceKey, String(Math.max(0, ...ids)));
  }

  write(products) {
    try {
      this.storage.setItem(this.key, JSON.stringify(products));
    } catch {
      throw new Error('Browser storage is full. Remove large images or export a JSON backup.');
    }
  }
}
