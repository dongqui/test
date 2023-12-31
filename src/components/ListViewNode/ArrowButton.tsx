import { Fragment, memo, forwardRef } from 'react';
import { IconWrapper, SvgPath } from 'components/Icon';
import classNames from 'classnames/bind';
import styles from './ArrowButton.module.scss';

const cx = classNames.bind(styles);

interface Props {
  isOpen?: boolean;
  hidden?: boolean;
  onArrowButtonClick?: React.MouseEventHandler<HTMLDivElement>;
}

const ArrowButton = ({ isOpen, hidden, onArrowButtonClick }: Props) => {
  const icon = isOpen ? SvgPath.ArrowOpen : SvgPath.ArrowClose;
  const shows = !hidden;

  return (
    <Fragment>
      {shows && (
        <div className={cx('wrapper')} onClick={onArrowButtonClick} data-cy="arrow-icon">
          <IconWrapper className={cx('icon')} icon={icon} />
        </div>
      )}
    </Fragment>
  );
};

ArrowButton.displayName = 'ArrowButton';

export default memo(ArrowButton);
