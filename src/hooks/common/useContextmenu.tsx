import _ from 'lodash';
import React, { RefObject, useCallback, useEffect } from 'react';

interface useContextmenuProps {
  targetRef: RefObject<HTMLElement>;
  event: ({ top, left, e }: { top: number; left: number; e?: MouseEvent }) => void;
}
export const useContextmenu = ({ targetRef, event }: useContextmenuProps) => {
  const handleContextmenu = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      event({ top: e.pageY, left: e.pageX, e });
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
