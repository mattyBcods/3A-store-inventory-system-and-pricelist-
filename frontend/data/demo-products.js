/** Sample products are used only in the explicitly labeled demo. */
const sample = [
  ['Jasmine Rice', 'Rice and Grains', 'Royal Umbrella', '1 kg', 68, 48],
  ['Corned Beef', 'Canned Goods', 'Argentina', '175 g', 42.5, 32],
  ['Pancit Canton', 'Instant Noodles', 'Lucky Me!', 'Chilimansi · 80 g', 16, 8],
  ['Original Coffee', 'Coffee and Milk', 'Nescafé', 'Classic · 50 g', 92, 24],
  ['Chocolate Cookies', 'Snacks and Biscuits', 'Oreo', 'Original · 133 g', 39, 18],
  ['Coca-Cola Original', 'Soft Drinks and Beverages', 'Coca-Cola', '1.5 L', 72, 0],
  ['Powdered Milk', 'Coffee and Milk', 'Bear Brand', '150 g', 58, 21],
  ['Liquid Detergent', 'Laundry and Cleaning Supplies', 'Ariel', 'Sunrise Fresh · 810 ml', 149, 7],
  ['Soy Sauce', 'Condiments and Seasonings', 'Silver Swan', '385 ml', 29, 36],
  ['Sardines in Tomato Sauce', 'Canned Goods', 'Ligo', '155 g', 25, 52],
  ['Bath Soap', 'Personal Care', 'Safeguard', 'Pure White · 90 g', 45, 25],
  ['Iodized Salt', 'Condiments and Seasonings', 'Fidel', '500 g', 18, 30],
].map((p, i) => ({
  id: i + 1,
  name: p[0],
  category: p[1],
  brand: p[2],
  variant: p[3],
  price: p[4],
  stock: p[5],
  image: '',
}));

export default sample;
