import { useCallback } from 'react';
import { useLSResizeState, useLSResizeDispatch } from 'contexts/LS/ResizeContext';
import { IconWrapper, SvgPath } from 'components/Icon';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const ChangeModes = () => {
  const state = useLSResizeState();
  const dispatch = useLSResizeDispatch();

  // LS SimpleMode를 활성/비활성 처리
  const handleChange = useCallback(() => {
    dispatch({
      type: 'SIMPLE_MODE',
      mode: !state.mode,
    });
  }, [dispatch, state.mode]);

  return (
    <div>
      <IconWrapper className={cx('simple-mode')} icon={SvgPath.SimpleMode} onClick={handleChange} />
    </div>
  );
};

export default ChangeModes;
