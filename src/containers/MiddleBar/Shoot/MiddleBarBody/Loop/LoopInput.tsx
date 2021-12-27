import { useCallback, FunctionComponent } from 'react';
import { DebouncedFunc } from 'lodash';

import { useSelector } from 'reducers';
import { PrefixInput } from 'components/Input';

interface Props {
  defaultValue: number;
  onBlurInput: (event: React.FocusEvent<HTMLInputElement>) => void;
  onChangeInput: DebouncedFunc<(event: React.ChangeEvent<HTMLInputElement>) => void>;
  prefix: 'End' | 'Start';
}

const LoopInput: FunctionComponent<Props> = (props) => {
  const { defaultValue, onBlurInput, onChangeInput, prefix } = props;
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
    />
  );
};

export default LoopInput;
