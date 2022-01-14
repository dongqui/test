import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import { find } from 'lodash';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';
import * as cpActions from 'actions/CP/cpModeSelection';
import { CONFIRM_04 } from 'constants/Text';
import BaseNode from './BaseNode';

interface Props {
  node: LP.Node;
}

const ModelNode = ({ node }: Props) => {
  const { id, assetId, filePath } = node;
  const dispatch = useDispatch();
  const { draggedNode } = useSelector((state) => state.lpNode);
  const { retargetMaps } = useSelector((state) => state.animationData);

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    dispatch(lpNodeActions.selectNode({ nodeId: id, assetId }));
    dispatch(
      globalUIActions.openContextMenu('ModelContextMenu', e, {
        nodeId: id,
        assetId,
      }),
    );
  };

  const isRetargetError = () => {
    const retargetMap = find(retargetMaps, { assetId });
    return retargetMap?.values.some((value) => !value.targetTransformNodeId);
  };

  const handleDrop = () => {
    if (draggedNode?.type !== 'Motion' || !draggedNode?.mocapData) return;
    if (isRetargetError()) {
      dispatch(
        globalUIActions.openModal('ConfirmModal', {
          title: 'Confirm',
          message: CONFIRM_04,
          onConfirm: () => {
            if (assetId) {
              dispatch(lpNodeActions.visualizeNode(assetId));
              dispatch(cpActions.switchMode({ mode: 'Retargeting' }));
            }
          },
        }),
      );
    } else {
      dispatch(
        lpNodeActions.dropMotionOnModel({
          nodeId: id,
          filePath,
        }),
      );
    }
  };

  const handleEditName = (newName: string) => {
    dispatch(lpNodeActions.editNodeName({ newName, nodeId: id }));
  };

  return <BaseNode node={node} handleContextMenu={handleContextMenu} handleDrop={handleDrop} handleEditName={handleEditName} />;
};

export default ModelNode;
