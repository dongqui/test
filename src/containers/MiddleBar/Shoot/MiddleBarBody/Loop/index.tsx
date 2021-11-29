import { useCallback } from 'react';
import { useSelector } from 'reducers';
import StartInput from './StartInput';
import EndInput from './EndInput';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const Loop = () => {
  const startTimeIndex = useSelector((state) => state.animatingControls.startTimeIndex);
  const endTimeIndex = useSelector((state) => state.animatingControls.endTimeIndex);
  const currentTimeIndex = useSelector((state) => state.animatingControls.currentTimeIndex);

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
    <div className={cx('loop')}>
      <p>Loop</p>
      <StartInput startTimeIndex={startTimeIndex} endTimeIndex={endTimeIndex} currentTimeIndex={currentTimeIndex} keyDown={handleInputKeyDown} />
      <EndInput startTimeIndex={startTimeIndex} endTimeIndex={endTimeIndex} currentTimeIndex={currentTimeIndex} keyDown={handleInputKeyDown} />
    </div>
  );
};

export default Loop;
