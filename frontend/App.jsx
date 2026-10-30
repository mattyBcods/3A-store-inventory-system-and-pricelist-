import { useEffect, useMemo, useState } from 'react';
import { filterProducts, LOW_STOCK_LIMIT } from './domain/inventory.js';
import { useInventory } from './hooks/useInventory.js';
import { useTheme, useToast } from './hooks/usePreferences.js';
import { buildBackup, downloadBackup, downloadExcel, downloadWord } from './utils/exports.js';
import { createEnvironment } from './services/environment.js';
import Sidebar from './components/Sidebar.jsx';
import { CategoryGrid, DashboardOverview, StatsCards } from './components/Dashboard.jsx';
import ProductTable from './components/ProductTable.jsx';
import ProductForm from './components/ProductForm.jsx';
import { DeleteDialog } from './components/AuthDialogs.jsx';

const viewLabels = {
  dashboard: [
    'Store overview',
    'A fresh look at your inventory. Everything you need, all in one place.',
    'Overview',
  ],
  products: [
    'Product price list',
    'Every product, every price. Keep your everyday essentials in order.',
    'Product price list',
  ],
  stock: ['Stock alerts', 'Keep an eye on products that need a little attention.', 'Stock alerts'],
  categories: ['Product categories', 'A place for every essential on your shelves.', 'Categories'],
};

function PrintPriceList({ products }) {
  const price = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });
  return (
    <section className="print-document">
      <h1>3A STORE</h1>
      <h2>Product Price List</h2>
      <p>
        {products.length} products · Printed {new Date().toLocaleDateString('en-PH')}
      </p>
      <table>
        <thead>
          <tr>
            <th>Product ID</th>
            <th>Product</th>
            <th>Category</th>
            <th>Brand</th>
            <th>Size / Variant</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Availability</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>3A-{String(product.id).padStart(4, '0')}</td>
              <td>{product.name}</td>
              <td>{product.category}</td>
              <td>{product.brand || '—'}</td>
              <td>{product.variant || '—'}</td>
              <td>{price.format(product.price)}</td>
              <td>{product.stock}</td>
              <td>
                {Number(product.stock) === 0
                  ? 'Out of stock'
                  : Number(product.stock) <= LOW_STOCK_LIMIT
                    ? 'Low stock'
                    : 'In stock'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default function App({ environment = createEnvironment() }) {
  const { toast, notify } = useToast();
  const inventory = useInventory(environment.repository, notify);
  const { dark, toggleTheme } = useTheme(environment.storage);
  const [view, setView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    availability: '',
    price: '',
    sort: 'new',
  });
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [printing, setPrinting] = useState(false);
  const [backupError, setBackupError] = useState('');
  const [backupInputKey, setBackupInputKey] = useState(0);
  const [title, subtitle, breadcrumb] = viewLabels[view];
  const visibleProducts = useMemo(
    () => filterProducts(inventory.products, { ...filters, alertsOnly: view === 'stock' }),
    [inventory.products, filters, view],
  );
  const alerts = inventory.products.filter(
    (product) => Number(product.stock) <= LOW_STOCK_LIMIT,
  ).length;

  useEffect(() => {
    const finishPrinting = () => setPrinting(false);
    window.addEventListener('afterprint', finishPrinting);
    return () => window.removeEventListener('afterprint', finishPrinting);
  }, []);

  function navigate(next) {
    setView(next);
    setSidebarOpen(false);
  }
  function selectCategory(category) {
    setFilters({ search: '', category, availability: '', price: '', sort: 'new' });
    navigate('products');
  }
  async function adjustStock(product, change) {
    if (inventory.busy) return;
    try {
      await inventory.saveProduct({ ...product, stock: Number(product.stock) + change });
    } catch (error) {
      notify(error.message);
    }
  }
  function printEveryProduct() {
    setPrinting(true);
    window.requestAnimationFrame(() => window.print());
  }

  async function restoreBackup(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBackupError('');
    try {
      if (file.size > 25 * 1024 * 1024) throw new Error('Backup file must be smaller than 25 MB.');
      const backup = JSON.parse(await file.text());
      if (
        backup?.format !== '3a-store-inventory' ||
        backup.version !== 1 ||
        !Array.isArray(backup.products)
      ) {
        throw new Error('Choose a valid 3A STORE inventory backup.');
      }
      if (
        !window.confirm(
          `Replace this inventory with ${backup.products.length} products from the backup?`,
        )
      )
        return;
      await inventory.restoreProducts(backup.products);
    } catch (error) {
      setBackupError(error.message);
    } finally {
      setBackupInputKey((key) => key + 1);
    }
  }

  return (
    <>
      <div id="app-shell">
        <Sidebar
          view={view}
          onNavigate={navigate}
          alerts={alerts}
          dark={dark}
          onTheme={toggleTheme}
          open={sidebarOpen}
        />
        {sidebarOpen && (
          <button
            className="sidebar-backdrop"
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <main>
          <header>
            <button
              id="menu"
              aria-label="Toggle navigation"
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen((open) => !open)}
            >
              ☰
            </button>
            <div className="breadcrumb">
              Workspace <span>/</span>
              <strong>{breadcrumb}</strong>
            </div>
            <div className="header-right">
              <span>
                {inventory.busy
                  ? '● Saving…'
                  : inventory.loading
                    ? '● Loading…'
                    : '● Saved on this device'}
              </span>
              <span className="avatar small-avatar">A</span>
            </div>
          </header>
          <div className="content">
            <div className="page-heading">
              <div>
                <div className="eyebrow">YOUR STORE, AT A GLANCE</div>
                <h1>
                  {title}
                  <span>.</span>
                </h1>
                <p>{subtitle}</p>
              </div>
              <button
                className="primary"
                onClick={() => setEditing({})}
                disabled={inventory.loading || inventory.busy}
              >
                ＋ Add product
              </button>
            </div>
            {(inventory.error || backupError) && (
              <div className="app-error" role="alert">
                {backupError || inventory.error}{' '}
                <button
                  className="secondary"
                  onClick={() => {
                    setBackupError('');
                    inventory.refresh();
                  }}
                >
                  Dismiss / retry
                </button>
              </div>
            )}
            <StatsCards
              products={inventory.products}
              onSelect={(label) => {
                if (label === 'Categories') navigate('categories');
                else if (label === 'Total products') navigate('products');
                else navigate('stock');
              }}
            />
            {view === 'dashboard' && (
              <DashboardOverview
                products={inventory.products}
                onManage={() => navigate('products')}
                onSelectCategory={selectCategory}
                onRestock={() => navigate('stock')}
              />
            )}
            {view === 'categories' ? (
              <CategoryGrid products={inventory.products} onSelect={selectCategory} />
            ) : (
              <ProductTable
                products={visibleProducts}
                total={inventory.products.length}
                alertsOnly={view === 'stock'}
                filters={filters}
                onFilter={setFilters}
                onEdit={setEditing}
                onDelete={setDeleting}
                onStockAdjust={adjustStock}
                busy={inventory.busy}
                loading={inventory.loading}
                onExport={() => downloadExcel(inventory.products)}
                onExportWord={() => downloadWord(inventory.products)}
                onBackup={() => downloadBackup(inventory.products)}
                onRestore={restoreBackup}
                backupInputKey={backupInputKey}
                onPrint={printEveryProduct}
              />
            )}
            <footer>
              © {new Date().getFullYear()} 3A STORE <span>Saved locally on this device.</span>
            </footer>
          </div>
        </main>
        {editing && (
          <ProductForm
            key={editing.id || 'new'}
            product={editing}
            onSave={inventory.saveProduct}
            onClose={() => setEditing(null)}
            busy={inventory.busy}
          />
        )}
        {deleting && (
          <DeleteDialog
            product={deleting}
            onConfirm={inventory.deleteProduct}
            onClose={() => setDeleting(null)}
            busy={inventory.busy}
          />
        )}
        <div id="toast" className={toast ? 'show' : ''} role="status">
          {toast}
        </div>
      </div>
      {printing && <PrintPriceList products={inventory.products} />}
    </>
  );
}
