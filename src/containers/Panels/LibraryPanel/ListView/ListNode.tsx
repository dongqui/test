import { FunctionComponent } from 'react';
import { IconWrapper, SvgPath } from 'components/Icon';
import classNames from 'classnames/bind';
import styles from './ListNode.module.scss';

const cx = classNames.bind(styles);

interface Props {
  type: 'Folder' | 'Model' | 'Motion';
}

const ListNode: FunctionComponent<Props> = ({ type }) => {
  return (
    <div className={cx('wrapper')}>
      <IconWrapper icon={SvgPath.FilledArrow} className={cx('icon-arrow')} />
      <IconWrapper icon={SvgPath[type]} className={cx('icon-type')} />
      <div className={cx('name')}>Directory</div>
    </div>
  );
};

export default ListNode;
