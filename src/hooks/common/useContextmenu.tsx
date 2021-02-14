import React, { RefObject, useCallback, useEffect } from 'react';

interface useContextmenuProps {
  targetRef: RefObject<HTMLElement>;
  event: ({ top, left }: { top: number; left: number }) => void;
}
export const useContextmenu = ({ targetRef, event }: useContextmenuProps) => {
  const handleContextmenu = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      event({ top: e.pageY, left: e.pageX });
    },
    [event],
  );
  useEffect(() => {
    targetRef?.current?.addEventListener('contextmenu', handleContextmenu);
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      targetRef?.current?.removeEventListener('contextmenu', handleContextmenu);
    };
  }, [handleContextmenu, targetRef]);
};
