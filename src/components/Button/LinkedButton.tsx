import { FunctionComponent, memo, MouseEvent, useCallback, AnchorHTMLAttributes } from 'react';
import NextLink from 'next/link';

import { ButtonColor } from 'types/common';

import classNames from 'classnames/bind';
import styles from './LinkedButton.module.scss';

const cx = classNames.bind(styles);

interface BaseProps {
  variant?: 'filled' | 'outlined';
  size?: 'small' | 'medium' | 'large';
  color?: ButtonColor;
  text?: string;
  fullSize?: boolean;
  dataCy?: string;
  disabled?: boolean;
}

export type Props = BaseProps & AnchorHTMLAttributes<HTMLAnchorElement>;

const defaultProps: Partial<BaseProps> = {
  variant: 'filled',
  color: 'primary',
  size: 'small',
};

const LinkedButton: FunctionComponent<Props> = ({ variant, size, text, color, fullSize, disabled, onClick, className, children, dataCy, href, ...rest }) => {
  const classes = cx(variant, className, size, color, {
    disabled,
    fullSize,
  });

  const isExternal = href && href.includes('://');

  if (!href) {
    return (
      <a className={classes} {...rest}>
        {text || children}
      </a>
    );
  }

  if (isExternal) {
    return (
      <a className={classes} href={href} {...rest}>
        {text || children}
      </a>
    );
  }

  return (
    <NextLink href={href} {...rest}>
      <a className={classes}>{text || children}</a>
    </NextLink>
  );
};

LinkedButton.defaultProps = defaultProps;

export default memo(LinkedButton);
