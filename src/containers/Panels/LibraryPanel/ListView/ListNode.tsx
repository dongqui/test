import { FunctionComponent, ReactNode, useCallback, forwardRef } from 'react';
import { useDispatch } from 'react-redux';
import { IconWrapper, SvgPath } from 'components/Icon';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import classNames from 'classnames/bind';
import styles from './ListNode.module.scss';

const cx = classNames.bind(styles);

interface Props {
  type: 'Folder' | 'Model' | 'Motion';
  name: ReactNode;
  fileURL?: string | File;
}

const ListNode = forwardRef<HTMLDivElement, Props>(({ type, name, fileURL }, ref) => {
  const dispatch = useDispatch();

  const arrowClasses = cx('icon-arrow', {
    invisible: type === 'Motion',
  });

  const handleArrowClick = useCallback(() => {
    // dispatch(lpNodeActions.visualize(fileURL));
  }, []);

  return (
    <div className={cx('wrapper')} ref={ref}>
      <IconWrapper icon={SvgPath.FilledArrow} className={arrowClasses} onClick={handleArrowClick} />
      <IconWrapper icon={SvgPath[type]} className={cx('icon-type')} />
      <div className={cx('name')}>{name}</div>
    </div>
  );
});

export default ListNode;
