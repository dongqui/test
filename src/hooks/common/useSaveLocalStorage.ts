import { useEffect } from 'react';
import { isClient } from 'utils';

interface useSaveLocalStoragePrps {
  name: string;
  state: any;
}
export const useSaveLocalStorage = ({ name, state }: useSaveLocalStoragePrps) => {
  useEffect(() => {
    if (isClient) {
      localStorage.setItem(`${name}`, JSON.stringify(state));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
};
