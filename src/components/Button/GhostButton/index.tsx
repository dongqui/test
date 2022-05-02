import { FunctionComponent, memo, ButtonHTMLAttributes, useCallback, MouseEvent } from "react";
import classNames from 'classnames/bind';
import styles from './GhostButton.module.scss';

const cx = classNames.bind(styles);

interface BaseProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'default';
  text?: string;
  fullSize?: boolean;
  dataCy?: string;
}

export type Props = BaseProps & ButtonHTMLAttributes<HTMLButtonElement>;

const defaultProps: Partial<BaseProps> = {
  color: 'default',
  size: 'small',
};

const GhostButton: FunctionComponent<Props> = ({ size, text, color, fullSize, disabled, onClick, className, children, dataCy, ...rest }) => {
  const classes = cx('text', className, size, color, {
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

GhostButton.defaultProps = defaultProps;

export default memo(GhostButton);
