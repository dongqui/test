import { FunctionComponent, memo, ButtonHTMLAttributes, MouseEvent, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from 'components/Button/OutlineButton/OutlineButton.module.scss';

const cx = classNames.bind(styles);

interface BaseProps {
  size?: 'small' | 'medium' | 'large';
  bolderColor?: 'default';
  textColor?: 'light';
  text?: string;
  fullSize?: boolean;
}

export type Props = BaseProps & ButtonHTMLAttributes<HTMLButtonElement>;

const defaultProps: Partial<BaseProps> = {
  bolderColor: 'default',
  textColor: 'light',
  size: 'small',
};

const OutlineButton: FunctionComponent<Props> = ({ size, text, fullSize, disabled, bolderColor, textColor, onClick, className, children, ...rest }) => {
  const classes = cx('outline', className, size, `border-color-${bolderColor}`, `text-color-${textColor}`, {
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
