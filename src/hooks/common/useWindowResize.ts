import _ from 'lodash';
import React, { useCallback, useEffect } from 'react';

interface useWindowResizeProps {
  event: ({ width, height }: { width: number; height: number }) => void;
}
export const useWindowResize = ({ event }: useWindowResizeProps) => {
  const onResize = useCallback(() => {
    event({ width: window.innerWidth, height: window.innerHeight });
  }, [event]);
  useEffect(() => {
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [onResize]);
};
