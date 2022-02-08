import { BaseContextMenu, ContextMenuItem } from 'components/ContextMenu';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';

interface Props {
  nodeId: string;
  assetId: string;
  parentId: string;
  type: string;
  nodeName: string;
  childrens: string[];
}

const ModelContextMenu = ({ nodeId, assetId, parentId, type, nodeName, childrens }: Props) => {
  const dispatch = useDispatch();
  const { animationData, lpNode, plaskProject } = useSelector((state) => state);
  const isCurrentVisualizedNode = !!lpNode.nodes.find((node) => node.assetId && plaskProject.visualizedAssetIds.includes(assetId || ''));

  const handleDelete = () => {
    dispatch(
      globalUIActions.openModal('ConfirmModal', {
        title: 'Delete Model',
        // TODO: 모델에 맞는 모달 메세지
        message: 'Are you sure? All files in the directory will be deleted.',
        confirmButtonColor: 'error',
        onConfirm: () => {
          dispatch(lpNodeActions.deleteModel({ nodeId, assetId, parentId }));
        },
      }),
    );
  };

  const handleEditName = () => {
    dispatch(lpNodeActions.setEditingNodeId(nodeId));
  };

  const handleVisualize = () => {
    const hasMotions = childrens.length !== 0;

    if (!hasMotions) {
      dispatch(lpNodeActions.addEmptyMotion({ nodeId, assetId }));
    }
    dispatch(lpNodeActions.visualizeNode(assetId));
  };

  const handleCancelVisualization = () => {
    if (assetId) {
      dispatch(lpNodeActions.cancelVisulization(assetId));
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
        onConfirm: (data: { motion: string; format: 'fbx' | 'glb' | 'bvh' }) => {
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
      }),
    );
  };

  return (
    <BaseContextMenu>
      <ContextMenuItem onClick={handleDelete}>Delete</ContextMenuItem>
      <ContextMenuItem onClick={handleEditName}>Edit name</ContextMenuItem>
      {/* <ContextMenuItem onClick={handleClickItem}>
        Copy
      </ContextMenuItem>
      <ContextMenuItem onClick={handleClickItem}>
        Paste
      </ContextMenuItem> */}
      <ContextMenuItem onClick={handleVisualize} disabled={isCurrentVisualizedNode}>
        Visualization
      </ContextMenuItem>
      <ContextMenuItem onClick={handleCancelVisualization} disabled={!isCurrentVisualizedNode}>
        Visualization cancel
      </ContextMenuItem>
      <ContextMenuItem onClick={handleAddEmptyMotion}>Add empty motion</ContextMenuItem>
      <ContextMenuItem onClick={handleExport} disabled={!isCurrentVisualizedNode}>
        Export
      </ContextMenuItem>
    </BaseContextMenu>
  );
};

export default ModelContextMenu;
