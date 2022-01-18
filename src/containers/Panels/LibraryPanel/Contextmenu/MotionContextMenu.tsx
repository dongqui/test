import { BaseContextMenu, ContextMenuItem } from 'components/Contextmenu';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';
interface Props {
  nodeId: string;
  parentId: string;
  nodeName: string;
  assetId?: string;
}

const MotionContextMenu = ({ nodeId, parentId, nodeName, assetId }: Props) => {
  const dispatch = useDispatch();
  const { lpNode, plaskProject } = useSelector((state) => state);
  const isCurrentVisualizedNode = !!lpNode.nodes.find((node) => node.assetId && plaskProject.visualizedAssetIds.includes(assetId || ''));

  const handleDelete = () => {
    dispatch(
      globalUIActions.openModal('ConfirmModal', {
        title: 'Delete Folder',
        // TODO: MOTION 삭제 메세지
        message: 'Are you sure? All files in the directory will be deleted.',
        onConfirm: () => {
          dispatch(lpNodeActions.deleteNode({ nodeId }));
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
      lpNodeActions.duplicateMotion({
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

  const handleExport = () => {};

  return (
    <BaseContextMenu>
      <ContextMenuItem onClick={handleDelete}>Delete</ContextMenuItem>
      <ContextMenuItem onClick={handleEditName}>Edit name</ContextMenuItem>
      {parentId !== '__root__' && (
        <>
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
        </>
      )}
    </BaseContextMenu>
  );
};

export default MotionContextMenu;
