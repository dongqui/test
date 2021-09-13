import { useCallback } from 'react';
import { useLSResizeState, useLSResizeDispatch } from 'contexts/LS/ResizeContext';
import { TextButton } from 'components/Button';
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
      simpleMode: !state.simpleMode,
    });
  }, [dispatch, state.simpleMode]);

  return (
    <div className={cx('change-modes')}>
      <IconWrapper
        className={cx('wrapper')}
        icon={SvgPath.SimpleMode}
        onClick={handleChange}
        hasFrame={false}
      />
      <IconWrapper
        className={cx('wrapper')}
        icon={SvgPath.InsertKeyframe}
        onClick={handleChange}
        hasFrame={false}
      />
      <TextButton className={cx('wrapper')} text="Autokey" />
      <TextButton className={cx('wrapper')} text="Curve Editor" />
    </div>
  );
};

export default ChangeModes;
