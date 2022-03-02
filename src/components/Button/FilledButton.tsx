import { FunctionComponent, memo, ButtonHTMLAttributes, MouseEvent, useCallback } from 'react';

import { ButtonColor } from 'types/common';

import classNames from 'classnames/bind';
import styles from './FilledButton.module.scss';

const cx = classNames.bind(styles);

interface BaseProps {
  size?: 'small' | 'medium' | 'large';
  color?: ButtonColor;
  text?: string;
  fullSize?: boolean;
  dataCy?: string;
}

export type Props = BaseProps & ButtonHTMLAttributes<HTMLButtonElement>;

const defaultProps: Partial<BaseProps> = {
  color: 'primary',
  size: 'small',
};

const FilledButton: FunctionComponent<Props> = ({ size, text, color, fullSize, disabled, onClick, className, children, dataCy, ...rest }) => {
  const classes = cx('filled', className, size, color, {
    disabled,
    fullSize,
  });

  const handleClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      if (!disabled) {
        onClick && onClick(e);
      }
    },
    [disabled, onClick],
  );

  return (
    <button className={classes} onClick={handleClick} data-cy={dataCy} {...rest}>
      {text || children}
    </button>
  );
};

FilledButton.defaultProps = defaultProps;

export default memo(FilledButton);
