import { ButtonHTMLAttributes, FunctionComponent, memo, MouseEvent, useCallback, useState } from 'react';
import { ButtonColor } from 'types/common';
import { IconWrapper } from 'components/Icon';

import classNames from 'classnames/bind';
import styles from './IconToggleButton.module.scss';

const cx = classNames.bind(styles);

interface BaseProps {
  type?: 'primary';
  icon: FunctionComponent;
  defaultState?: boolean;
}

export type Props = BaseProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'>;

const defaultProps: Partial<BaseProps> = {
  type: 'primary',
};

const IconToggleButton: FunctionComponent<Props> = ({ type, icon, disabled, defaultState, onClick, className, children, ...rest }) => {
  const [toggleState, setToggleState] = useState(defaultState ?? false);
  const classes = cx('icon-toggle-button', className, type, {
    disabled,
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
    <button className={classes} onClick={handleClick} disabled={disabled} {...rest}>
      <IconWrapper icon={icon} hasFrame={false} />
    </button>
  );
};

IconToggleButton.defaultProps = defaultProps;

export default memo(IconToggleButton);
