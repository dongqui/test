import { Fragment, useState } from 'react';
import { useDispatch } from 'react-redux';

import { useSelector } from 'reducers';
import ListViewNode from 'components/ListViewNode/ListViewNode';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';

interface Props {
  node: LP.Node;
  onContextMenu: React.MouseEventHandler;
  onDrop?: React.DragEventHandler;
  onEditName?: (newName: string) => void;
  onDragEnd?: React.DragEventHandler;
}

const BaseNode = ({ node, onContextMenu, onDrop, onEditName, onDragEnd }: Props) => {
  const { id, assetId, name, type, filePath, childNodeIds, extension } = node;
  const dispatch = useDispatch();
  const [showChildren, setShowChildren] = useState(false);

  const { selectedId, nodes, editingNodeId } = useSelector((state) => state.lpNode);
  const { visualizedAssetIds } = useSelector((state) => state.plaskProject);
  const { animationIngredients } = useSelector((state) => state.animationData);

  const isEditing = editingNodeId === id;
  const depth = (filePath.match(/\\/g) || []).length;

  // -- 개선? --
  const currentVisualizedNode = nodes.find((node) => visualizedAssetIds.includes(node.assetId || ''));
  const currentVisualizedMotion = animationIngredients.filter((ingredient) => ingredient.assetId === currentVisualizedNode?.assetId && ingredient.current);

  const currentVisualizedNodePath = (currentVisualizedNode?.filePath + `\\${currentVisualizedNode?.name}`).split('\\').filter((text) => !!text);
  const currentNodePath = (filePath + `\\${name}`).split('\\').filter((text) => !!text);

  let hasCurrentVisualizedNode = false;
  currentNodePath.forEach((path, i) => {
    if (path === currentVisualizedNodePath[i]) {
      hasCurrentVisualizedNode = true;
    } else {
      hasCurrentVisualizedNode = false;
    }
  });

  const isOpenVisualized = showChildren && hasCurrentVisualizedNode;

  const isCloseVisualized = !!(type === 'Motion'
    ? assetId && currentVisualizedMotion[0]?.assetId === assetId && currentVisualizedMotion[0]?.name === name
    : type === 'Model'
    ? !showChildren && assetId && visualizedAssetIds.includes(assetId)
    : !showChildren && hasCurrentVisualizedNode);
  // -- 개선? --

  const handleClickNode = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(lpNodeActions.selectNode({ nodeId: id, assetId }));
    dispatch(globalUIActions.closeContextMenu());
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    const draggedNode = nodes.find((node) => node.id === id);
    if (draggedNode) {
      dispatch(lpNodeActions.setDraggedNode(draggedNode));
    }
  };

  const handleEditName = (newName: string) => {
    onEditName ? onEditName(newName) : dispatch(lpNodeActions.editNodeName({ newName, nodeId: id }));
  };

  const handleArrowButtonClick = (e: React.MouseEvent) => {
    setShowChildren(!showChildren);
  };

  const handleCancelEdit = () => {
    dispatch(lpNodeActions.setEditingNodeId(null));
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onContextMenu(e);
  };

  return (
    <Fragment>
      <ListViewNode
        depth={depth}
        type={type}
        nodeName={name}
        isSelected={selectedId === id}
        isOpenVisualized={isOpenVisualized}
        isCloseVisualized={isCloseVisualized}
        onContextMenu={handleContextMenu}
        onClick={handleClickNode}
        onDragStart={handleDragStart}
        onEditName={handleEditName}
        onDrop={onDrop}
        onDragEnd={onDragEnd}
        onArrowButtonClick={handleArrowButtonClick}
        onCancelEdit={handleCancelEdit}
        isEditing={isEditing}
        extension={extension}
        showChildren={showChildren}
        childNodeIds={childNodeIds}
      />
    </Fragment>
  );
};

export default BaseNode;
