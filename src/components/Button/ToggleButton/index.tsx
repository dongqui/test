import { FunctionComponent, memo, ButtonHTMLAttributes, MouseEvent, useCallback, useState } from 'react';

import classNames from 'classnames/bind';
import styles from './ToggleButton.module.scss';

const cx = classNames.bind(styles);

interface BaseProps {
  size?: 'small' | 'medium' | 'large';
  type?: 'primary';
  text?: string;
  fullSize?: boolean;
  defaultState?: boolean;
}

export type Props = BaseProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'>;

const defaultProps: Partial<BaseProps> = {
  type: 'primary',
  size: 'small',
  defaultState: false,
};

const ToggleButton: FunctionComponent<Props> = ({ size, text, type, fullSize, disabled, defaultState, onClick, className, children, ...rest }) => {
  const [toggleState, setToggleState] = useState(defaultState ?? false);
  const classes = cx('toggle', className, size, type, {
    disabled,
    fullSize,
    state: toggleState,
  });

  const handleClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      if (!disabled) {
        setToggleState((prev) => !prev);
        onClick && onClick(e);
      }
    },
    [disabled, onClick],
  );

  return (
    <button className={classes} onClick={handleClick} {...rest}>
      {text || children}
    </button>
  );
};

ToggleButton.defaultProps = defaultProps;

export default memo(ToggleButton);
