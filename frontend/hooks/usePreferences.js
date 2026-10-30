import { useCallback, useEffect, useState } from 'react';

export function useTheme(storage) {
  const [dark, setDark] = useState(() => {
    try {
      return storage.getItem('3a-theme') === 'dark';
    } catch {
      return false;
    }
  });
  useEffect(() => {
    document.body.classList.toggle('dark', dark);
    try {
      storage.setItem('3a-theme', dark ? 'dark' : 'light');
    } catch {
      /* Theme remains usable when persistence is blocked. */
    }
  }, [dark, storage]);
  return { dark, toggleTheme: () => setDark((value) => !value) };
}

export function useToast() {
  const [toast, setToast] = useState(null);
  const notify = useCallback((message) => setToast({ message, created: Date.now() }), []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);
  return { toast: toast?.message || '', notify };
}
