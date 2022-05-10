import { ButtonHTMLAttributes, FunctionComponent, memo, MouseEvent, useCallback } from 'react';

import classNames from 'classnames/bind';
import styles from './ExpandButton.module.scss';
import { IconWrapper, SvgPath } from 'components/Icon';

const cx = classNames.bind(styles);

interface BaseProps {
  content: FunctionComponent | string;
  variant?: 'default' | 'ghost';
  fullSize?: boolean;
}

export type Props = BaseProps & ButtonHTMLAttributes<HTMLButtonElement>;

const defaultProps: Partial<BaseProps> = {
  variant: 'default',
  fullSize: false,
};

const ExpandButton: FunctionComponent<Props> = ({ content, variant, color, fullSize, disabled, onClick, className, children, ...rest }) => {
  const classes = cx('expand', className, variant, {
    disabled,
    fullSize,
    isText: typeof content === 'string',
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
      <IconWrapper icon={SvgPath.EmptyDownArrow} className={cx('button-arrow')} />
    </button>
  );
};

ExpandButton.defaultProps = defaultProps;

export default memo(ExpandButton);
