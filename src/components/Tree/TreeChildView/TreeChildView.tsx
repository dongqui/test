import React from 'react';
import classNames from 'classnames/bind';
import styles from './TreeChildView.module.scss';

export interface TreeChildProps {
  key: number;
  id: string;
  prefix?: React.ReactNode;
  fileName: string;
  clicked?: boolean;
  dragging?: boolean;
  visible?: boolean;
  onClick?: any;
}

export const TreeChildView: React.FC<TreeChildProps> = ({
  key,
  id,
  prefix,
  fileName,
  clicked,
  dragging = true,
  visible,
  onClick,
}) => {
  const cx = classNames.bind(styles);
  const className = cx('Wrapper', { clicked, visible });
  return (
    <div
      id={id}
      key={key}
      draggable={dragging}
      className={className}
      onClick={onClick}
      aria-hidden="true"
    >
      <div className={cx('file-info')}>
        <div className={cx('file-icon')}>{prefix}</div>
        <span className={cx('file-name')}>{fileName}</span>
      </div>
    </div>
  );
};
