import React, { useCallback } from 'react';
import { useLSResizeState, useLSResizeDispatch } from 'contexts/LS/ResizeContext';
import { IconWrapper, SvgPath } from 'components/Icon';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const SimpleMode = () => {
  const resizeState = useLSResizeState();
  const resizeDispatch = useLSResizeDispatch();

  // LS SimpleMode를 활성/비활성 처리
  const handleChange = useCallback(() => {
    resizeDispatch({
      type: 'SIMPLE_MODE',
      simpleMode: !resizeState.simpleMode,
    });
  }, [resizeDispatch, resizeState.simpleMode]);

  return <IconWrapper className={cx({ active: resizeState.simpleMode })} icon={SvgPath.SimpleMode} onClick={handleChange} hasFrame={false} />;
};

export default SimpleMode;
