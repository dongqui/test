import { RefObject, useCallback, useEffect } from 'react';
import _ from 'lodash';

interface EventParams {
  top: number;
  left: number;
  e?: MouseEvent;
}

interface Props {
  targetRef: RefObject<HTMLElement>;
  event: (params: EventParams) => void;
}

const useContextMenu = ({ targetRef, event }: Props) => {
  const handleContextmenu = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      event({ top: e.pageY, left: e.pageX, e });
    },
    [event],
  );

  useEffect(() => {
    const currentRef = targetRef?.current;
    if (currentRef) {
      currentRef.addEventListener('contextmenu', handleContextmenu);

      return () => {
        currentRef.removeEventListener('contextmenu', handleContextmenu);
      };
    }
  }, [handleContextmenu, targetRef]);
};

export default useContextMenu;
