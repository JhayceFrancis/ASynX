import { useEffect, useRef } from 'react';

interface ShortcutOptions {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  enabled?: boolean;
  preventDefault?: boolean;
}

export function useKeyboardShortcut(
  { key, ctrl = false, shift = false, alt = false, enabled = true, preventDefault = true }: ShortcutOptions,
  callback: (e: KeyboardEvent) => void
) {
  // Use a ref to hold the latest callback to avoid unnecessary re-renders or effect re-bindings
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        // Exception: Ctrl+S might still be wanted, but usually not navigation shortcuts
        if (!(ctrl && key.toLowerCase() === 's')) {
           return;
        }
      }

      const keyMatch = e.key.toLowerCase() === key.toLowerCase();
      const ctrlMatch = ctrl ? (e.ctrlKey || e.metaKey) : (!e.ctrlKey && !e.metaKey);
      const shiftMatch = shift ? e.shiftKey : !e.shiftKey;
      const altMatch = alt ? e.altKey : !e.altKey;

      if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
        if (preventDefault) e.preventDefault();
        callbackRef.current(e);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, ctrl, shift, alt, enabled, preventDefault]);
}
