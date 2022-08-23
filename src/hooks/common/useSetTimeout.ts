import { useEffect, useRef } from 'react';

export default function useSetTimeout(time: number | null, callback: () => void) {
  const savedCallback = useRef<() => void>();

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    function fn() {
      if (savedCallback?.current) {
        savedCallback.current();
      }
    }

    if (time !== null) {
      const intervalId = setTimeout(fn, time);
      return () => clearTimeout(intervalId);
    }
  }, [callback, time]);
}
