import { Fragment, memo, forwardRef } from 'react';
import { IconWrapper, SvgPath } from 'components/Icon';
import classNames from 'classnames/bind';
import styles from './ArrowButton.module.scss';

const cx = classNames.bind(styles);

interface Props {
  isOpen?: boolean;
  hidden?: boolean;
}

const ArrowButton = forwardRef<HTMLDivElement, Props>(({ isOpen, hidden }, ref) => {
  const icon = isOpen ? SvgPath.ArrowOpen : SvgPath.ArrowClose;
  const shows = !hidden;

  return (
    <Fragment>
      {shows && (
        <div className={cx('wrapper')} ref={ref}>
          <IconWrapper icon={icon} className={cx('icon')} />
        </div>
      )}
    </Fragment>
  );
});

ArrowButton.displayName = 'ArrowButton';

export default memo(ArrowButton);
