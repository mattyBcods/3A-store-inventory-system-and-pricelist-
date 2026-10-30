import { CATEGORIES, CATEGORY_ICONS, STATUS_LABELS, getStockStatus } from '../domain/inventory.js';

const currency = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

function ProductFilters({ filters, onChange }) {
  const setFilter = (event) => onChange({ ...filters, [event.target.name]: event.target.value });
  return (
    <div className="filters">
      <label className="search">
        <span aria-hidden="true">⌕</span>
        <input
          name="search"
          value={filters.search}
          onChange={setFilter}
          placeholder="Search products, brands, categories…"
          aria-label="Search products"
        />
      </label>
      <select
        name="category"
        value={filters.category}
        onChange={setFilter}
        aria-label="Filter category"
      >
        <option value="">All categories</option>
        {CATEGORIES.map((name) => (
          <option key={name}>{name}</option>
        ))}
      </select>
      <select
        name="availability"
        value={filters.availability}
        onChange={setFilter}
        aria-label="Filter availability"
      >
        <option value="">All availability</option>
        <option value="available">In stock</option>
        <option value="low">Low stock</option>
        <option value="out">Out of stock</option>
      </select>
      <select name="price" value={filters.price} onChange={setFilter} aria-label="Filter price">
        <option value="">All prices</option>
        <option value="0-50">Under ₱50</option>
        <option value="50-100">₱50–₱100</option>
        <option value="100-">Above ₱100</option>
      </select>
      <select name="sort" value={filters.sort} onChange={setFilter} aria-label="Sort products">
        <option value="new">Newest first</option>
        <option value="name">Name A–Z</option>
        <option value="price">Price: low to high</option>
        <option value="price-desc">Price: high to low</option>
      </select>
    </div>
  );
}

function ProductThumbnail({ product }) {
  if (/^data:image\/(png|jpeg|webp);base64,/.test(product.image || '')) {
    return <img className="product-thumb" src={product.image} alt="" />;
  }
  return (
    <span className="product-thumb" aria-hidden="true">
      {CATEGORY_ICONS[CATEGORIES.indexOf(product.category)] || '🛒'}
    </span>
  );
}

export default function ProductTable({
  products,
  total,
  alertsOnly,
  filters,
  onFilter,
  onEdit,
  onDelete,
  onStockAdjust,
  onExport,
  onExportWord,
  onBackup,
  onRestore,
  backupInputKey,
  onPrint,
  busy,
  loading,
}) {
  return (
    <section className="inventory-panel" aria-label="Product inventory">
      <div className="section-top table-heading">
        <div>
          <h3>
            {alertsOnly ? 'Products to restock' : 'Product inventory'} <span>{total}</span>
          </h3>
          <p>Your prices and stock, always within reach.</p>
        </div>
        <div className="export-actions">
          <button onClick={onExport}>↓ Excel CSV</button>
          <button onClick={onExportWord}>↓ Word</button>
          <button onClick={onBackup}>↓ Backup</button>
          <label
            className="file-action"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ')
                event.currentTarget.querySelector('input').click();
            }}
          >
            ↑ Restore
            <input
              key={backupInputKey}
              type="file"
              accept="application/json,.json"
              onChange={onRestore}
              hidden
            />
          </label>
          <button onClick={onPrint}>▧ Print all</button>
        </div>
      </div>
      <ProductFilters filters={filters} onChange={onFilter} />
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {['PRODUCT', 'CATEGORY', 'BRAND', 'SIZE / VARIANT', 'PRICE', 'STOCK', 'STATUS'].map(
                (title) => (
                  <th key={title} scope="col">
                    {title}
                  </th>
                ),
              )}
              <th className="actions-col" scope="col">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const status = getStockStatus(product);
              return (
                <tr key={product.id}>
                  <td>
                    <div className="product-cell">
                      <ProductThumbnail product={product} />
                      <div>
                        <strong>{product.name}</strong>
                        <small>3A-{String(product.id).padStart(4, '0')}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="category-tag">{product.category}</span>
                  </td>
                  <td>{product.brand || '—'}</td>
                  <td>{product.variant || '—'}</td>
                  <td className="price">{currency.format(product.price)}</td>
                  <td className={`stock-${status}`}>
                    <div className="stock-control">
                      <button
                        className="stock-adjust"
                        aria-label={`Reduce ${product.name} stock`}
                        disabled={busy || Number(product.stock) === 0}
                        onClick={() => onStockAdjust(product, -1)}
                      >
                        −
                      </button>
                      <span className="stock-value">{Number(product.stock)}</span>
                      <button
                        className="stock-adjust"
                        aria-label={`Increase ${product.name} stock`}
                        disabled={busy}
                        onClick={() => onStockAdjust(product, 1)}
                      >
                        +
                      </button>
                    </div>
                    <span className="stock-unit">units</span>
                  </td>
                  <td>
                    <span className={`badge-status ${status}`}>● {STATUS_LABELS[status]}</span>
                  </td>
                  <td className="actions-col">
                    <button
                      className="row-action"
                      aria-label={`Edit ${product.name}`}
                      onClick={() => onEdit(product)}
                      disabled={busy}
                    >
                      ✎
                    </button>
                    <button
                      className="row-action"
                      aria-label={`Delete ${product.name}`}
                      onClick={() => onDelete(product)}
                      disabled={busy}
                    >
                      ⌫
                    </button>
                  </td>
                </tr>
              );
            })}
            {!products.length && (
              <tr>
                <td colSpan="8" className="empty">
                  {loading
                    ? 'Loading inventory…'
                    : 'No products found. Add a product or adjust your filters.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        <span>
          Showing {products.length} of {total} products
        </span>
        <span>
          Low stock: 10 items or fewer <i className="status-dot" />
        </span>
      </div>
    </section>
  );
}
