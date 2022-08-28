import { useEffect, useRef } from 'react';

export default function useInterval(time: number | null, callback: () => void) {
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
      const intervalId = setInterval(fn, time);
      return () => clearInterval(intervalId);
    }
  }, [callback, time]);
}
