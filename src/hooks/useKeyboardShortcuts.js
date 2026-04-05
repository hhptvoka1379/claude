import { useEffect } from 'react';

export function useKeyboardShortcuts(shortcuts, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    function handler(e) {
      // Don't trigger shortcuts when typing in inputs
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target.isContentEditable) {
        if (e.key === 'Escape') {
          // Allow Escape even in inputs
        } else {
          return;
        }
      }

      for (const shortcut of shortcuts) {
        const { key, ctrl, handler: fn } = shortcut;
        const ctrlMatch = ctrl ? (e.ctrlKey || e.metaKey) : true;
        if (e.key === key && ctrlMatch) {
          e.preventDefault();
          fn();
          return;
        }
      }
    }

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts, enabled]);
}
