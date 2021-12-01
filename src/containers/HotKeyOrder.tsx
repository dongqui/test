import { FunctionComponent, useMemo } from 'react';
import { HotKeys } from 'react-hotkeys';

/**
 *
 * Plask app의 모든 단축키 코드를 정의한다.
 * key-value pair 이루어진 값으로써 각 사용처에서 key값에 handler를 정의하여 Hotkeys에 props로 전달한다.
 */
const HotkeyOrder: FunctionComponent = ({ children }) => {
  const keyMap = useMemo(() => {
    return {
      LP_COPY: ['ctrl+c', 'command+c'],
      LP_PASTE: ['ctrl+v', 'command+v'],
      LP_EDIT_NAME: 'f2',
      LP_DELETE: ['delete', 'command+backspace'],
      LP_ALL_SELECT: 'ctrl+a',
    };
  }, []);

  return <HotKeys keyMap={keyMap}>{children}</HotKeys>;
};

export default HotkeyOrder;
