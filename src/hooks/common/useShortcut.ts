import _ from 'lodash';
import React, { useCallback, useEffect } from 'react';
import { shortcutTypes } from '../../interfaces';

export const useShortcut = ({ data }: { data: shortcutTypes[] }) => {
  const onKeyPress = useCallback(
    (e) => {
      _.find(data, ['key', e.key])?.event();
    },
    [data],
  );
  useEffect(() => {
    document.addEventListener('keyup', onKeyPress);
    return () => {
      document.removeEventListener('keyup', onKeyPress);
    };
  }, [onKeyPress]);
};
