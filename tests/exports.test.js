import { test } from 'vitest';
import assert from 'node:assert/strict';
import { buildExcelCsv, buildWordDocument, buildBackup } from '../frontend/utils/exports.js';

const product = {
  id: 1,
  name: '=formula & <Rice>',
  category: 'Rice and Grains',
  brand: '3A',
  variant: '1 kg',
  price: 50,
  stock: 10,
};

test('Excel CSV preserves UTF-8, prices and formula-safe product text', () => {
  const csv = buildExcelCsv([product]);
  assert.ok(csv.startsWith('\ufeff'));
  assert.match(csv, /"'=formula & <Rice>"/);
  assert.match(csv, /"50"/);
  assert.match(csv, /"Low stock"/);
});

test('Word price list escapes text and contains every product', () => {
  const word = buildWordDocument([product, { ...product, id: 2, name: 'Corned beef' }]);
  assert.match(word, /3A STORE/);
  assert.match(word, /=formula &amp; &lt;Rice&gt;/);
  assert.match(word, /Corned beef/);
  assert.doesNotMatch(word, /<script/i);
});

test('JSON backup includes its format marker and full inventory', () => {
  const backup = JSON.parse(buildBackup([product]));
  assert.equal(backup.format, '3a-store-inventory');
  assert.deepEqual(backup.products, [product]);
});
