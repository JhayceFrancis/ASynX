/**
 * @vitest-environment jsdom
 */
import { renderHook, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { useKeyboardShortcut } from '../../src/hooks/useKeyboardShortcut';

describe('useKeyboardShortcut', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  const fireKeyDown = (key: string, options: Partial<KeyboardEventInit> = {}, target?: HTMLElement) => {
    const event = new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true,
      ...options,
    });

    // We can spy on preventDefault to be sure
    vi.spyOn(event, 'preventDefault');

    if (target) {
      target.dispatchEvent(event);
    } else {
      window.dispatchEvent(event);
    }

    return event;
  };

  it('triggers the callback when the matching key is pressed', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut({ key: 'Enter' }, callback));

    fireKeyDown('Enter');

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does not trigger the callback for non-matching keys', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut({ key: 'Enter' }, callback));

    fireKeyDown('Escape');

    expect(callback).not.toHaveBeenCalled();
  });

  it('triggers the callback ignoring case differences', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut({ key: 'A' }, callback));

    fireKeyDown('a');
    fireKeyDown('A');

    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('respects the ctrl modifier (ctrlKey or metaKey)', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut({ key: 'f', ctrl: true }, callback));

    // Neither ctrl nor meta
    fireKeyDown('f');
    expect(callback).not.toHaveBeenCalled();

    // With ctrl
    fireKeyDown('f', { ctrlKey: true });
    expect(callback).toHaveBeenCalledTimes(1);

    // With meta (Cmd on Mac)
    fireKeyDown('f', { metaKey: true });
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('respects the shift modifier', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut({ key: 'f', shift: true }, callback));

    // Without shift
    fireKeyDown('f');
    expect(callback).not.toHaveBeenCalled();

    // With shift
    fireKeyDown('f', { shiftKey: true });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('respects the alt modifier', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut({ key: 'f', alt: true }, callback));

    // Without alt
    fireKeyDown('f');
    expect(callback).not.toHaveBeenCalled();

    // With alt
    fireKeyDown('f', { altKey: true });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('respects all modifiers combined', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut({ key: 'f', ctrl: true, shift: true, alt: true }, callback));

    // Partial modifiers
    fireKeyDown('f', { ctrlKey: true, shiftKey: true });
    expect(callback).not.toHaveBeenCalled();

    // All modifiers
    fireKeyDown('f', { ctrlKey: true, shiftKey: true, altKey: true });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does not trigger when enabled is false', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut({ key: 'Enter', enabled: false }, callback));

    fireKeyDown('Enter');

    expect(callback).not.toHaveBeenCalled();
  });

  it('calls preventDefault by default', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut({ key: 'Enter' }, callback));

    const event = fireKeyDown('Enter');

    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('does not call preventDefault if preventDefault is false', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut({ key: 'Enter', preventDefault: false }, callback));

    const event = fireKeyDown('Enter');

    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('updates the callback without re-binding the effect', () => {
    let callback = vi.fn();
    const { rerender } = renderHook(({ cb }) => useKeyboardShortcut({ key: 'Enter' }, cb), {
      initialProps: { cb: callback },
    });

    // Replace the callback function
    const newCallback = vi.fn();
    rerender({ cb: newCallback });

    fireKeyDown('Enter');

    expect(callback).not.toHaveBeenCalled();
    expect(newCallback).toHaveBeenCalledTimes(1);
  });

  it('removes event listener on unmount', () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useKeyboardShortcut({ key: 'Enter' }, callback));

    unmount();
    fireKeyDown('Enter');

    expect(callback).not.toHaveBeenCalled();
  });

  it('updates event listener when options change dynamically', () => {
    const callback = vi.fn();
    const { rerender } = renderHook(
      (props) => useKeyboardShortcut(props.options, props.cb),
      {
        initialProps: { options: { key: 'a' }, cb: callback },
      }
    );

    // Initial state: listens to 'a'
    fireKeyDown('a');
    expect(callback).toHaveBeenCalledTimes(1);

    // Rerender with new options
    rerender({ options: { key: 'b', ctrl: true }, cb: callback });

    // Old key shouldn't trigger
    fireKeyDown('a');
    expect(callback).toHaveBeenCalledTimes(1); // count hasn't changed

    // New key without modifier shouldn't trigger
    fireKeyDown('b');
    expect(callback).toHaveBeenCalledTimes(1);

    // New key with modifier should trigger
    fireKeyDown('b', { ctrlKey: true });
    expect(callback).toHaveBeenCalledTimes(2);
  });

  describe('input target handling', () => {
    it('does not trigger if target is an INPUT', () => {
      const callback = vi.fn();
      renderHook(() => useKeyboardShortcut({ key: 'Enter' }, callback));

      const input = document.createElement('input');
      document.body.appendChild(input);

      fireKeyDown('Enter', {}, input);

      expect(callback).not.toHaveBeenCalled();
      document.body.removeChild(input);
    });

    it('does not trigger if target is a TEXTAREA', () => {
      const callback = vi.fn();
      renderHook(() => useKeyboardShortcut({ key: 'Enter' }, callback));

      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);

      fireKeyDown('Enter', {}, textarea);

      expect(callback).not.toHaveBeenCalled();
      document.body.removeChild(textarea);
    });

    it('does not trigger if target is contentEditable', () => {
      const callback = vi.fn();
      renderHook(() => useKeyboardShortcut({ key: 'Enter' }, callback));

      const div = document.createElement('div');
      Object.defineProperty(div, 'isContentEditable', { value: true, writable: true });
      document.body.appendChild(div);

      fireKeyDown('Enter', {}, div);

      expect(callback).not.toHaveBeenCalled();
      document.body.removeChild(div);
    });

    it('allows Ctrl+S / Cmd+S exception even inside input', () => {
      const callback = vi.fn();
      renderHook(() => useKeyboardShortcut({ key: 's', ctrl: true }, callback));

      const input = document.createElement('input');
      document.body.appendChild(input);

      fireKeyDown('s', { ctrlKey: true }, input);

      expect(callback).toHaveBeenCalledTimes(1);
      document.body.removeChild(input);
    });

    it('does not trigger for S inside input without Ctrl modifier', () => {
      const callback = vi.fn();
      renderHook(() => useKeyboardShortcut({ key: 's' }, callback));

      const input = document.createElement('input');
      document.body.appendChild(input);

      fireKeyDown('s', {}, input);

      expect(callback).not.toHaveBeenCalled();
      document.body.removeChild(input);
    });

    it('allows Ctrl+Shift+S / Cmd+Shift+S exception even inside input', () => {
      const callback = vi.fn();
      renderHook(() => useKeyboardShortcut({ key: 's', ctrl: true, shift: true }, callback));

      const input = document.createElement('input');
      document.body.appendChild(input);

      fireKeyDown('s', { ctrlKey: true, shiftKey: true }, input);

      expect(callback).toHaveBeenCalledTimes(1);
      document.body.removeChild(input);
    });

    it('handles non-HTMLElement targets gracefully', () => {
      const callback = vi.fn();
      renderHook(() => useKeyboardShortcut({ key: 'Enter' }, callback));

      const event = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      });

      // document is a Node but not an HTMLElement, it doesn't have tagName
      document.dispatchEvent(event);

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
});
