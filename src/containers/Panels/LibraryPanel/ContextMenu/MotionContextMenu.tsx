import { useDispatch } from 'react-redux';

import { BaseContextMenu, ContextMenuItem } from 'components/ContextMenu';
import { useSelector } from 'reducers';
import { ExportFormat } from 'types/common';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';
interface Props {
  nodeId: string;
  parentId: string;
  nodeName: string;
  assetId?: string;
  animationId?: string;
  type: string;
}

const MotionContextMenu = ({ nodeId, parentId, nodeName, assetId, type, animationId }: Props) => {
  const dispatch = useDispatch();
  const { lpNode, plaskProject, animationData } = useSelector((state) => state);
  const isCurrentVisualizedNode = !!animationData.animationIngredients.find((animationIngredient) => animationIngredient.id === animationId && animationIngredient.current);
  const handleDelete = () => {
    dispatch(
      globalUIActions.openModal('ConfirmModal', {
        title: 'Delete Folder',
        // TODO: MOTION 삭제 메세지
        message: 'Are you sure? All files in the directory will be deleted.',
        onConfirm: () => {
          dispatch(lpNodeActions.deleteNodeSocket.request(nodeId));
        },
        onCancel: () => {},
      }),
    );
  };

  const handleEditName = () => {
    dispatch(lpNodeActions.setEditingNodeId(nodeId));
  };

  const handleDuplicate = () => {
    dispatch(
      lpNodeActions.duplicateMotionAsync.request({
        nodeId,
        parentId,
        nodeName,
      }),
    );
  };

  const handleVisualize = () => {
    dispatch(
      lpNodeActions.visualizeMotion({
        nodeId,
        parentId,
        assetId,
      }),
    );
  };

  const handleCancelVisualization = () => {
    if (assetId) {
      dispatch(lpNodeActions.cancelVisulization(assetId));
    }
  };

  const handleExport = () => {
    if (!assetId) return;

    const currentMotions = lpNode.nodes.filter((node) => assetId === node.assetId && node.type === 'MOTION');
    dispatch(
      globalUIActions.openModal('ExportModal', {
        onConfirm: (data: { motion: string; format: ExportFormat }) => {
          dispatch(
            lpNodeActions.exportAsset({
              ...data,
              parentId,
              nodeName,
              assetId,
              type,
            }),
          );
        },
        motions: currentMotions,
        targetMotrionId: nodeId,
      }),
    );
  };

  return (
    <BaseContextMenu>
      <ContextMenuItem dataCy="contextmenu-delete" onClick={handleDelete}>
        Delete
      </ContextMenuItem>
      <ContextMenuItem dataCy="contextmenu-edit-name" onClick={handleEditName}>
        Edit name
      </ContextMenuItem>
      <ContextMenuItem onClick={handleDuplicate}>Duplicate</ContextMenuItem>
      {/* <ContextMenuItem>Copy</ContextMenuItem>
      <ContextMenuItem>Paste</ContextMenuItem> */}
      <ContextMenuItem onClick={handleVisualize} disabled={isCurrentVisualizedNode}>
        Visualization
      </ContextMenuItem>
      <ContextMenuItem onClick={handleCancelVisualization} disabled={!isCurrentVisualizedNode}>
        Visualization cancel
      </ContextMenuItem>
      <ContextMenuItem onClick={handleExport} disabled={!isCurrentVisualizedNode}>
        Export
      </ContextMenuItem>
    </BaseContextMenu>
  );
};

export default MotionContextMenu;
