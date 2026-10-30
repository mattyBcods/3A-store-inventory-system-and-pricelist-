/** Pure inventory rules. This file has no DOM, network, or storage dependencies. */
const LOW_STOCK_LIMIT = 10;
const MAX_PRICE = 9999999999.99;
const MAX_STOCK = 2147483647;
const CATEGORIES = [
  'Rice and Grains',
  'Canned Goods',
  'Instant Noodles',
  'Coffee and Milk',
  'Snacks and Biscuits',
  'Soft Drinks and Beverages',
  'Personal Care',
  'Laundry and Cleaning Supplies',
  'Condiments and Seasonings',
  'Other Grocery Products',
];
const CATEGORY_ICONS = ['🌾', '🥫', '🍜', '☕', '🍪', '🥤', '🧴', '🧺', '🧂', '🛒'];
const STATUS_LABELS = { out: 'Out of stock', low: 'Low stock', available: 'In stock' };

function getStockStatus(product) {
  const quantity = Number(product.stock);
  if (quantity === 0) return 'out';
  return quantity <= LOW_STOCK_LIMIT ? 'low' : 'available';
}

function filterProducts(products, filters = {}) {
  const query = (filters.search || '').trim().toLowerCase();
  const priceRange = filters.price || '';
  const list = products.filter((product) => {
    const matchesSearch = [product.name, product.brand, product.category].some((value) =>
      String(value).toLowerCase().includes(query),
    );
    if (!matchesSearch) return false;
    if (filters.category && product.category !== filters.category) return false;
    if (filters.availability && getStockStatus(product) !== filters.availability) return false;
    if (filters.alertsOnly && Number(product.stock) > LOW_STOCK_LIMIT) return false;
    const price = Number(product.price);
    if (priceRange === '0-50' && price >= 50) return false;
    if (priceRange === '50-100' && (price < 50 || price > 100)) return false;
    if (priceRange === '100-' && price <= 100) return false;
    return true;
  });

  const comparators = {
    name: (a, b) => a.name.localeCompare(b.name),
    price: (a, b) => Number(a.price) - Number(b.price),
    'price-desc': (a, b) => Number(b.price) - Number(a.price),
    new: (a, b) => Number(b.id) - Number(a.id),
  };
  return list.sort(comparators[filters.sort] || comparators.new);
}

function validateProduct(product) {
  if (!String(product.name || '').trim() || product.name.length > 160) {
    throw new Error('Enter a product name of 1–160 characters.');
  }
  if (!CATEGORIES.includes(product.category)) throw new Error('Choose a valid category.');
  if (String(product.brand || '').length > 100 || String(product.variant || '').length > 100) {
    throw new Error('Brand and variant must each be 100 characters or fewer.');
  }
  if (!Number.isFinite(product.price) || product.price < 0 || product.price > MAX_PRICE) {
    throw new Error('Enter a valid, non-negative price.');
  }
  if (!Number.isInteger(product.stock) || product.stock < 0 || product.stock > MAX_STOCK) {
    throw new Error('Enter a valid, non-negative whole-number stock quantity.');
  }
  return product;
}

export {
  CATEGORIES,
  CATEGORY_ICONS,
  STATUS_LABELS,
  LOW_STOCK_LIMIT,
  getStockStatus,
  filterProducts,
  validateProduct,
};
