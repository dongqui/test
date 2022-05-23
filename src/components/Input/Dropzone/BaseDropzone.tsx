import { Fragment, useCallback, ReactNode } from 'react';
import { useDropzone } from 'react-dropzone';
import classNames from 'classnames/bind';
import styles from './BaseDropzone.module.scss';

const cx = classNames.bind(styles);

interface Props {
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  clickable?: boolean;
  active?: string;
  onDrop: (files: File[]) => void;
}

const BaseDropzone = ({ clickable = false, disabled, children, className, active, onDrop }: Props) => {
  const handleDrop = useCallback(
    (files: File[]) => {
      onDrop(files);
    },
    [onDrop],
  );

  const { getRootProps, isDragActive } = useDropzone({ onDrop: handleDrop, noClick: !clickable, disabled });

  const dropzoneProps = useCallback(() => {
    const baseStyles = cx('wrapper', className, {
      /**
       * Active styles are defined above, but if there are basic styles that can be defined in BaseDropzone, they will be added.
       * @beta
       */
      active: isDragActive,
    });

    const activeStyles = `${baseStyles} ${active}`;

    const classes = isDragActive ? activeStyles : baseStyles;

    return {
      ...getRootProps({
        className: classes,
      }),
    };
  }, [active, className, getRootProps, isDragActive]);

  return (
    <Fragment>
      <div {...dropzoneProps()}>{children}</div>
    </Fragment>
  );
};

export default BaseDropzone;
