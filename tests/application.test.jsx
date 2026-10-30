// @vitest-environment jsdom
import { afterEach, expect, test } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import App from '../frontend/App.jsx';
import { createEnvironment } from '../frontend/services/environment.js';

afterEach(() => {
  cleanup();
  document.body.classList.remove('dark');
});

function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

function demoEnvironment(storage = memoryStorage()) {
  return createEnvironment({ storage });
}

test('React UI adds, edits, persists and deletes products with confirmation', async () => {
  const storage = memoryStorage();
  let application = render(<App environment={demoEnvironment(storage)} />);
  await screen.findByText('Jasmine Rice');
  fireEvent.click(screen.getByRole('button', { name: /Add product/ }));
  const form = screen.getByRole('dialog', { name: 'Add product' });
  fireEvent.change(within(form).getByLabelText('Product name'), {
    target: { value: 'Fresh Test Rice' },
  });
  fireEvent.change(within(form).getByLabelText('Selling price (₱)'), {
    target: { value: '75.50' },
  });
  fireEvent.change(within(form).getByLabelText('Stock quantity'), { target: { value: '12' } });
  fireEvent.click(within(form).getByRole('button', { name: 'Save product' }));
  await screen.findByText('Fresh Test Rice');
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

  fireEvent.click(screen.getByRole('button', { name: 'Edit Fresh Test Rice' }));
  const editForm = screen.getByRole('dialog', { name: 'Edit product' });
  fireEvent.change(within(editForm).getByLabelText('Selling price (₱)'), {
    target: { value: '79' },
  });
  fireEvent.change(within(editForm).getByLabelText('Stock quantity'), { target: { value: '0' } });
  fireEvent.click(within(editForm).getByRole('button', { name: 'Save product' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  let row = screen.getByRole('row', { name: /Fresh Test Rice/ });
  expect(within(row).getByText('₱79.00')).toBeTruthy();
  expect(within(row).getByText(/Out of stock/)).toBeTruthy();

  application.unmount();
  application = render(<App environment={demoEnvironment(storage)} />);
  await screen.findByText('Fresh Test Rice');
  row = screen.getByRole('row', { name: /Fresh Test Rice/ });
  expect(within(row).getByText('₱79.00')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Delete Fresh Test Rice' }));
  const confirmation = screen.getByRole('dialog', { name: 'Delete this product?' });
  expect(screen.getByText('Fresh Test Rice', { selector: 'strong' })).toBeTruthy();
  fireEvent.click(within(confirmation).getByRole('button', { name: 'Delete product' }));
  await waitFor(() => expect(screen.queryByText('Fresh Test Rice')).toBeNull());
  expect(JSON.parse(storage.getItem('3a-store-inventory'))).toHaveLength(12);
});

test('React search and combined filters update results immediately', async () => {
  render(<App environment={demoEnvironment()} />);
  await screen.findByText('Jasmine Rice');
  fireEvent.change(screen.getByRole('textbox', { name: 'Search products' }), {
    target: { value: 'Argentina' },
  });
  expect(screen.getByText('Corned Beef')).toBeTruthy();
  expect(screen.queryByText('Jasmine Rice')).toBeNull();
  fireEvent.change(screen.getByRole('combobox', { name: 'Filter category' }), {
    target: { value: 'Coffee and Milk' },
  });
  expect(screen.getByText(/No products found/)).toBeTruthy();
  fireEvent.change(screen.getByRole('textbox', { name: 'Search products' }), {
    target: { value: '' },
  });
  expect(screen.getByText('Original Coffee')).toBeTruthy();
  expect(screen.getByText('Powdered Milk')).toBeTruthy();
});

test('React navigation, category links and persistent theme work', async () => {
  const environment = demoEnvironment();
  render(<App environment={environment} />);
  await screen.findByText('Jasmine Rice');
  fireEvent.click(screen.getByRole('button', { name: /Switch to dark mode/ }));
  expect(document.body.classList.contains('dark')).toBe(true);
  expect(environment.storage.getItem('3a-theme')).toBe('dark');
  fireEvent.click(screen.getByRole('button', { name: /Categories/ }));
  const categories = screen.getByRole('region', { name: 'Product categories' });
  fireEvent.click(within(categories).getAllByRole('button', { name: 'View products →' })[0]);
  expect(screen.getByRole('combobox', { name: 'Filter category' }).value).toBe('Rice and Grains');
  expect(screen.getByText('Jasmine Rice')).toBeTruthy();
  expect(screen.queryByText('Corned Beef')).toBeNull();
});

test('inventory opens without a sign-in or network request', async () => {
  render(<App environment={createEnvironment({ storage: memoryStorage() })} />);
  await screen.findByText('Jasmine Rice');
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(screen.getByText(/Saved on this device/)).toBeTruthy();
});

test('failed persistence keeps the form open and does not report success', async () => {
  const storage = memoryStorage();
  const environment = demoEnvironment(storage);
  environment.repository.save = async () => {
    throw new Error('Storage full');
  };
  render(<App environment={environment} />);
  await screen.findByText('Jasmine Rice');
  fireEvent.click(screen.getByRole('button', { name: /Add product/ }));
  const form = screen.getByRole('dialog', { name: 'Add product' });
  fireEvent.change(within(form).getByLabelText('Product name'), {
    target: { value: 'Unsaved product' },
  });
  fireEvent.change(within(form).getByLabelText('Selling price (₱)'), { target: { value: '1' } });
  fireEvent.change(within(form).getByLabelText('Stock quantity'), { target: { value: '1' } });
  fireEvent.click(within(form).getByRole('button', { name: 'Save product' }));
  await within(form).findByText('Storage full');
  expect(screen.queryByText('Product saved successfully')).toBeNull();
  expect(storage.getItem('3a-store-inventory')).not.toBeNull();
});
