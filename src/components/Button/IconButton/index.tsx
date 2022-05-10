import { ButtonHTMLAttributes, FunctionComponent, memo, MouseEvent, useCallback } from 'react';
import { ButtonColor } from 'types/common';
import { IconWrapper } from 'components/Icon';

import classNames from 'classnames/bind';
import styles from './IconButton.module.scss';

const cx = classNames.bind(styles);

interface BaseProps {
  variant: ButtonColor | 'outline' | 'ghost';
  icon: FunctionComponent;
}

export type Props = BaseProps & ButtonHTMLAttributes<HTMLButtonElement>;

const defaultProps: Partial<BaseProps> = {
  variant: 'primary',
};

const IconButton: FunctionComponent<Props> = ({ variant, icon, disabled, onClick, className, children, ...rest }) => {
  const classes = cx('icon-button', className, variant, {
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
