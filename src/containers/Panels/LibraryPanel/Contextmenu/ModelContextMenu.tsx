import { BaseContextMenu, ContextMenuItem } from 'components/Contextmenu';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';

interface Props {
  nodeId: string;
  assetId?: string;
}

const ModelContextMenu = ({ nodeId, assetId }: Props) => {
  const dispatch = useDispatch();
  const { animationIngredients } = useSelector((state) => state.animationData);

  const handleDelete = () => {
    dispatch(
      globalUIActions.openModal('ConfirmModal', {
        title: 'Delete Model',
        // TODO: 모델에 맞는 모달 메세지
        message: 'Are you sure? All files in the directory will be deleted.',
        onConfirm: () => {
          dispatch(lpNodeActions.deleteNode({ nodeId }));
        },
      }),
    );
  };

  const handleEditName = () => {
    dispatch(lpNodeActions.setEditingNodeId(nodeId));
  };

  const handleVisualize = () => {
    if (assetId) {
      dispatch(lpNodeActions.visualizeNode(assetId));
    }
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
    const currentMotions = animationIngredients.filter((ingredient) => assetId === ingredient.assetId);
    dispatch(
      globalUIActions.openModal('ExportModal', {
        onConfirm: () => {},
        onCancel: () => {},
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
      <ContextMenuItem onClick={handleVisualize}>Visualization</ContextMenuItem>
      <ContextMenuItem onClick={handleCancelVisualization}>Visualization cancel</ContextMenuItem>
      <ContextMenuItem onClick={handleAddEmptyMotion}>Add empty motion</ContextMenuItem>
      <ContextMenuItem onClick={handleExport}>Export</ContextMenuItem>
    </BaseContextMenu>
  );
};

export default ModelContextMenu;
