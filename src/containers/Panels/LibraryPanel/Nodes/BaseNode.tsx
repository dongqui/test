import { Fragment, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import ListViewNode from 'components/ListViewNode/ListViewNode';
import ListChildren from '../ListView/ListChildren copy';
import * as lpNodeActions from 'actions/LP/lpNodeAction';

interface Props {
  node: LP.Node;
  handleContextMenu: React.MouseEventHandler;
  handleDrop?: React.DragEventHandler;
  handleEditName?: (newName: string) => void;
}

const BaseNode = ({ node, handleContextMenu, handleDrop, handleEditName }: Props) => {
  const { id, assetId, name, type, filePath, childrens } = node;
  const dispatch = useDispatch();
  const { selectedId, nodes, editingNodeId } = useSelector((state) => state.lpNode);
  const { visualizedAssetIds } = useSelector((state) => state.plaskProject);
  const [showChildren, setShowChildren] = useState(false);

  const isVisualized = !!(assetId && visualizedAssetIds.includes(assetId));
  const isCloseVisualized = false;
  const isEditing = editingNodeId === id;
  const depth = (filePath.match(/\\/g) || []).length;

  const _handleClickNode = () => {
    dispatch(lpNodeActions.selectNode({ nodeId: id, assetId }));
  };

  const _handleDragStart = () => {
    const draggedNode = nodes.find((node) => node.id === id);
    if (draggedNode) {
      dispatch(lpNodeActions.dragNodeStart(draggedNode));
    }
  };

  const _handleEditName = (newName: string) => {
    handleEditName ? handleEditName(newName) : dispatch(lpNodeActions.editNodeName({ newName, nodeId: id }));
  };

  const _handleClickArrowButton = () => {
    setShowChildren(!showChildren);
  };

  return (
    <Fragment>
      <ListViewNode
        depth={depth}
        type={type}
        onContextMenu={handleContextMenu}
        nodeName={name}
        isSelected={selectedId === id}
        isVisualized={isVisualized}
        isCloseVisualized={isCloseVisualized}
        handleClickNode={_handleClickNode}
        handleDragStart={_handleDragStart}
        handleEditName={_handleEditName}
        handleDrop={handleDrop}
        handleClickArrowButton={_handleClickArrowButton}
        isEditing={isEditing}
      />
      {showChildren && <ListChildren items={childrens} />}
    </Fragment>
  );
};

export default BaseNode;
