import {
  CATEGORIES,
  CATEGORY_ICONS,
  LOW_STOCK_LIMIT,
  getStockStatus,
} from '../domain/inventory.js';

export function summarizeCategories(products) {
  return CATEGORIES.map((name, index) => {
    const matching = products.filter((product) => product.category === name);
    return {
      name,
      icon: CATEGORY_ICONS[index],
      count: matching.length,
      alerts: matching.filter((product) => Number(product.stock) <= LOW_STOCK_LIMIT).length,
    };
  });
}

export function StatsCards({ products, onSelect }) {
  const cards = [
    {
      label: 'Total products',
      count: products.length,
      icon: '▦',
      note: 'Products in your inventory',
    },
    {
      label: 'Low stock',
      count: products.filter((item) => getStockStatus(item) === 'low').length,
      icon: '◔',
      note: 'Time to plan a restock',
    },
    {
      label: 'Out of stock',
      count: products.filter((item) => getStockStatus(item) === 'out').length,
      icon: '□',
      note: 'Products needing attention',
    },
    {
      label: 'Categories',
      count: CATEGORIES.length,
      icon: '▧',
      note: `${new Set(products.map((item) => item.category)).size} categories with products`,
    },
  ];
  return (
    <section className="stats" aria-label="Inventory summary">
      {cards.map((card) => (
        <button className="stat stat-button" key={card.label} onClick={() => onSelect(card.label)}>
          <span className="stat-icon">{card.icon}</span>
          <div className="stat-label">{card.label}</div>
          <strong>{card.count}</strong>
          <small>{card.note}</small>
        </button>
      ))}
    </section>
  );
}

export function DashboardOverview({ products, onManage, onSelectCategory, onRestock }) {
  const categories = summarizeCategories(products)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);
  return (
    <section className="overview-grid">
      <div className="welcome-card">
        <div>
          <span className="pill">MADE FOR YOUR EVERYDAY</span>
          <h2>
            Small store.
            <br />
            Big possibilities.
          </h2>
          <p>Keep your shelves stocked and your prices up to date.</p>
          <div className="welcome-actions">
            <button onClick={onManage}>
              Browse products <span>↗</span>
            </button>
            <button className="welcome-secondary" onClick={onRestock}>
              Review restock list <span>→</span>
            </button>
          </div>
        </div>
        <div className="grocery-art" aria-hidden="true">
          <div className="sun" />
          <span className="leaf leaf1" />
          <span className="leaf leaf2" />
          <div className="bottle">3A</div>
          <div className="bag">
            <span>3A</span>
            <small>FRESH DAILY</small>
          </div>
          <div className="orange" />
          <div className="can">
            daily
            <br />
            <b>GOOD</b>
          </div>
        </div>
      </div>
      <div className="category-summary">
        <div className="section-top">
          <h3>On your shelves</h3>
          <span>By category</span>
        </div>
        {categories.map((category) => (
          <button
            className="bar-row category-bar-button"
            key={category.name}
            onClick={() => onSelectCategory(category.name)}
            aria-label={`Browse ${category.name}`}
          >
            <div className="bar-label">
              <span>{category.name}</span>
              <span>{category.count} products</span>
            </div>
            <div className="bar-track">
              <div
                style={{
                  width: `${products.length ? (category.count / products.length) * 100 : 0}%`,
                }}
              />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

export function CategoryGrid({ products, onSelect }) {
  return (
    <section className="category-grid" aria-label="Product categories">
      {summarizeCategories(products).map((category) => (
        <article className="category-card" key={category.name}>
          <span className="category-icon">{category.icon}</span>
          <h3>{category.name}</h3>
          <p>
            {category.count} products · {category.alerts} stock alerts
          </p>
          <button className="secondary" onClick={() => onSelect(category.name)}>
            View products →
          </button>
        </article>
      ))}
    </section>
  );
}
