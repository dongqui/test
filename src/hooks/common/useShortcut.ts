import _ from 'lodash';
import React, { useCallback, useEffect } from 'react';
import { ShortcutTypes } from '../../types';

export const useShortcut = ({ data }: { data: ShortcutTypes[] }) => {
  const onKeyDown = useCallback(
    (e) => {
      if (_.find(data, ['key', e.key])?.ctrlKey) {
        if (!e.ctrlKey && !e.metaKey) {
          return;
        }
      }
      _.find(data, ['key', e.key])?.event();
    },
    [data],
  );
  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onKeyDown]);
};
