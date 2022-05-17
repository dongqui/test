import React, { Fragment, useState } from 'react';
import { useDispatch } from 'react-redux';

import { useSelector } from 'reducers';
import { getFilePathDepth, getDescendantNodes } from 'utils/LP/FileSystem';
import ListViewNode from 'components/ListViewNode/ListViewNode';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import * as globalUIActions from 'actions/Common/globalUI';

interface Props {
  node: LP.Node;
  onContextMenu: React.MouseEventHandler;
  onDrop?: React.DragEventHandler;
  onEditName?: (newName: string) => void;
  onDragEnd?: React.DragEventHandler;
  dataCy?: string;
}

const BaseNode = ({ node, onContextMenu, onDrop, onEditName, onDragEnd, dataCy }: Props) => {
  const { id, assetId, name, type, childNodeIds, extension } = node;
  const dispatch = useDispatch();
  const [showChildren, setShowChildren] = useState(false);

  const { selectedId, nodes, editingNodeId, draggedNode, selectedNodeDescendants } = useSelector((state) => state.lpNode);
  const { visualizedAssetIds } = useSelector((state) => state.plaskProject);
  const { animationIngredients } = useSelector((state) => state.animationData);

  const isEditing = editingNodeId === id;
  const depth = getFilePathDepth(nodes, node);
  const isParentSelected = selectedNodeDescendants.some((node) => id === node.id);

  // TODO: visualized node 상태관리

  const currentVisualizedIngredient = animationIngredients.filter((ingredient) => visualizedAssetIds.includes(ingredient.assetId) && ingredient.current)[0];
  const currentVisualizedMotion = nodes.find((node) => node.animation?.uid === currentVisualizedIngredient?.id);
  const closedAndHasVisualizedDescendant = getDescendantNodes(nodes, id).some((node) => node?.id === currentVisualizedMotion?.id) && !showChildren;
  const isVisualizedUICondition = currentVisualizedMotion?.id === id || closedAndHasVisualizedDescendant;

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
    onEditName ? onEditName(newName) : dispatch(lpNodeActions.editNodeNameSocket.request({ newName, nodeId: id }));
  };

  const handleArrowButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleDrop = (e: React.DragEvent) => {
    if (draggedNode?.id === node.id) {
      e.stopPropagation();
      return;
    }

    onDrop && onDrop(e);
  };

  return (
    <Fragment>
      <ListViewNode
        depth={depth}
        type={type}
        nodeName={name}
        isSelected={selectedId === id}
        isVisualizedUICondition={isVisualizedUICondition}
        isParentSelected={isParentSelected}
        onContextMenu={handleContextMenu}
        onClick={handleClickNode}
        onDragStart={handleDragStart}
        onEditName={handleEditName}
        onDrop={handleDrop}
        onDragEnd={onDragEnd}
        onArrowButtonClick={handleArrowButtonClick}
        onCancelEdit={handleCancelEdit}
        isEditing={isEditing}
        extension={extension}
        showChildren={showChildren}
        childNodeIds={childNodeIds}
        dataCy={dataCy}
      />
    </Fragment>
  );
};

export default BaseNode;
