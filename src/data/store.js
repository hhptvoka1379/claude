const PREFIX = 'maturita_';

export function load(collection) {
  try {
    const raw = localStorage.getItem(PREFIX + collection);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function save(collection, data) {
  localStorage.setItem(PREFIX + collection, JSON.stringify(data));
}

export function exportAll() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(PREFIX)) {
      const name = key.slice(PREFIX.length);
      try {
        data[name] = JSON.parse(localStorage.getItem(key));
      } catch {
        data[name] = localStorage.getItem(key);
      }
    }
  }
  return data;
}

export function importAll(data) {
  // Clear existing maturita data
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(PREFIX)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));

  // Write new data
  for (const [name, value] of Object.entries(data)) {
    localStorage.setItem(PREFIX + name, JSON.stringify(value));
  }
}

export function clearAll() {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(PREFIX)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
}
