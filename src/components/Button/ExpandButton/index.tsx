import { ButtonHTMLAttributes, FunctionComponent, memo, MouseEvent, useCallback } from 'react';
import { IconWrapper, SvgPath } from 'components/Icon';

import classNames from 'classnames/bind';
import styles from './ExpandButton.module.scss';

const cx = classNames.bind(styles);

interface BaseProps {
  content: FunctionComponent<React.PropsWithChildren<unknown>> | string;
  type?: 'default' | 'ghost';
  fullSize?: boolean;
  paddingMiddle?: boolean;
  disableHover?: boolean;
}

export type Props = BaseProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'>;

const defaultProps: Partial<BaseProps> = {
  type: 'default',
  fullSize: false,
};

const ExpandButton: FunctionComponent<React.PropsWithChildren<Props>> = ({
  content,
  type,
  color,
  fullSize,
  disabled,
  onClick,
  className,
  paddingMiddle,
  disableHover,
  children,
  ...rest
}) => {
  const classes = cx('expand', className, type, {
    disabled,
    fullSize,
    isText: typeof content === 'string',
    disableHover,
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
      {typeof content === 'string' ? <span className={cx('button-content')}>{content}</span> : <IconWrapper className={cx('button-content')} icon={content} />}
      <IconWrapper icon={SvgPath.EmptyDownArrow} className={cx('button-arrow', { paddingMiddle })} />
    </button>
  );
};

ExpandButton.defaultProps = defaultProps;

export default memo(ExpandButton);
