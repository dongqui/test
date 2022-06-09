import { FunctionComponent, memo } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';

import * as globalUIActions from 'actions/Common/globalUI';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import { ONBOARDING_ID } from 'containers/Onboarding/id';
import ListNode from './ListView/ListNode';

import classNames from 'classnames/bind';
import styles from './LPBody.module.scss';

const cx = classNames.bind(styles);

interface Props {
  lpNodes?: LP.Node[];
  isPreventContextmenu?: boolean;
}

const LPBody: FunctionComponent<Props> = ({ lpNodes }) => {
  const dispatch = useDispatch();
  const { nodes, draggedNode } = useSelector((state) => state.lpNode);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(lpNodeActions.selectNode({ nodeId: null, assetId: null }));
    dispatch(
      globalUIActions.openContextMenu('LPBodyContextMenu', e, {
        nodeId: '',
      }),
    );
  };

  const handleClick = () => {
    dispatch(lpNodeActions.selectNode({ nodeId: null, assetId: null }));
  };

  const handleDrop = () => {
    if (!draggedNode?.parentId || draggedNode.type === 'MOTION') {
      return;
    }

    dispatch(lpNodeActions.moveNodeSocket.request(''));
  };

  const rootPathNodes = (lpNodes ?? nodes).filter((node) => !node.parentId);

  return (
    <div className={cx('inner')} onContextMenu={handleContextMenu} onClick={handleClick} onDrop={handleDrop} data-cy="lp-body">
      <div className={cx('onboarding-export-file-target')} id={ONBOARDING_ID.EXPORT_FILE} />
      <div className={cx('onboarding-apply-motion-target')} id={ONBOARDING_ID.APPLY_MOTION} />
      {rootPathNodes.map((node) => (
        <div className={cx('node-row')} key={node.id}>
          <ListNode node={node} />
        </div>
      ))}
    </div>
  );
};

export default memo(LPBody);
