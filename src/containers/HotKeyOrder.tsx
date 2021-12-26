import { FunctionComponent, useMemo } from 'react';
import { HotKeys } from 'react-hotkeys';

interface Props {
  className?: string;
}

const HotkeyOrder: FunctionComponent<Props> = ({ className, children }) => {
  const keyMap = useMemo(() => {
    return {
      // LP_COPY: ['ctrl+c', 'command+c'],
      // LP_PASTE: ['ctrl+v', 'command+v'],
      LP_EDIT_NAME: 'f2',
      LP_DELETE: ['del', 'command+backspace'],
      LP_ALL_SELECT: ['ctrl+a', 'command+a'],
    };
  }, []);

  return (
    <HotKeys className={className} keyMap={keyMap} allowChanges>
      {children}
    </HotKeys>
  );
};

export default HotkeyOrder;
