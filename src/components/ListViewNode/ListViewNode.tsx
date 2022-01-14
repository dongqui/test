import React, { FunctionComponent, memo } from 'react';
import * as LPCONSTANTS from 'constants/LibraryPanel';
import ArrowButton from './ArrowButton';
import NodeIcon from './NodeIcon';
import NodeName from './NodeName';
import classNames from 'classnames/bind';
import styles from './ListViewNode.module.scss';

const cx = classNames.bind(styles);

interface Props {
  depth: number;
  type: LP.NodeType;
  nodeName: string;
  isSelected: boolean;
  isVisualized?: boolean;
  isCloseVisualized?: boolean;
  isEditing: boolean;
  showsChildrens?: boolean;
  extension?: string;
  onContextMenu: React.MouseEventHandler<HTMLDivElement>;
  handleClickNode: React.MouseEventHandler<HTMLDivElement>;
  handleClickArrowButton?: React.MouseEventHandler<HTMLDivElement>;
  handleDrop?: React.DragEventHandler<HTMLDivElement>;
  handleDragStart?: React.DragEventHandler<HTMLDivElement>;
  handleEditName: (newName: string) => void;
  handleCancelEdit: () => void;
}

const ListViewNode: FunctionComponent<Props> = ({
  depth,
  type,
  onContextMenu,
  nodeName,
  isVisualized = false,
  isCloseVisualized = false,
  isEditing,
  isSelected,
  handleClickNode,
  handleClickArrowButton,
  showsChildrens = false,
  handleDrop,
  handleDragStart,
  handleEditName,
  handleCancelEdit,
  extension,
}) => {
  const classes = cx('inner', {
    'open-visualized': isVisualized,
    'close-visualized': isCloseVisualized,
    selected: isSelected,
  });

  return (
    <div className={cx('container')} tabIndex={0} onClick={handleClickNode} draggable onDrop={handleDrop} onDrag={handleDragStart}>
      <div className={cx('outer')}>
        <div className={classes} id="inner">
          <div className={cx('wrapper')} style={{ paddingLeft: `${16 * (depth - 1)}px` }} id={LPCONSTANTS.DRAG_SELECTABLE} onContextMenu={onContextMenu}>
            <div className={cx('column')} />
            <ArrowButton isOpen={showsChildrens} hidden={type === 'Motion'} handleClickArrowButton={handleClickArrowButton} />
            <div className={cx('contents')}>
              <NodeIcon icon={type} />
              <div className={cx('column')} />
              <NodeName isEditing={isEditing} name={nodeName} handleEditName={handleEditName} handleCancelEdit={handleCancelEdit} extension={extension} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(ListViewNode);
