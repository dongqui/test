import { useState, Fragment } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import { find } from 'lodash';
import ListViewNode from 'components/ListViewNode/ListViewNode';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import { useContextMenu } from 'components/Contextmenu';
import ListChildren from '../ListView/ListChildren copy';

interface Props {
  nodeId: string;
  assetId?: string;
  nodeName: string;
  filePath: string;
  depth: number;
  childrenNodeIds: string[];
}

const ModelNode = ({ nodeId, assetId, nodeName, depth, childrenNodeIds, filePath }: Props) => {
  const dispatch = useDispatch();
  const { showContextMenu } = useContextMenu();
  const { selectedId, nodes, draggedNode } = useSelector((state) => state.lpNode);
  const { retargetMaps } = useSelector((state) => state.animationData);
  const { visualizedAssetIds } = useSelector((state) => state.plaskProject);
  const [showsChildrens, setShowsChildrens] = useState(false);

  const isVisualized = !!(assetId && visualizedAssetIds.includes(assetId));
  // TODO
  const isCloseVisualized = false;

  const onContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    dispatch(lpNodeActions.selectNode({ nodeId, assetId }));
    showContextMenu({
      contextMenuId: 'ModelContextMenu',
      event: e,
      props: {
        selectId: nodeId,
        assetId,
      },
    });
  };

  const handleClickNode = () => {
    dispatch(lpNodeActions.selectNode({ nodeId, assetId }));
  };

  const handleClickArrowButton = () => {
    setShowsChildrens(!showsChildrens);
  };

  const handleDragStart = () => {
    const draggedNode = nodes.find((node) => node.id === nodeId);
    if (draggedNode) {
      dispatch(lpNodeActions.dragNodeStart(draggedNode));
    }
  };

  const isRetargetError = () => {
    const retargetMap = find(retargetMaps, { assetId });
    return retargetMap?.values.some((value) => !value.targetTransformNodeId);
  };

  const handleDrop = () => {
    if (draggedNode?.type !== 'Motion' || !draggedNode?.mocapData) return;
    if (isRetargetError()) {
      // onModalOpen('ConfirmModal', {
      //   title: 'Confirm',
      //   message: CONFIRM_04,
      //   onConfirm: () => {
      //     if (assetId) {
      //       dispatch(lpNodeActions.visualizeNode(assetId));
      //       dispatch(cpActions.switchMode({ mode: 'Retargeting' }));
      //     }
      //   },
      // });
      // return;
    }
    dispatch(
      lpNodeActions.dropMotionOnModel({
        nodeId,
        filePath,
      }),
    );
  };

  return (
    <Fragment>
      <ListViewNode
        depth={depth}
        type="Model"
        onContextMenu={onContextMenu}
        nodeName={nodeName}
        isSelected={selectedId === nodeId}
        isVisualized={isVisualized}
        isCloseVisualized={isCloseVisualized}
        handleClickNode={handleClickNode}
        handleClickArrowButton={handleClickArrowButton}
        showsChildrens={showsChildrens}
        handleDragStart={handleDragStart}
        handleDrop={handleDrop}
      />

      {showsChildrens && <ListChildren items={childrenNodeIds} />}
    </Fragment>
  );
};

export default ModelNode;
