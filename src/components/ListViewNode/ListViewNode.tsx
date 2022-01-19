import React, { FunctionComponent, memo } from 'react';
import * as LPCONSTANTS from 'constants/LibraryPanel';
import ArrowButton from './ArrowButton';
import NodeIcon from './NodeIcon';
import NodeName from './NodeName';
import classNames from 'classnames/bind';
import styles from './ListViewNode.module.scss';
import ListChildren from 'containers/Panels/LibraryPanel/ListView/ListChildren copy';

const cx = classNames.bind(styles);

interface Props {
  depth: number;
  type: LP.NodeType;
  nodeName: string;
  isSelected: boolean;
  isOpenVisualized?: boolean;
  isCloseVisualized?: boolean;
  isEditing: boolean;
  showChildren?: boolean;
  extension?: string;
  childrenNodeIds: string[];
  handleContextMenu: React.MouseEventHandler<HTMLDivElement>;
  handleClickNode: React.MouseEventHandler<HTMLDivElement>;
  handleClickArrowButton?: React.MouseEventHandler<HTMLDivElement>;
  handleDrop?: React.DragEventHandler<HTMLDivElement>;
  handleDragStart?: React.DragEventHandler<HTMLDivElement>;
  handleDragEnd?: React.DragEventHandler<HTMLDivElement>;
  handleEditName: (newName: string) => void;
  handleCancelEdit: () => void;
}

const ListViewNode: FunctionComponent<Props> = ({
  depth,
  type,
  handleContextMenu,
  childrenNodeIds,
  nodeName,
  isOpenVisualized = false,
  isCloseVisualized = false,
  isEditing,
  isSelected,
  handleClickNode,
  handleClickArrowButton,
  showChildren = false,
  handleDrop,
  handleDragStart,
  handleDragEnd,
  handleEditName,
  handleCancelEdit,
  extension,
}) => {
  const classes = cx('inner', {
    'open-visualized': isOpenVisualized,
    'close-visualized': isCloseVisualized,
    selected: isSelected,
  });

  return (
    <div className={cx('container')} tabIndex={0} onClick={handleClickNode} draggable onDrop={handleDrop} onDrag={handleDragStart} onDragEnd={handleDragEnd}>
      <div className={cx('outer')}>
        <div className={classes} id="inner">
          <div className={cx('wrapper')} style={{ paddingLeft: `${16 * (depth - 1)}px` }} id={LPCONSTANTS.DRAG_SELECTABLE} onContextMenu={handleContextMenu}>
            <div className={cx('column')} />
            <ArrowButton isOpen={showChildren} hidden={type === 'Motion'} handleClickArrowButton={handleClickArrowButton} />
            <div className={cx('contents')}>
              <NodeIcon icon={type} />
              <div className={cx('column')} />
              <NodeName isEditing={isEditing} name={nodeName} handleEditName={handleEditName} handleCancelEdit={handleCancelEdit} extension={extension} />
            </div>
          </div>

          {showChildren && <ListChildren items={childrenNodeIds} />}
        </div>
      </div>
    </div>
  );
};

export default memo(ListViewNode);
