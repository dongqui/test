import { ElementType, Fragment, memo, ReactNode } from 'react';

import classNames from 'classnames/bind';
import styles from './Typography.module.scss';

const cx = classNames.bind(styles);

type defaultVariant = 'title' | 'button' | 'body' | 'list';
const defaultVariantMapping: { [key in defaultVariant]: string } = {
  title: 'normal 600 var(--font-size-4)"Inter"',
  button: 'normal 500 var(--font-size-3)"Inter"',
  body: 'normal 300 var(--font-size-3)"Inter"',
  list: 'normal 400 var(--font-size-4)"Inter"',
};

interface BaseProps {
  br?: boolean;
  children?: ReactNode;
  className?: string;
  component?: ElementType;
  variant?: defaultVariant;
  variantMapping?: object;
}

export type Props = BaseProps;

const defaultProps: Partial<BaseProps> = {
  br: false,
  className: 'typography',
  component: 'div',
  variant: 'body',
  variantMapping: defaultVariantMapping,
};

const Typography = (props: Props) => {
  const { br, children, className, component, variant, variantMapping } = props;
  const classes = cx('wrapper', className);

  const C = component as ElementType;

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

Typography.defaultProps = defaultProps;

export default memo(Typography);
