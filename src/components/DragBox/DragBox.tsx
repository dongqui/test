import React, {
  memo,
  useEffect,
  useRef,
  RefObject,
  useState,
  useCallback,
  FunctionComponent,
} from 'react';
import _ from 'lodash';
import classNames from 'classnames/bind';
import styles from './DragBox.module.scss';

const cx = classNames.bind(styles);

interface Props {
  isAllCovered: boolean;
  parentRef: RefObject<HTMLElement>;
}

const DragBox: FunctionComponent<Props> = (props) => {
  const { isAllCovered, parentRef } = props;
  const [isOpenedDragBox, setIsOpenedDragBox] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const rectRef = useRef<SVGRectElement>(null);

  const originX = useRef(0); // 최초 드래그가 발생한 x좌표
  const originY = useRef(0); // 최초 드래그가 발생한 y좌표
  const currentX = useRef(0); // 현재 드래그가 발생하고 있는 x좌표
  const currentY = useRef(0); // 현재 드래그가 발생하고 있는 x좌표

  // min XY, max XY 구하기
  const getMinMaxXY = () => {
    const minX = Math.min(originX.current, currentX.current);
    const maxX = Math.max(originX.current, currentX.current);
    const minY = Math.min(originY.current, currentY.current);
    const maxY = Math.max(originY.current, currentY.current);
    return { minX, maxX, minY, maxY };
  };

  // tttt
  const tttt = useCallback(() => {
    const { left: parentLeft, top: parentTop } = parentRef.current!.getBoundingClientRect();
    const { minX, maxX, minY, maxY } = getMinMaxXY();
    const translateX = minX - parentLeft;
    const translateY = minY - parentTop;
    const width = maxX - minX;
    const height = maxY - minY;
    return { translateX, translateY, width, height };
  }, [parentRef]);

  // 새로 구한 x, y, width, height로 translate 적용
  const updateTranslate = useCallback(
    (newX: number, newY: number) => {
      currentX.current = newX;
      currentY.current = newY;
      const { width, height, translateX, translateY } = tttt();
      const svg = svgRef.current;
      const rect = rectRef.current;
      if (svg && rect) {
        svg.style.cssText = `width:${width}px; height:${height}px; trnasform:translate3d(${translateX}px, ${translateY}px, 0)`;
        rect.style.cssText = `width:${width}px; height:${height}px;`;
      }
    },
    [tttt],
  );

  // 부모 컴포넌트에 mousedown 이벤트 추가
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (event.ctrlKey || event.altKey || event.shiftKey || event.metaKey) return;
      originX.current = event.x;
      originY.current = event.y;
      updateTranslate(originX.current, originY.current);
      setIsOpenedDragBox(true);
    };

    const handleDragStart = () => {
      setIsOpenedDragBox(false);
    };

    parentRef.current?.addEventListener('mousedown', handleMouseDown);
    parentRef.current?.addEventListener('dragstart', handleDragStart);

    return () => {
      parentRef.current?.removeEventListener('mousedown', handleMouseDown);
      parentRef.current?.removeEventListener('dragstart', handleDragStart);
    };
  }, [parentRef, updateTranslate]);

  // drag box에 mousemove, mouseup 이벤트 추가
  useEffect(() => {
    if (isOpenedDragBox) {
      const handleMouseMove = (event: MouseEvent) => {
        updateTranslate(event.x, event.y);
        if (parentRef.current) {
          const { minX, maxX, minY, maxY } = getMinMaxXY();
          const {
            x: parentLeft,
            y: parentTop,
            width: parentWidth,
            height: parentHeight,
          } = parentRef.current.getBoundingClientRect();
          const calcBoxLeftTop = (now: number, min: number) => (now < min ? min : now);
          const calcBoxRightBottom = (now: number, min: number, max: number) =>
            min + max < now ? min + max : now;

          const boxLeft = calcBoxLeftTop(minX, parentLeft);
          const boxTop = calcBoxLeftTop(minY, parentTop);
          const boxRight = calcBoxRightBottom(maxX, parentLeft, parentWidth);
          const boxBottom = calcBoxRightBottom(maxY, parentTop, parentHeight);

          parentRef.current.querySelectorAll('#grabbed').forEach((element) => {
            element.id = 'grabbable';
          });

          parentRef.current.querySelectorAll('#grabbable').forEach((element) => {
            const {
              x: elementLeft,
              y: elementTop,
              width: elementWidth,
              height: elementHeight,
            } = element.getBoundingClientRect();
            const elementRight = elementLeft + elementWidth;
            const elementBottom = elementTop + elementHeight;
            const isSmallerThanBoxCoord = (box: number, element: number) => box < element;
            const isBiggerThanBoxCoord = (box: number, element: number) => element < box;

            const allContains =
              isSmallerThanBoxCoord(boxLeft, elementLeft) &&
              isSmallerThanBoxCoord(boxTop, elementTop) &&
              isBiggerThanBoxCoord(boxRight, elementRight) &&
              isBiggerThanBoxCoord(boxBottom, elementBottom);

            const partialContains =
              isSmallerThanBoxCoord(boxLeft, elementRight) &&
              isSmallerThanBoxCoord(boxTop, elementBottom) &&
              isBiggerThanBoxCoord(boxRight, elementLeft) &&
              isBiggerThanBoxCoord(boxBottom, elementTop);

            if (isAllCovered && allContains) {
              element.id = 'grabbed';
            } else if (!isAllCovered && partialContains) {
              element.id = 'grabbed';
            }
          });
        }
      };

      const handleMouseUp = () => {
        if (parentRef.current) {
          originX.current = 0;
          originY.current = 0;
          currentX.current = 0;
          currentY.current = 0;

          setIsOpenedDragBox(false);
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        }
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  }, [isAllCovered, isOpenedDragBox, parentRef, updateTranslate]);

  return (
    <div className={cx('wrapper')}>
      {isOpenedDragBox && (
        <div className={cx('drag-box')}>
          <svg width="0" height="0" ref={svgRef}>
            <rect width="0" height="0" ref={rectRef} />
          </svg>
        </div>
      )}
    </div>
  );
};

export default memo(DragBox);
