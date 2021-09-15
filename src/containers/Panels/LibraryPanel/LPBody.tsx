import { FunctionComponent } from 'react';
import { ListNode } from './ListView';
import classNames from 'classnames/bind';
import styles from './LPBody.module.scss';

const cx = classNames.bind(styles);

interface Props {
  view: LP.View;
  nodes: LP.Node[];
}

const LPBody: FunctionComponent<Props> = ({ view, nodes }) => {
  return (
    <div className={cx('wrapper')}>
      {nodes.map((node) => (
        <ListNode key={node.id} type={node.type} name={node.name} fileURL={node.fileURL} />
      ))}
    </div>
  );
};

export default LPBody;
