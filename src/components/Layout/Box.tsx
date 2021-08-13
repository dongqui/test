import { FunctionComponent } from 'react';
import { ResizableBox, ResizableBoxProps } from 'react-resizable';
import classNames from 'classnames/bind';
import styles from './Box.module.scss';

const cx = classNames.bind(styles);

interface BaseProps {
  min?: [number, number];
  max?: [number, number];
}

type Props = BaseProps & Omit<ResizableBoxProps, 'minConstraints' | 'maxConstraints'>

const Box: FunctionComponent<Props> = ({
  min,
  max,
  className,
  children,
  ...rest
}) => {
  const classes = cx('wrapper', className);

  const params = {
    className: classes,
    minConstraints: min,
    maxConstraints: max,
    ...rest
  };

  return (
    <ResizableBox {...params}>
      <div className={cx('outer')}>
        <div className={cx('inner')}>
          {children}
        </div>
      </div>
    </ResizableBox>
  );
};

export default Box;
