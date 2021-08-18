import { FunctionComponent } from 'react';
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
}

type Exclusion = 'width' | 'height' | 'minConstraints' | 'maxConstraints' | 'resizeHandles';
type Params = ResizableBoxProps & { id: string };
export type BoxProps = BaseProps & Omit<ResizableBoxProps, Exclusion>;

type Props = BoxProps & { id: string };

const Box: FunctionComponent<Props> = ({
  id,
  width,
  height,
  min,
  max,
  handles,
  className,
  children,
  ...rest
}) => {
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

  return (
    <ResizableBox {...params}>
      <div className={cx('outer')}>
        <div className={cx('inner')}>{children}</div>
      </div>
    </ResizableBox>
  );
};

export default Box;
