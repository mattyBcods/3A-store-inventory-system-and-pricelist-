import { getStockStatus, STATUS_LABELS } from '../domain/inventory.js';

const columns = [
  ['Product ID', (product) => `3A-${String(product.id).padStart(4, '0')}`],
  ['Product name', (product) => product.name],
  ['Category', (product) => product.category],
  ['Brand', (product) => product.brand || ''],
  ['Size / Variant', (product) => product.variant || ''],
  ['Selling price (PHP)', (product) => product.price],
  ['Stock quantity', (product) => product.stock],
  ['Availability', (product) => STATUS_LABELS[getStockStatus(product)]],
];

function csvCell(value) {
  let text = String(value ?? '');
  if (/^[\s]*[=+@\-]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function buildExcelCsv(products) {
  const rows = [
    columns.map(([title]) => title),
    ...products.map((product) => columns.map(([, read]) => read(product))),
  ];
  return `\ufeff${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}`;
}

function download(filename, content, mimeType) {
  const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadExcel(products) {
  download('3A-STORE-price-list.csv', buildExcelCsv(products), 'text/csv;charset=utf-8');
}

function escapeHtml(value) {
  const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(value ?? '').replace(/[&<>"']/g, (character) => entities[character]);
}

export function buildWordDocument(products) {
  const heading = columns.map(([title]) => `<th>${escapeHtml(title)}</th>`).join('');
  const rows = products
    .map(
      (product) =>
        `<tr>${columns.map(([, read]) => `<td>${escapeHtml(read(product))}</td>`).join('')}</tr>`,
    )
    .join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>3A STORE Price List</title><style>body{font:12px Arial,sans-serif;color:#20372c}h1{color:#176446}p{color:#66756b}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccd5cf;text-align:left;padding:7px}th{background:#176446;color:white}tr:nth-child(even){background:#f3f7f4}</style></head><body><h1>3A STORE</h1><p>Product Price List · ${products.length} products · Generated ${new Date().toLocaleDateString('en-PH')}</p><table><thead><tr>${heading}</tr></thead><tbody>${rows}</tbody></table></body></html>`;
}

export function downloadWord(products) {
  download(
    '3A-STORE-price-list.doc',
    buildWordDocument(products),
    'application/msword;charset=utf-8',
  );
}

export function buildBackup(products) {
  return JSON.stringify(
    { format: '3a-store-inventory', version: 1, exportedAt: new Date().toISOString(), products },
    null,
    2,
  );
}

export function downloadBackup(products) {
  download(
    '3A-STORE-inventory-backup.json',
    buildBackup(products),
    'application/json;charset=utf-8',
  );
}
