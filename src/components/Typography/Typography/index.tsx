import { ElementType, Fragment, memo, ReactNode } from 'react';
import typo from './typography.json';

import classNames from 'classnames/bind';
import styles from './Typography.module.scss';

const cx = classNames.bind(styles);

const defaultVariantMapping = { ...typo.common, ...typo.special };
type defaultVariant = keyof typeof defaultVariantMapping;

interface BaseProps {
  br?: boolean;
  children?: ReactNode;
  className?: string;
  component?: ElementType;
  variant?: defaultVariant;
  variantMapping?: object;
}

export type Props = BaseProps;

const Typography = ({ br = false, children, className, component = 'div', variant = 'body', variantMapping = defaultVariantMapping }: Props) => {
  const classes = cx('wrapper', className);
  const C = component;

  return (
    <Fragment>
      {/*@ts-ignore*/}
      <C className={classes} style={{ font: variantMapping[variant] }}>
        {children}
      </C>
      {br && <br />}
    </Fragment>
  );
};

export default memo(Typography);
