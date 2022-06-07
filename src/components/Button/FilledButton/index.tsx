import { FunctionComponent, memo, ButtonHTMLAttributes, MouseEvent, useCallback } from 'react';

import { ButtonColor } from 'types/common';

import classNames from 'classnames/bind';
import styles from './FilledButton.module.scss';

const cx = classNames.bind(styles);

interface BaseProps {
  size?: 'small' | 'medium' | 'large';
  type?: ButtonColor;
  text?: string;
  fullSize?: boolean;
  dataCy?: string;
  buttonType?: 'submit' | 'reset' | 'button';
}

export type Props = BaseProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'>;

const defaultProps: Partial<BaseProps> = {
  type: 'primary',
  size: 'small',
};

const FilledButton: FunctionComponent<Props> = ({ size, text, type, fullSize, disabled, onClick, className, children, dataCy, buttonType, ...rest }) => {
  const classes = cx('filled', className, size, type, {
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
    <button className={classes} onClick={handleClick} data-cy={dataCy} type={buttonType} {...rest}>
      {text || children}
    </button>
  );
};

FilledButton.defaultProps = defaultProps;

export default memo(FilledButton);
