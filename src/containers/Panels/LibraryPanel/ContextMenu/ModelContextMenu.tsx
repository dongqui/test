import { useDispatch } from 'react-redux';

import { BaseContextMenu, ContextMenuItem } from 'components/ContextMenu';
import { useSelector } from 'reducers';
import { ExportFormat } from 'types/common';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';
import { useContext } from 'react';
import { BabylonContext } from 'contexts/RP/BabylonContext';

interface Props {
  nodeId: string;
  assetId: string;
  parentId: string;
  type: string;
  nodeName: string;
  childNodeIds: string[];
}

const ModelContextMenu = ({ nodeId, assetId, parentId, type, nodeName, childNodeIds }: Props) => {
  const dispatch = useDispatch();
  const { animationData, lpNode, plaskProject } = useSelector((state) => state);
  const isCurrentVisualizedNode = !!lpNode.nodes.find((node) => node.assetId && plaskProject.visualizedAssetIds.includes(assetId || ''));
  const { plaskEngine } = useContext(BabylonContext);

  const handleDelete = () => {
    dispatch(
      globalUIActions.openModal('ConfirmModal', {
        title: 'Delete Model',
        // TODO: 모델에 맞는 모달 메세지
        message: 'Are you sure? All files in the directory will be deleted.',
        confirmButtonColor: 'error',
        onConfirm: () => {
          dispatch(lpNodeActions.deleteModel({ nodeId, assetId, parentId, plaskEngine }));
        },
      }),
    );
  };

  const handleEditName = () => {
    dispatch(lpNodeActions.setEditingNodeId(nodeId));
  };

  const handleVisualize = () => {
    const hasMotions = childNodeIds.length !== 0;

    if (!hasMotions) {
      dispatch(lpNodeActions.addEmptyMotion({ nodeId, assetId }));
    }
    dispatch(lpNodeActions.visualizeNode({ assetId, plaskEngine }));
  };

  const handleCancelVisualization = () => {
    if (assetId) {
      dispatch(lpNodeActions.cancelVisulization({ assetId, plaskEngine }));
    }
  };

  const handleAddEmptyMotion = () => {
    if (assetId) {
      dispatch(
        lpNodeActions.addEmptyMotion({
          nodeId,
          assetId,
        }),
      );
    }
  };

  const handleExport = () => {
    if (!assetId) return;

    const currentMotions = animationData.animationIngredients.filter((ingredient) => assetId === ingredient.assetId);
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
              plaskEngine,
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
