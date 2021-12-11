import { FunctionComponent, memo, useEffect, useState, useRef, RefObject, FocusEvent, KeyboardEvent } from 'react';
import * as LPCONSTANTS from 'constants/LibraryPanel';
import ArrowButton from './ArrowButton';
import NodeIcon from './NodeIcon';
import NodeName from './NodeName';
import classNames from 'classnames/bind';
import styles from './ListCurrent.module.scss';

const cx = classNames.bind(styles);

interface Props {
  id: string;
  assetId?: string;
  type: LP.NodeType;
  name: string;
  depth: number;
  isEditing?: boolean;
  wrapperRef: RefObject<HTMLDivElement>;
  renameRef: RefObject<HTMLInputElement>;
  onClick: () => void;
  onBlur: (event: FocusEvent<HTMLInputElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  defaultValue: string;
}

const ListCurrent: FunctionComponent<Props> = ({ id, assetId, type, name, depth, isEditing, wrapperRef, renameRef, onClick, onBlur, onKeyDown, defaultValue }) => {
  const arrowRef = useRef<HTMLDivElement>(null);

  const [isHover, setIsHover] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const currentRef = arrowRef && arrowRef.current;

    if (currentRef) {
      const handleArrowClick = () => {
        setIsOpen(!isOpen);
        onClick();
      };

      currentRef.addEventListener('mouseup', handleArrowClick);

      return () => {
        currentRef.removeEventListener('mouseup', handleArrowClick);
      };
    }
  }, [isOpen, onClick]);

  const classes = cx('wrapper', { hovered: isHover });

  return (
    <div className={classes} ref={wrapperRef} style={{ paddingLeft: `${16 * (depth - 1)}px` }} id={LPCONSTANTS.DRAG_SELECTABLE} data-id={id} data-assetid={assetId}>
      <div className={cx('column')} />
      <ArrowButton ref={arrowRef} isOpen={isOpen} hidden={type === 'Motion'} />
      <div className={cx('contents')}>
        <NodeIcon icon={type} />
        <div className={cx('column')} />
        <NodeName innerRef={renameRef} isEditing={isEditing} name={name} onBlur={onBlur} onKeyDown={onKeyDown} defaultValue={defaultValue} />
      </div>
    </div>
  );
};

export default memo(ListCurrent);
