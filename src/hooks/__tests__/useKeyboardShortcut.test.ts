/** @vitest-environment jsdom */
import { renderHook, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useKeyboardShortcut } from '../useKeyboardShortcut';

describe('useKeyboardShortcut', () => {
  let callback: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    callback = vi.fn();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const fireKeydown = (
    key: string,
    options: { ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean; metaKey?: boolean; target?: EventTarget } = {}
  ) => {
    const event = new KeyboardEvent('keydown', {
      key,
      ctrlKey: options.ctrlKey || false,
      shiftKey: options.shiftKey || false,
      altKey: options.altKey || false,
      metaKey: options.metaKey || false,
      bubbles: true,
      cancelable: true,
    });

    // In JSDOM, if we want to override the target, we need to dispatch on the target itself
    // and let it bubble up to window, or we can mock property. Let's dispatch on target if provided.
    if (options.target) {
      options.target.dispatchEvent(event);
    } else {
      window.dispatchEvent(event);
    }

    return event;
  };

  it('triggers callback on exact match', () => {
    renderHook(() => useKeyboardShortcut({ key: 'a' }, callback));

    fireKeydown('a');
    expect(callback).toHaveBeenCalledTimes(1);

    fireKeydown('b');
    expect(callback).toHaveBeenCalledTimes(1); // Still 1
  });

  it('handles modifiers correctly (ctrl)', () => {
    renderHook(() => useKeyboardShortcut({ key: 's', ctrl: true }, callback));

    fireKeydown('s'); // No ctrl
    expect(callback).not.toHaveBeenCalled();

    fireKeydown('s', { ctrlKey: true });
    expect(callback).toHaveBeenCalledTimes(1);

    fireKeydown('s', { metaKey: true }); // metaKey also counts as ctrl
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('handles modifiers correctly (shift)', () => {
    renderHook(() => useKeyboardShortcut({ key: 'K', shift: true }, callback));

    fireKeydown('k', { shiftKey: false });
    expect(callback).not.toHaveBeenCalled();

    fireKeydown('K', { shiftKey: true });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('handles modifiers correctly (alt)', () => {
    renderHook(() => useKeyboardShortcut({ key: 'p', alt: true }, callback));

    fireKeydown('p', { altKey: false });
    expect(callback).not.toHaveBeenCalled();

    fireKeydown('p', { altKey: true });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('respects the enabled flag', () => {
    renderHook(() => useKeyboardShortcut({ key: 'a', enabled: false }, callback));

    fireKeydown('a');
    expect(callback).not.toHaveBeenCalled();
  });

  it('calls e.preventDefault() by default', () => {
    renderHook(() => useKeyboardShortcut({ key: 'a' }, callback));

    const event = fireKeydown('a');
    expect(event.defaultPrevented).toBe(true);
  });

  it('does not call e.preventDefault() if preventDefault option is false', () => {
    renderHook(() => useKeyboardShortcut({ key: 'a', preventDefault: false }, callback));

    const event = fireKeydown('a');
    expect(event.defaultPrevented).toBe(false);
  });

  describe('input elements exclusions', () => {
    it('does not trigger when typing in an INPUT element', () => {
      renderHook(() => useKeyboardShortcut({ key: 'a' }, callback));

      const input = document.createElement('input');
      document.body.appendChild(input);
      fireKeydown('a', { target: input });

      expect(callback).not.toHaveBeenCalled();
      document.body.removeChild(input);
    });

    it('does not trigger when typing in a TEXTAREA element', () => {
      renderHook(() => useKeyboardShortcut({ key: 'a' }, callback));

      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);
      fireKeydown('a', { target: textarea });

      expect(callback).not.toHaveBeenCalled();
      document.body.removeChild(textarea);
    });

    it('does not trigger when typing in a contenteditable element', () => {
      renderHook(() => useKeyboardShortcut({ key: 'a' }, callback));

      const div = document.createElement('div');
      Object.defineProperty(div, 'isContentEditable', { value: true, writable: true });
      document.body.appendChild(div);
      fireKeydown('a', { target: div });

      expect(callback).not.toHaveBeenCalled();
      document.body.removeChild(div);
    });

    it('allows Ctrl+S even inside input elements', () => {
      renderHook(() => useKeyboardShortcut({ key: 's', ctrl: true }, callback));

      const input = document.createElement('input');
      document.body.appendChild(input);
      fireKeydown('s', { ctrlKey: true, target: input });

      expect(callback).toHaveBeenCalledTimes(1);
      document.body.removeChild(input);
    });
  });
});
