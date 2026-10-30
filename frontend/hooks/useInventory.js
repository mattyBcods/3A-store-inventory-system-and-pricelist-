import { useCallback, useEffect, useState } from 'react';
import { validateProduct } from '../domain/inventory.js';

/** Loads and saves inventory locally; never sends products to a server. */
export function useInventory(repository, notify) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setProducts(await repository.list());
      setError('');
    } catch (failure) {
      setError(failure.message);
      throw failure;
    }
  }, [repository]);

  useEffect(() => {
    let active = true;
    Promise.resolve()
      .then(() => repository.list())
      .then((items) => {
        if (active) setProducts(items);
      })
      .catch((failure) => {
        if (active) setError(failure.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [repository]);

  async function saveProduct(product) {
    validateProduct(product);
    setBusy(true);
    try {
      const saved = await repository.save(product);
      setProducts((current) => [
        ...current.filter((item) => Number(item.id) !== Number(saved.id)),
        saved,
      ]);
      setError('');
      notify('Product saved successfully on this device');
    } catch (failure) {
      setError(failure.message);
      throw failure;
    } finally {
      setBusy(false);
    }
  }

  async function deleteProduct(id) {
    setBusy(true);
    try {
      await repository.remove(id);
      setProducts((current) => current.filter((item) => Number(item.id) !== Number(id)));
      setError('');
      notify('Product deleted from this device');
    } catch (failure) {
      setError(failure.message);
      throw failure;
    } finally {
      setBusy(false);
    }
  }

  async function restoreProducts(items) {
    setBusy(true);
    try {
      for (const product of items)
        validateProduct({ ...product, price: Number(product.price), stock: Number(product.stock) });
      await repository.replace(items);
      setProducts(items);
      setError('');
      notify('Inventory backup restored');
    } catch (failure) {
      setError(failure.message);
      throw failure;
    } finally {
      setBusy(false);
    }
  }

  return { products, loading, busy, error, refresh, saveProduct, deleteProduct, restoreProducts };
}
