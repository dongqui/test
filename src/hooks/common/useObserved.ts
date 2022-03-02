import { Observable } from '@babylonjs/core';
import { useEffect, useState } from 'react';

export const useObserved = <S>(observable: Observable<S>, initialState?: S): S | undefined => {
  const [state, setState] = useState<S | undefined>(initialState);

  useEffect(() => {
    const observer = observable.add((value) => {
      setState(value);
    });

    return () => {
      observable.remove(observer);
    };
  }, [observable]);

  return state;
};
