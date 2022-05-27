import { FunctionComponent, memo, ButtonHTMLAttributes, MouseEvent, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from 'components/Button/OutlineButton/OutlineButton.module.scss';

const cx = classNames.bind(styles);

interface BaseProps {
  size?: 'small' | 'medium' | 'large';
  type?: 'default';
  textColor?: 'light';
  text?: string;
  fullSize?: boolean;
}

export type Props = BaseProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'>;

const defaultProps: Partial<BaseProps> = {
  type: 'default',
  textColor: 'light',
  size: 'small',
};

const OutlineButton: FunctionComponent<Props> = ({ size, text, fullSize, disabled, type, textColor, onClick, className, children, ...rest }) => {
  const classes = cx('outline', className, size, `border-color-${type}`, `text-color-${textColor}`, {
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
    <button className={classes} onClick={handleClick} {...rest}>
      {text || children}
    </button>
  );
};

OutlineButton.defaultProps = defaultProps;

export default memo(OutlineButton);
