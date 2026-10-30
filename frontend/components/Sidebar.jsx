const navigation = [
  ['dashboard', '◫', 'Overview'],
  ['products', '▤', 'Product price list'],
  ['stock', '▦', 'Stock alerts'],
  ['categories', '▧', 'Categories'],
];

export default function Sidebar({ view, onNavigate, alerts, dark, onTheme, open }) {
  return (
    <aside id="sidebar" className={open ? 'open' : ''} aria-label="Store navigation">
      <a
        className="logo"
        href="#dashboard"
        onClick={(event) => {
          event.preventDefault();
          onNavigate('dashboard');
        }}
      >
        <span className="mark">
          3A<span>✦</span>
        </span>
        <span>
          3A STORE<small>YOUR EVERYDAY ESSENTIALS</small>
        </span>
      </a>
      <div className="nav-label">WORKSPACE</div>
      <nav>
        {navigation.map(([key, icon, label]) => (
          <button
            key={key}
            className={view === key ? 'active' : ''}
            aria-current={view === key ? 'page' : undefined}
            onClick={() => onNavigate(key)}
          >
            {icon} <span>{label}</span>
            {key === 'stock' && <b>{alerts}</b>}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <button onClick={onTheme} aria-pressed={dark}>
          ◐ <span>{dark ? 'Switch to light mode' : 'Switch to dark mode'}</span>
        </button>
        <div className="profile">
          <div className="avatar">A</div>
          <div>
            <strong>Local inventory</strong>
            <small>Saved on this device</small>
          </div>
          <span className="online" />
        </div>
      </div>
    </aside>
  );
}
