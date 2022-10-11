import React, { useCallback, useEffect, useRef, RefObject, useState, Fragment, FunctionComponent } from 'react';
import _ from 'lodash';

import classNames from 'classnames/bind';
import styles from './DragBox.module.scss';

const cx = classNames.bind(styles);

interface Props {
  /**
   * @description dragbox의 영역이 될 ref
   */
  areaRef: RefObject<HTMLElement | SVGElement>;

  /**
   * @description selectabled id가 있는 node만 dragbox에 포함되어 있는지 확인
   */
  selectableId: string;

  /**
   * @description dragbox 안에 selectabled node가 포함 될 경우, 이를 구별하기 위해 selected id로 변경
   */
  selectedId: string;

  /**
   * @description 드래그 이동 시, dragbox에 포함된 node list를 인자값으로 전달
   * @argument list 마우스를 이동할 때 dragbox에 포함 된 node list
   */
  onDragMove?: (list: NodeListOf<HTMLElement>) => void;

  /**
   * @description 드래그 종료 시, dragbox에 포함 된 node list를 인자값으로 전달
   * @argument list 마우스를 뗐을 때 dragbox에 포함 된 node list
   */
  onDragEnd?: (list: NodeListOf<HTMLElement>) => void;
}

const DragBox: FunctionComponent<React.PropsWithChildren<Props>> = (props) => {
  const { areaRef, selectableId, selectedId, onDragMove, onDragEnd } = props;
  const [isOpenedDragBox, setIsOpenedDragBox] = useState(false);
  const dragBoxRef = useRef<HTMLDivElement>(null);

  const initialX = useRef(0); // 최초 드래그가 발생한 x좌표
  const initialY = useRef(0); // 최초 드래그가 발생한 y좌표
  const currentX = useRef(0); // 현재 드래그가 발생하고 있는 x좌표
  const currentY = useRef(0); // 현재 드래그가 발생하고 있는 x좌표

  // min XY, max XY 구하기
  const getMinMaxXY = () => {
    const minX = Math.min(initialX.current, currentX.current);
    const maxX = Math.max(initialX.current, currentX.current);
    const minY = Math.min(initialY.current, currentY.current);
    const maxY = Math.max(initialY.current, currentY.current);
    return { minX, maxX, minY, maxY };
  };

  // 드래그 박스의 좌측 상단 위치 구하기
  const getDragBoxLeftTop = useCallback((areaLeft: number, areaTop: number) => {
    const { minX, minY } = getMinMaxXY();
    const left = minX < areaLeft ? areaLeft : minX;
    const top = minY < areaTop ? areaTop : minY;
    return { left, top };
  }, []);

  // 드래그 박스의 우측 하단 위치 구하기
  const getDragBoxRightBottom = useCallback((areaLeft: number, areaTop: number, areaWidth: number, areaHeight: number) => {
    const { maxX, maxY } = getMinMaxXY();
    const right = areaLeft + areaWidth < maxX ? areaLeft + areaWidth : maxX;
    const bottom = areaTop + areaHeight < maxY ? areaTop + areaHeight : maxY;
    return { right, bottom };
  }, []);

  // 드래그 박스에 새로운 size 구하기
  const getDragBoxNewSize = useCallback((areaLeft: number, areaTop: number) => {
    const { minX, maxX, minY, maxY } = getMinMaxXY();
    const translateX = minX - areaLeft;
    const translateY = minY - areaTop;
    const width = maxX - minX;
    const height = maxY - minY;
    return { translateX, translateY, width, height };
  }, []);

  // 새로 구한 x, y, width, height로 style 적용
  const updateDragBoxStyle = useCallback(
    (cursorX: number, cursorY: number, areaLeft: number, areaTop: number) => {
      currentX.current = cursorX;
      currentY.current = cursorY;
      if (dragBoxRef.current && cursorX && cursorY) {
        const { width, height, translateX, translateY } = getDragBoxNewSize(areaLeft, areaTop);
        dragBoxRef.current.style.cssText = `width:${width}px; height:${height}px; transform:translate3d(${translateX}px, ${translateY}px, 0)`;
      }
    },
    [getDragBoxNewSize],
  );

  // 최초 xy 위치 설정
  const setInitialXY = useCallback(
    (cursorX: number, cursorY: number, areaLeft: number, areaTop: number) => {
      initialX.current = cursorX;
      initialY.current = cursorY;
      updateDragBoxStyle(cursorX, cursorY, areaLeft, areaTop);
    },
    [updateDragBoxStyle],
  );

  // selected id로 적용 된 node에다가 원래 selecteable id로 변경
  const changeSelectedToSelectable = useCallback(() => {
    if (!areaRef.current) return;
    areaRef.current.querySelectorAll(`#${selectedId}`).forEach((element) => {
      element.id = selectableId;
    });
  }, [areaRef, selectableId, selectedId]);

  // 마우스 왼쪽 클릭 이벤트 감지
  const handleMouseDown = useCallback(
    (event: any) => {
      if (event.ctrlKey || event.altKey || event.shiftKey || event.metaKey || !areaRef.current) return;
      const { x: areaLeft, y: areaTop } = areaRef.current.getBoundingClientRect();
      setInitialXY(event.x, event.y, areaLeft, areaTop);
      setIsOpenedDragBox(true);
      // changeSelectedToSelectable();
    },
    [areaRef, setInitialXY],
  );

  // 마우스 이동 이벤트 감지
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!areaRef.current) return;
      const { x: areaLeft, y: areaTop, width: areaWidth, height: areaHeight } = areaRef.current.getBoundingClientRect();
      const { left, top } = getDragBoxLeftTop(areaLeft, areaTop);
      const { right, bottom } = getDragBoxRightBottom(areaLeft, areaTop, areaWidth, areaHeight);

      updateDragBoxStyle(event.x, event.y, areaLeft, areaTop);
      // changeSelectedToSelectable();

      areaRef.current.querySelectorAll(`#${selectableId}`).forEach((node) => {
        const { x: nodeLeft, y: nodeTop, width: nodeWidth, height: nodeHeight } = node.getBoundingClientRect();
        const nodeRight = nodeLeft + nodeWidth;
        const nodeBottom = nodeTop + nodeHeight;
        const isContained = left < nodeRight && top < nodeBottom && nodeLeft < right && nodeTop < bottom;
        if (isContained) {
          node.id = selectedId;
        }
      });

      areaRef.current.querySelectorAll(`#${selectedId}`).forEach((node) => {
        const { x: nodeLeft, y: nodeTop, width: nodeWidth, height: nodeHeight } = node.getBoundingClientRect();
        const nodeRight = nodeLeft + nodeWidth;
        const nodeBottom = nodeTop + nodeHeight;
        const isContained = left < nodeRight && top < nodeBottom && nodeLeft < right && nodeTop < bottom;
        if (!isContained) {
          node.id = selectableId;
        }
      });

      const scrollDiffBottom = Math.abs(areaRef.current.getBoundingClientRect().bottom - event.clientY);
      const scrollDiffTop = Math.abs(areaRef.current.getBoundingClientRect().top - event.clientY);

      if (event.clientY > areaRef.current.getBoundingClientRect().bottom) {
        areaRef.current.scrollTop = areaRef.current.scrollTop + scrollDiffBottom;
      }

      if (event.clientY < areaRef.current.getBoundingClientRect().top) {
        areaRef.current.scrollTop = areaRef.current.scrollTop - scrollDiffTop;
      }

      const selectedNodes: NodeListOf<HTMLElement> = areaRef.current.querySelectorAll(`#${selectedId}`);

      onDragMove && onDragMove(selectedNodes);
    },
    [areaRef, getDragBoxLeftTop, getDragBoxRightBottom, updateDragBoxStyle, selectableId, selectedId, onDragMove],
  );

  // 마우스 왼쪽 뗌 이벤트 감지
  const handleMouseUp = useCallback(() => {
    if (!areaRef.current) return;
    const selectedNodes: NodeListOf<HTMLElement> = areaRef.current.querySelectorAll(`#${selectedId}`);

    if (initialX.current !== currentX.current || initialY.current !== currentY.current) {
      onDragEnd && onDragEnd(selectedNodes);
    }
    // changeSelectedToSelectable();
    setInitialXY(0, 0, 0, 0);
    setIsOpenedDragBox(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [areaRef, selectedId, handleMouseMove, onDragEnd, setInitialXY]);

  // 부모 컴포넌트에 mousedown 이벤트 추가
  useEffect(() => {
    const area = areaRef.current;
    area?.addEventListener('mousedown', handleMouseDown);
    return () => {
      area?.removeEventListener('mousedown', handleMouseDown);
    };
  }, [areaRef, handleMouseDown]);

  // 드래그 박스가 화면에 보일 경우, document에 mousemove, mouseup 이벤트 추가
  useEffect(() => {
    const throttledThing = _.throttle(handleMouseMove, 0);
    const throttledCancel = () => {
      throttledThing.cancel();
      handleMouseUp();
    };
    if (isOpenedDragBox) {
      document.addEventListener('mousemove', throttledThing);
      document.addEventListener('mouseup', throttledCancel);
    }
    return () => {
      document.removeEventListener('mousemove', throttledThing);
      document.removeEventListener('mouseup', throttledCancel);
    };
  }, [isOpenedDragBox, areaRef, updateDragBoxStyle, handleMouseMove, handleMouseUp]);

  return (
    <Fragment>
      {isOpenedDragBox && (
        <div className={cx('wrapper')}>
          <div ref={dragBoxRef} className={cx('drag-box')} />
        </div>
      )}
    </Fragment>
  );
};

export default DragBox;
