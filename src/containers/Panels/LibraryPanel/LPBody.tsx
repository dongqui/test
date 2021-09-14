import { FunctionComponent } from 'react';
import { ListNode } from './ListView';
import classNames from 'classnames/bind';
import styles from './LPBody.module.scss';

const cx = classNames.bind(styles);

interface Props {
  view: LP.View;
}

const LPBody: FunctionComponent<Props> = () => {
  return (
    <div className={cx('wrapper')}>
      <ListNode type="Folder" />
    </div>
  );
};

export default LPBody;
