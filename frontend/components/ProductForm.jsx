import { useState } from 'react';
import { CATEGORIES, validateProduct } from '../domain/inventory.js';
import Modal from './Modal.jsx';

const emptyProduct = {
  id: '',
  name: '',
  category: CATEGORIES[0],
  brand: '',
  variant: '',
  price: '',
  stock: '',
  image: '',
};

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Unable to read this image.'));
    reader.readAsDataURL(file);
  });
}

export default function ProductForm({ product, onSave, onClose, busy }) {
  const [fields, setFields] = useState(() => ({ ...emptyProduct, ...product }));
  const [error, setError] = useState('');
  const [readingImage, setReadingImage] = useState(false);
  const disabled = busy || readingImage;
  const updateField = (event) =>
    setFields((current) => ({ ...current, [event.target.name]: event.target.value }));

  async function uploadImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (
      file.size > 2 * 1024 * 1024 ||
      !['image/png', 'image/jpeg', 'image/webp'].includes(file.type)
    ) {
      setError('Choose a PNG, JPEG or WebP image under 2 MB.');
      event.target.value = '';
      return;
    }
    setReadingImage(true);
    try {
      const image = await fileToDataUrl(file);
      setFields((current) => ({ ...current, image }));
      setError('');
    } catch (failure) {
      setError(failure.message);
    } finally {
      setReadingImage(false);
    }
  }

  async function submit(event) {
    event.preventDefault();
    if (disabled) return;
    setError('');
    try {
      const value = {
        ...fields,
        name: fields.name.trim(),
        price: Number(fields.price),
        stock: Number(fields.stock),
      };
      validateProduct(value);
      await onSave(value);
      onClose();
    } catch (failure) {
      setError(failure.message);
    }
  }

  return (
    <Modal id="productDialog" titleId="productFormTitle" onClose={onClose} locked={disabled}>
      <form id="productForm" onSubmit={submit}>
        <div className="dialog-heading">
          <div>
            <div className="eyebrow">KEEP YOUR SHELVES UP TO DATE</div>
            <h2 id="productFormTitle">{product?.id ? 'Edit product' : 'Add product'}</h2>
          </div>
          <button
            type="button"
            className="close-dialog"
            aria-label="Close product form"
            disabled={disabled}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <fieldset disabled={disabled} className="form-grid">
          <label className="wide">
            Product name
            <input
              name="name"
              value={fields.name}
              onChange={updateField}
              required
              maxLength={160}
              placeholder="e.g. Premium Jasmine Rice"
            />
          </label>
          <label>
            Category
            <select name="category" value={fields.category} onChange={updateField} required>
              {CATEGORIES.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
          <label>
            Brand
            <input name="brand" value={fields.brand} onChange={updateField} maxLength={100} />
          </label>
          <label>
            Size / variant
            <input
              name="variant"
              value={fields.variant}
              onChange={updateField}
              maxLength={100}
              placeholder="e.g. 1 kg"
            />
          </label>
          <label>
            Selling price (₱)
            <input
              name="price"
              value={fields.price}
              onChange={updateField}
              type="number"
              min="0"
              max="9999999999.99"
              step="0.01"
              required
            />
          </label>
          <label>
            Stock quantity
            <input
              name="stock"
              value={fields.stock}
              onChange={updateField}
              type="number"
              min="0"
              max="2147483647"
              step="1"
              required
            />
          </label>
          <label>
            Product image (up to 2 MB)
            <input
              name="photo"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={uploadImage}
            />
          </label>
        </fieldset>
        {fields.image && <img id="imagePreview" src={fields.image} alt="Product preview" />}
        <p className="error" role="alert">
          {error}
        </p>
        <div className="dialog-footer">
          <button type="button" className="secondary" onClick={onClose} disabled={disabled}>
            Cancel
          </button>
          <button type="submit" className="primary" disabled={disabled}>
            {readingImage ? 'Reading image…' : busy ? 'Saving…' : 'Save product'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
