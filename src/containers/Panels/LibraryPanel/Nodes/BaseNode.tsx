import React, { Fragment, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import ListViewNode from 'components/ListViewNode/ListViewNode';
import * as lpNodeActions from 'actions/LP/lpNodeAction';

interface Props {
  node: LP.Node;
  handleContextMenu: React.MouseEventHandler;
  handleDrop?: React.DragEventHandler;
  handleEditName?: (newName: string) => void;
  handleDragEnd?: React.DragEventHandler;
}

const BaseNode = ({ node, handleContextMenu, handleDrop, handleEditName, handleDragEnd }: Props) => {
  const { id, assetId, name, type, filePath, childrens, extension } = node;
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

  if (type === 'Model') {
    console.log(currentVisualizedNode);
  }

  let hasCurrentVisualizedNode = false;
  currentNodePath.forEach((path, i) => {
    if (type === 'Folder') {
      console.log(path, currentVisualizedNodePath[i]);
    }
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

  const _handleClickNode = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(lpNodeActions.selectNode({ nodeId: id, assetId }));
  };

  const _handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    const draggedNode = nodes.find((node) => node.id === id);
    if (draggedNode) {
      dispatch(lpNodeActions.dragNodeStart(draggedNode));
    }
  };

  const _handleEditName = (newName: string) => {
    handleEditName ? handleEditName(newName) : dispatch(lpNodeActions.editNodeName({ newName, nodeId: id }));
  };

  const _handleClickArrowButton = (e: React.MouseEvent) => {
    setShowChildren(!showChildren);
  };

  const _handleCancelEdit = () => {
    dispatch(lpNodeActions.setEditingNodeId(null));
  };

  return (
    <Fragment>
      <ListViewNode
        depth={depth}
        type={type}
        onContextMenu={handleContextMenu}
        nodeName={name}
        isSelected={selectedId === id}
        isOpenVisualized={isOpenVisualized}
        isCloseVisualized={isCloseVisualized}
        handleClickNode={_handleClickNode}
        handleDragStart={_handleDragStart}
        handleEditName={_handleEditName}
        handleDrop={handleDrop}
        handleDragEnd={handleDragEnd}
        handleClickArrowButton={_handleClickArrowButton}
        handleCancelEdit={_handleCancelEdit}
        isEditing={isEditing}
        extension={extension}
        showChildren={showChildren}
        childrenNodeIds={childrens}
      />
    </Fragment>
  );
};

export default BaseNode;
