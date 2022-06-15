import { useDispatch } from 'react-redux';

import { BaseContextMenu, ContextMenuItem } from 'components/ContextMenu';
import { useSelector } from 'reducers';
import { ExportFormat } from 'types/common';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';

interface Props {
  node: LP.Node;
}

const ModelContextMenu = ({ node }: Props) => {
  const dispatch = useDispatch();
  const { id, assetId, parentId, type, name, childNodeIds } = node;
  const { animationData, lpNode, plaskProject } = useSelector((state) => state);
  const isCurrentVisualizedNode = !!lpNode.nodes.find((node) => node.assetId && plaskProject.visualizedAssetIds.includes(assetId || ''));

  const handleDelete = () => {
    dispatch(
      globalUIActions.openModal('ConfirmModal', {
        title: 'Delete Model',
        // TODO: 모델에 맞는 모달 메세지
        message: 'Are you sure? All files in the directory will be deleted.',
        confirmButtonColor: 'negative',
        onConfirm: () => {
          dispatch(lpNodeActions.deleteNodeSocket.request(id));
        },
      }),
    );
  };

  const handleEditName = () => {
    dispatch(lpNodeActions.setEditingNodeId(id));
  };

  const handleVisualize = () => {
    const hasMotions = childNodeIds.length !== 0;

    if (!hasMotions) {
      dispatch(lpNodeActions.addEmptyMotionAsync.request({ nodeId: id, assetId: assetId || '' }));
    }
    dispatch(lpNodeActions.visualizeModel(node));
  };

  const handleCancelVisualization = () => {
    if (assetId) {
      dispatch(lpNodeActions.cancelVisulization(assetId));
    }
  };

  const handleAddEmptyMotion = () => {
    if (assetId) {
      dispatch(
        lpNodeActions.addEmptyMotionAsync.request({
          nodeId: id,
          assetId,
        }),
      );
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
              nodeName: name,
              assetId,
              type,
            }),
          );
        },
        motions: currentMotions,
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
      {/* <ContextMenuItem onClick={handleClickItem}>
        Copy
      </ContextMenuItem>
      <ContextMenuItem onClick={handleClickItem}>
        Paste
      </ContextMenuItem> */}
      <ContextMenuItem dataCy="contextmenu-visualization" onClick={handleVisualize} disabled={isCurrentVisualizedNode}>
        Visualization
      </ContextMenuItem>
      <ContextMenuItem dataCy="contextmenu-visualization-cancel" onClick={handleCancelVisualization} disabled={!isCurrentVisualizedNode}>
        Visualization cancel
      </ContextMenuItem>
      <ContextMenuItem dataCy="contextmenu-add-empty-motion" onClick={handleAddEmptyMotion}>
        Add empty motion
      </ContextMenuItem>
      <ContextMenuItem dataCy="contextmenu-export" onClick={handleExport} disabled={!isCurrentVisualizedNode}>
        Export
      </ContextMenuItem>
    </BaseContextMenu>
  );
};

export default ModelContextMenu;
