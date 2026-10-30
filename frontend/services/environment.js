import demoProducts from '../data/demo-products.js';
import { LocalProductRepository } from './repositories.js';

/** Inventory remains on this computer and browser. */
export function createEnvironment({ storage } = {}) {
  const browserStorage = storage ?? {
    getItem: (key) => window.localStorage.getItem(key),
    setItem: (key, value) => window.localStorage.setItem(key, value),
    removeItem: (key) => window.localStorage.removeItem(key),
  };
  return {
    storage: browserStorage,
    repository: new LocalProductRepository(browserStorage, demoProducts),
  };
}
