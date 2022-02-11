import { FunctionComponent, memo } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';

import * as globalUIActions from 'actions/Common/globalUI';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import ListNode from './ListView/ListNode';

import classNames from 'classnames/bind';
import styles from './LPBody.module.scss';

const cx = classNames.bind(styles);

interface Props {
  // TODO: delete
  lpNode?: LP.Node[];
  isPreventContextmenu?: boolean;
}

const LPBody: FunctionComponent<Props> = () => {
  const dispatch = useDispatch();
  const { nodes, draggedNode } = useSelector((state) => state.lpNode);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(lpNodeActions.selectNode({ nodeId: null, assetId: null }));
    dispatch(
      globalUIActions.openContextMenu('LPBodyContextMenu', e, {
        nodeId: '__root__',
        extension: '',
        filePath: '\\root',
      }),
    );
  };

  const handleClick = () => {
    dispatch(lpNodeActions.selectNode({ nodeId: null, assetId: null }));
  };

  const handleDrop = () => {
    if (!draggedNode || draggedNode?.parentId === '__root__' || draggedNode.type === 'Motion') {
      return;
    }

    dispatch(lpNodeActions.dropNodeOnRoot());
  };

  const rootPathNodes = nodes.filter((node) => node.parentId === '__root__');

  return (
    <div className={cx('inner')} onContextMenu={handleContextMenu} onClickCapture={handleClick} onDrop={handleDrop}>
      {rootPathNodes.map((node) => (
        <div className={cx('node-row')} key={node.id}>
          <ListNode node={node} />
        </div>
      ))}
    </div>
  );
};

export default memo(LPBody);
