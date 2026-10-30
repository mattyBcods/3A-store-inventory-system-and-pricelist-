import { test } from 'vitest';
import assert from 'node:assert/strict';
import {
  filterProducts,
  getStockStatus,
  validateProduct,
  CATEGORIES,
} from '../frontend/domain/inventory.js';

const product = (overrides = {}) => ({
  id: 1,
  name: 'Rice',
  category: CATEGORIES[0],
  brand: '3A',
  variant: '1 kg',
  price: 50,
  stock: 11,
  image: '',
  ...overrides,
});

test('stock status uses the 0, 10 and 11 boundaries', () => {
  assert.equal(getStockStatus(product({ stock: 0 })), 'out');
  assert.equal(getStockStatus(product({ stock: 10 })), 'low');
  assert.equal(getStockStatus(product({ stock: '11' })), 'available');
});

test('search combines with category, availability and stock alerts', () => {
  const products = [
    product(),
    product({ id: 2, name: 'Corned Beef', category: CATEGORIES[1], brand: 'Argentina', stock: 3 }),
  ];
  assert.equal(
    filterProducts(products, {
      search: ' ARGENTINA ',
      category: CATEGORIES[1],
      availability: 'low',
      alertsOnly: true,
    }).length,
    1,
  );
  assert.equal(filterProducts(products, { search: 'Rice', availability: 'out' }).length, 0);
  assert.equal(filterProducts(products, { search: 'canned goods' }).length, 1);
});

test('price boundaries match the visible labels', () => {
  const products = [49, 50, 100, 101].map((price, id) => product({ id, price }));
  assert.deepEqual(
    filterProducts(products, { price: '0-50' }).map((p) => p.price),
    [49],
  );
  assert.deepEqual(
    filterProducts(products, { price: '50-100', sort: 'price' }).map((p) => p.price),
    [50, 100],
  );
  assert.deepEqual(
    filterProducts(products, { price: '100-' }).map((p) => p.price),
    [101],
  );
});

test('sorting does not mutate the inventory', () => {
  const products = [
    product({ id: 1, name: 'Zebra', price: 100 }),
    product({ id: 2, name: 'Apple', price: 10 }),
  ];
  assert.equal(filterProducts(products, { sort: 'name' })[0].name, 'Apple');
  assert.equal(filterProducts(products, { sort: 'price-desc' })[0].price, 100);
  assert.equal(products[0].name, 'Zebra');
});

test('product validation rejects invalid or excessive numeric input', () => {
  for (const invalid of [
    { price: NaN },
    { price: Infinity },
    { price: -1 },
    { stock: 1.5 },
    { stock: -1 },
    { stock: 2147483648 },
    { name: ' ' },
    { category: 'Unknown' },
  ]) {
    assert.throws(() => validateProduct(product(invalid)));
  }
  assert.equal(validateProduct(product({ stock: 0, price: 0 })).stock, 0);
});
