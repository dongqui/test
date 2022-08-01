import { useCallback, FunctionComponent, forwardRef } from 'react';
import { DebouncedFunc } from 'lodash';

import { useSelector } from 'reducers';
import { PrefixInput } from 'components/Input';
import { MutableRefObject } from 'react';

interface Props {
  defaultValue: number;
  onBlurInput: (event: React.FocusEvent<HTMLInputElement>) => void;
  onChangeInput: DebouncedFunc<(event: React.ChangeEvent<HTMLInputElement>) => void>;
  prefix: 'End' | 'Start';
}

const LoopInput = forwardRef<HTMLInputElement, Props>(({ defaultValue, onBlurInput, onChangeInput, prefix }, ref) => {
  const _visualizedAssetIds = useSelector((state) => state.plaskProject.visualizedAssetIds);

  // start, end input에 Enter key 입력 동작
  const handleInputKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'Enter':
        event.currentTarget.blur();
        break;
      default:
        break;
    }
  }, []);

  return (
    <PrefixInput
      defaultValue={defaultValue}
      onBlur={onBlurInput}
      onChange={onChangeInput}
      onKeyDown={handleInputKeyDown}
      prefix={prefix}
      disabled={_visualizedAssetIds.length === 0}
      ref={ref}
    />
  );
});
LoopInput.displayName = 'LoopInput';

export default LoopInput;
