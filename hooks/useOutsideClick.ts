import React, { useCallback, useEffect } from 'react';

export const useOutsideClick = ({ ref, event }: { ref: React.MutableRefObject<HTMLDivElement>; event: Function }) => {
  const onClick = useCallback(
    (e) => {
      if (!ref.current.contains(e.target as Node)) {
        event();
      }
    },
    [event, ref],
  );
  useEffect(() => {
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('click', onClick);
    };
  }, [onClick]);
};
