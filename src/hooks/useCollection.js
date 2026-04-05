import { useState, useEffect, useCallback } from 'react';
import { load, save } from '../data/store';

export function useCollection(collectionName, defaultData = []) {
  const [items, setItems] = useState(() => load(collectionName) ?? defaultData);

  useEffect(() => {
    save(collectionName, items);
  }, [collectionName, items]);

  const add = useCallback((item) => {
    setItems(prev => [...prev, item]);
  }, []);

  const update = useCallback((id, patch) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...patch } : item
    ));
  }, []);

  const remove = useCallback((id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const replace = useCallback((newItems) => {
    setItems(newItems);
  }, []);

  return { items, add, update, remove, replace };
}
