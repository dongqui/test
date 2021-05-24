import { useEffect, useState } from 'react';

/**
 * 해당 hook은 SSR을 지원하지 않습니다.
 *
 * @returns {[number, number]} window width, window height
 */
const useWindowSize = (): [number, number] => {
  const [size, setSize] = useState<[number, number]>([window.innerWidth, window.innerHeight]);

  useEffect(() => {
    const updateSize = () => {
      setSize([window.innerWidth, window.innerHeight]);
    };

    const isResizeOccurred = size[0] !== window.innerWidth || size[1] !== window.innerHeight;

    if (isResizeOccurred) {
      updateSize();
    }

    window.addEventListener('resize', updateSize);

    return () => window.removeEventListener('resize', updateSize);
  }, [size]);

  return size;
};

export default useWindowSize;
