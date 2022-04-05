import { memo } from 'react';

import * as LPCONSTANTS from 'constants/LibraryPanel';
import ArrowButton from './ArrowButton';
import NodeIcon from './NodeIcon';
import NodeName from './NodeName';
import ListChildren from 'containers/Panels/LibraryPanel/ListView/ListChildren';

import classNames from 'classnames/bind';
import styles from './ListViewNode.module.scss';

const cx = classNames.bind(styles);

interface Props {
  depth: number;
  type: LP.NodeType;
  nodeName: string;
  isSelected: boolean;
  isVisualizedUICondition: boolean;
  isEditing: boolean;
  isParentSelected: boolean;
  showChildren?: boolean;
  extension?: string;
  childNodeIds: string[];
  onContextMenu: React.MouseEventHandler<HTMLDivElement>;
  onClick: React.MouseEventHandler<HTMLDivElement>;
  onArrowButtonClick?: React.MouseEventHandler<HTMLDivElement>;
  onDrop?: React.DragEventHandler<HTMLDivElement>;
  onDragStart?: React.DragEventHandler<HTMLDivElement>;
  onDragEnd?: React.DragEventHandler<HTMLDivElement>;
  onEditName: (newName: string) => void;
  onCancelEdit: () => void;
  dataCy?: string;
}

const ListViewNode = ({
  depth,
  type,
  onContextMenu,
  childNodeIds,
  nodeName,
  isVisualizedUICondition,
  isEditing,
  isSelected,
  isParentSelected,
  onClick,
  onArrowButtonClick,
  showChildren = false,
  onDrop,
  onDragStart,
  onDragEnd,
  onEditName,
  onCancelEdit,
  extension,
  dataCy,
}: Props) => {
  const classes = cx('inner', {
    selected: isSelected,
    'parent-selected': isParentSelected,
  });

  return (
    <div className={cx('container')} tabIndex={0} onClick={onClick} draggable onDrop={onDrop} onDragStart={onDragStart} onDragEnd={onDragEnd} data-cy={dataCy}>
      <div className={cx('outer')}>
        <div className={classes} id="inner">
          <div className={cx('wrapper')} style={{ paddingLeft: `${16 * (depth - 1)}px` }} id={LPCONSTANTS.DRAG_SELECTABLE} onContextMenu={onContextMenu}>
            <div className={cx('column')} />
            <ArrowButton isOpen={showChildren} hidden={type === 'Motion' || type === 'Mocap'} onArrowButtonClick={onArrowButtonClick} />
            <div className={cx('contents')}>
              <NodeIcon icon={type} isVisualizedUICondition={isVisualizedUICondition} isSelected={isSelected} />
              <div className={cx('column')} />
              <NodeName isEditing={isEditing} name={nodeName} onEditName={onEditName} onCancelEdit={onCancelEdit} extension={extension} />
            </div>
          </div>

          {showChildren && <ListChildren items={childNodeIds} />}
        </div>
      </div>
    </div>
  );
};

export default memo(ListViewNode);
