import React, { useCallback } from 'react';
import { useLSResizeState, useLSResizeDispatch } from 'contexts/LS/ResizeContext';
import { SvgPath } from 'components/Icon';
import { IconToggleButton } from 'components/Button';
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

  return <IconToggleButton icon={SvgPath.SimpleMode} defaultState={resizeState.simpleMode} onClick={handleChange} />;
};

export default SimpleMode;
