import { FunctionComponent, memo, ButtonHTMLAttributes, MouseEvent, useCallback } from 'react';

import { ButtonColor } from 'types/common';

import classNames from 'classnames/bind';
import styles from './FilledButton.module.scss';

const cx = classNames.bind(styles);

interface BaseProps {
  size?: 'small' | 'medium' | 'large';
  buttonType?: ButtonColor;
  text?: string;
  fullSize?: boolean;
  dataCy?: string;
  r?: (ref: HTMLButtonElement) => void;
}

export type Props = BaseProps & ButtonHTMLAttributes<HTMLButtonElement>;

const defaultProps: Partial<BaseProps> = {
  buttonType: 'primary',
  size: 'small',
};

const FilledButton: FunctionComponent<React.PropsWithChildren<Props>> = ({ r, size, text, buttonType, fullSize, disabled, onClick, className, children, dataCy, ...rest }) => {
  const classes = cx('filled', className, size, buttonType, {
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
    <button ref={(ref) => r && ref && r(ref)} className={classes} onClick={handleClick} data-cy={dataCy} {...rest}>
      {text || children}
    </button>
  );
};

FilledButton.defaultProps = defaultProps;

export default memo(FilledButton);
