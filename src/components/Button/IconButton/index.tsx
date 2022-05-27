import { ButtonHTMLAttributes, FunctionComponent, memo, MouseEvent, useCallback } from 'react';
import { ButtonColor } from 'types/common';
import { IconWrapper } from 'components/Icon';

import classNames from 'classnames/bind';
import styles from './IconButton.module.scss';

const cx = classNames.bind(styles);

interface BaseProps {
  type: ButtonColor | 'outline' | 'ghost';
  icon: FunctionComponent;
}

export type Props = BaseProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'>;

const defaultProps: Partial<BaseProps> = {
  type: 'primary',
};

const IconButton: FunctionComponent<Props> = ({ type, icon, disabled, onClick, className, children, ...rest }) => {
  const classes = cx('icon-button', className, type, {
    disabled,
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
    <button className={classes} onClick={handleClick} disabled={disabled} {...rest}>
      <IconWrapper icon={icon} hasFrame={false} />
    </button>
  );
};

IconButton.defaultProps = defaultProps;

export default memo(IconButton);
