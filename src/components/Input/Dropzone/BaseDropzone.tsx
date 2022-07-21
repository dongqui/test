import { Fragment, useCallback, ReactNode, memo } from 'react';
import { useDropzone } from 'react-dropzone';
import classNames from 'classnames/bind';
import styles from './BaseDropzone.module.scss';

const cx = classNames.bind(styles);

interface RenderProps {
  open: () => void;
}

interface Props {
  children?: (props: RenderProps) => ReactNode;
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

  const { getRootProps, isDragActive, open } = useDropzone({ onDrop: handleDrop, noClick: !clickable, disabled });

  const dropzoneProps = useCallback(() => {
    const baseStyles = cx('wrapper', className, {
      /**
       * Active styles are defined above, but if there are basic styles that can be defined in BaseDropzone, they will be added.
       * @beta
       */
      active: isDragActive,
      disabled,
    });

    const activeStyles = `${baseStyles} ${active}`;

    const classes = isDragActive ? activeStyles : baseStyles;

    return {
      ...getRootProps({
        className: classes,
      }),
    };
  }, [active, className, disabled, getRootProps, isDragActive]);

  const renderInner = useCallback(() => {
    if (children) {
      /**
       * If additional features are needed, renderProps will be added.
       * @beta
       */
      const renderProps = {
        open,
      };

      return children(renderProps);
    }

    return <Fragment />;
  }, [children, open]);

  return (
    <Fragment>
      <div {...dropzoneProps()}>{renderInner()}</div>
    </Fragment>
  );
};

export default memo(BaseDropzone);
