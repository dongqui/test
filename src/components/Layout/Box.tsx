import { FunctionComponent, memo, RefObject, ReactNode } from 'react';
import { ResizableBox, ResizableBoxProps, ResizeHandle } from 'react-resizable';
import { useWindowSize } from 'hooks/common';
import classNames from 'classnames/bind';
import styles from './Box.module.scss';

const cx = classNames.bind(styles);

interface BaseProps {
  width?: number;
  height?: number;
  min?: [number, number];
  max?: [number, number];
  handles?: ResizeHandle[];
  noResize?: boolean;
  innerRef?: RefObject<HTMLDivElement>;
  children: ReactNode;
}

type Exclusion = 'width' | 'height' | 'minConstraints' | 'maxConstraints' | 'resizeHandles';
type Params = ResizableBoxProps & {
  id: string;
};
export type BoxProps = BaseProps & Omit<ResizableBoxProps, Exclusion>;

type Props = BoxProps & { id: string };

const Box: FunctionComponent<Props> = ({ id, width, height, min, max, handles, className, noResize, innerRef, children, ...rest }) => {
  const [innerWidth, innerHeight] = useWindowSize();

  const classes = cx('wrapper', className);

  const params: Params = {
    id: id,
    className: classes,
    width: width || innerWidth,
    height: height || innerHeight,
    minConstraints: min,
    maxConstraints: max,
    resizeHandles: handles,
    ...rest,
  };

  if (noResize) {
    return (
      <div id={id} className={classes} ref={innerRef}>
        <div className={cx('outer')}>
          <div className={cx('inner')}>{children}</div>
        </div>
      </div>
    );
  }

  return (
    <ResizableBox {...params}>
      <div className={cx('outer')}>
        <div className={cx('inner')}>{children}</div>
      </div>
    </ResizableBox>
  );
};

export default memo(Box);
