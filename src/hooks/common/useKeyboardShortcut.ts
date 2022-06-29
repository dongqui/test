/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useMemo, useCallback, useRef } from 'react';

const BLACKLISTED_DOM_TARGETS = ['INPUT'];

interface ShortcutOption {
  ignoreBlacklist?: boolean;
  repeatOnHold?: boolean;
  activeOnlyInOrder?: boolean;
  // TODO only works when target is focused
  focus?: {
    target: Element | HTMLCanvasElement;
  };
}

const defaultOptions: ShortcutOption = {
  ignoreBlacklist: true,
  repeatOnHold: true,
  // TODO case that doesn't matter pressing order
  activeOnlyInOrder: true,
};

export default function useKeyboardShortcut(shortcutKeys: Array<string>, callback: Function, options?: ShortcutOption) {
  const option = { ...defaultOptions, ...options };
  const shortcutKeysId = useMemo(() => shortcutKeys.join(), [shortcutKeys]);
  const shortcutArray = useMemo(() => [...new Set(shortcutKeys)].map((key) => String(key).toLowerCase()), [shortcutKeysId]);

  // useRef to avoid a constant re-render on keydown and keyup.
  const pressedKeys = useRef<Array<string>>([]);

  const keydownListener = useCallback(
    (keydownEvent: KeyboardEvent) => {
      const target = keydownEvent.target as Element;
      if (option.ignoreBlacklist && BLACKLISTED_DOM_TARGETS.includes(target.tagName)) {
        return;
      }

      if (option.focus?.target) {
      }

      if (keydownEvent.repeat && !option.repeatOnHold) return;

      const pressedKey = String(keydownEvent.key).toLowerCase();

      // TODO Need to fix execptions
      // https://stackoverflow.com/questions/11818637/why-does-javascript-drop-keyup-events-when-the-metakey-is-pressed-on-mac-browser
      if (pressedKey === 'meta') return;

      pressedKeys.current = [...new Set([...pressedKeys.current, pressedKey])];
      if (pressedKeys.current.join() === shortcutArray.join()) {
        callback(shortcutKeys);
        return;
      }
      return;
    },
    [shortcutKeysId, callback, option.ignoreBlacklist],
  );

  const keyupListener = useCallback(
    (keyupEvent: KeyboardEvent) => {
      const raisedKey = String(keyupEvent.key).toLowerCase();
      const raisedKeyPressedIndex = pressedKeys.current.indexOf(raisedKey);
      if (!(raisedKeyPressedIndex >= 0)) return;

      let _pressedKeys = [];
      for (let i = 0; i < pressedKeys.current.length; ++i) {
        if (i !== raisedKeyPressedIndex) {
          _pressedKeys.push(pressedKeys.current[i]);
        }
      }
      pressedKeys.current = [...new Set(_pressedKeys)];

      return;
    },
    [shortcutKeysId],
  );

  const flushPressedKeys = useCallback(() => {
    pressedKeys.current = [];
  }, [shortcutKeysId]);

  useEffect(() => {
    flushPressedKeys();
  }, [flushPressedKeys]);

  useEffect(() => {
    document.addEventListener('keydown', keydownListener);
    document.addEventListener('keyup', keyupListener);
    return () => {
      document.removeEventListener('keydown', keydownListener);
      document.removeEventListener('keyup', keyupListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortcutKeysId, keydownListener, keyupListener]);
}
