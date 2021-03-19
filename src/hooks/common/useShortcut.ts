import _ from 'lodash';
import React, { useCallback, useEffect } from 'react';
import { ShortcutTypes } from '../../types';

export const useShortcut = ({ data }: { data: ShortcutTypes[] }) => {
  const onKeyPress = useCallback(
    (e) => {
      if (_.find(data, ['key', e.key])?.ctrlKey) {
        if (!e.ctrlKey) {
          return;
        }
      }
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
