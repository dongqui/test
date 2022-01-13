import { ContextMenu, ContextMenuItem } from 'components/Contextmenu';
import { ContextMenuClickItemHandler } from 'types/common';
import { useDispatch } from 'react-redux';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';

const MotionContextMenu = () => {
  const dispatch = useDispatch();
  const handleClickItem: ContextMenuClickItemHandler = (event, propsFromTrigger) => {
    switch (event.currentTarget.id) {
      case 'delete':
        dispatch(
          globalUIActions.openModal('ConfirmModal', {
            title: 'Delete Folder',
            // TODO: MOTION 삭제 메세지
            message: 'Are you sure? All files in the directory will be deleted.',
            onConfirm: () => {
              dispatch(lpNodeActions.deleteNode({ nodeId: propsFromTrigger.selectId }));
            },
            onCancel: () => {},
          }),
        );
        break;
      case 'edit-name':
        // TODO
        break;
      case 'Duplicate':
        dispatch(
          lpNodeActions.duplicateMotion({
            nodeId: propsFromTrigger.selectId,
            parentId: propsFromTrigger.parentId,
            nodeName: propsFromTrigger.nodeName,
          }),
        );
        break;
      // case 'copy':
      //   break;
      // case 'paste':
      //   break;
      case 'visualization':
        dispatch(
          lpNodeActions.visualizeMotion({
            nodeId: propsFromTrigger.selectId,
            parentId: propsFromTrigger.parentId,
            assetId: propsFromTrigger.assetId,
          }),
        );
        break;
      case 'visualization-cancel':
        dispatch(lpNodeActions.cancelVisulization(propsFromTrigger.assetId));
        break;
      case 'export':
        // TODO
        break;
    }
  };
  return (
    <ContextMenu contextMenuId="MotionContextMenu">
      <ContextMenuItem id="delete" onClick={handleClickItem}>
        Delete
      </ContextMenuItem>
      <ContextMenuItem id="edit-name" onClick={handleClickItem}>
        Edit name
      </ContextMenuItem>
      <ContextMenuItem id="duplicate" onClick={handleClickItem}>
        Duplicate
      </ContextMenuItem>
      {/* <ContextMenuItem id="copy" onClick={handleClickItem}>
        Copy
      </ContextMenuItem>
      <ContextMenuItem id="paste" onClick={handleClickItem}>
        Paste
      </ContextMenuItem> */}
      <ContextMenuItem id="visualization" onClick={handleClickItem}>
        Visualization
      </ContextMenuItem>
      <ContextMenuItem id="visualization-cancel" onClick={handleClickItem}>
        Visualization cancel
      </ContextMenuItem>
      <ContextMenuItem id="export" onClick={handleClickItem}>
        Export
      </ContextMenuItem>
    </ContextMenu>
  );
};

export default MotionContextMenu;
