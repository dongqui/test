import { FunctionComponent, ReactNode, useCallback } from 'react';
import { IconWrapper, SvgPath } from 'components/Icon';
import classNames from 'classnames/bind';
import styles from './ListNode.module.scss';

const cx = classNames.bind(styles);

interface Props {
  type: 'Folder' | 'Model' | 'Motion';
  name: ReactNode;
}

const ListNode: FunctionComponent<Props> = ({ type, name }) => {
  const arrowClasses = cx('icon-arrow', {
    invisible: type === 'Motion',
  });

  const handleArrowClick = useCallback(() => {
    console.log('handleArrowClick');
  }, []);

  return (
    <div className={cx('wrapper')}>
      <IconWrapper icon={SvgPath.FilledArrow} className={arrowClasses} onClick={handleArrowClick} />
      <IconWrapper icon={SvgPath[type]} className={cx('icon-type')} />
      <div className={cx('name')}>{name}</div>
    </div>
  );
};

export default ListNode;
