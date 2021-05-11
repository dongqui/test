import React, { memo, useEffect, useRef, RefObject, useState, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from './DragBox.module.scss';

interface Props {
  covered: 'partial' | 'whole';
  parentRef: RefObject<Element>;
  selectors: string;
}

const cx = classNames.bind(styles);
const GRABBED_ID = 'grabbed';

/**
 * - 드래그 박스 안에 포함 된 요소에다가 selected 효과를 적용시키는 컴포넌트 입니다.
 * - 박스 안에 포함 된 요소인지 구별하기 위해 id에다가 selected를 부여하였습니다. #selected가 적용 된 tag에다가 style을 적용하면 됩니다.
 * - 한가지 주의사항으로, 드래그 박스를 호출 한 부모 컴포넌트에는 반드시 아래와 같은 style을 적용해야 합니다.
 *   1) position: relative -> 호출 한 컴포넌트 기준으로 드래그 박스 위치가 결졍되기 때문에, 부모 컴포넌트는 relative를, 드래그 박스는 absolute.
 *   2) user-select: none -> 다른 태그에다가 텍스트를 선택하지 못하도록 막음
 *
 * @param covered - 드래그 박스에 일부만 포함시킬지, 전체 포함시킬지 선택(partial=일부 포함, whole=전체 포함)
 * @param parentRef - 드래그 박스 컴포넌트를 호출시킨 부모 컴포넌트 ref
 * @param selectors - 드래그 박스에 포함 여부를 확인 할 요소
 */
const DragBox = ({ covered, parentRef, selectors }: Props) => {
  const [isShowedDragBox, setIsShowedDragBox] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const rectRef = useRef<SVGRectElement>(null);

  const originX = useRef(0); // 최초 드래그 event가 발생한 x좌표
  const originY = useRef(0); // 최초 드래그 event가 발생한 y좌표
  const currentX = useRef(0); // 현재 드래그 event가 발생하고 있는 x좌표
  const currentY = useRef(0); // 현재 드래그 event가 발생하고 있는 x좌표

  // min, max xy 구하기
  const getMinMaxXY = () => {
    const minX = Math.min(originX.current, currentX.current);
    const maxX = Math.max(originX.current, currentX.current);
    const minY = Math.min(originY.current, currentY.current);
    const maxY = Math.max(originY.current, currentY.current);
    return { minX, maxX, minY, maxY };
  };

  // 새로 구한 x, y, width, height로 translate 적용
  const updateTranslate = useCallback(
    (newX: number, newY: number) => {
      if (parentRef.current) {
        currentX.current = newX;
        currentY.current = newY;
        const { left: parentLeft, top: parentTop } = parentRef.current?.getBoundingClientRect();
        const { minX, maxX, minY, maxY } = getMinMaxXY();
        const relativeX = minX - parentLeft;
        const relativeY = minY - parentTop;
        const width = maxX - minX;
        const height = maxY - minY;

        const svg = svgRef.current;
        const rect = rectRef.current;
        if (svg && rect) {
          svg.style.transform = `translate3d(${relativeX}px, ${relativeY}px, 0)`;
          svg.style.width = `${width}px`;
          svg.style.height = `${height}px`;
          rect.style.width = `${width}px`;
          rect.style.height = `${height}px`;
        }
      }
    },
    [parentRef],
  );

  // 부모 컴포넌트에 mousedown 이벤트 추가
  useEffect(() => {
    const handleMouseDown = (event: any) => {
      if (event.ctrlKey || event.altKey || event.shiftKey) return;
      originX.current = event.x;
      originY.current = event.y;
      updateTranslate(originX.current, originY.current);
      setIsShowedDragBox(true);
    };

    const handleDragStart = () => {
      setIsShowedDragBox(false);
    };

    parentRef.current?.addEventListener('mousedown', handleMouseDown);
    parentRef.current?.addEventListener('dragstart', handleDragStart);
  }, [parentRef, updateTranslate]);

  // drag box에 mousemove, mouseup 이벤트 추가
  useEffect(() => {
    if (isShowedDragBox) {
      const calcBoxLeftTop = (now: number, min: number) => (now < min ? min : now);
      const calcBoxRightBottom = (now: number, min: number, max: number) =>
        min + max < now ? min + max : now;

      const handleMouseMove = (event: MouseEvent) => {
        updateTranslate(event.x, event.y);
      };

      const handleMouseUp = () => {
        if (parentRef.current) {
          const { minX, maxX, minY, maxY } = getMinMaxXY();
          const {
            x: parentLeft,
            y: parentTop,
            width: parentWidth,
            height: parentHeight,
          } = parentRef.current.getBoundingClientRect();

          const boxLeft = calcBoxLeftTop(minX, parentLeft);
          const boxTop = calcBoxLeftTop(minY, parentTop);
          const boxRight = calcBoxRightBottom(maxX, parentLeft, parentWidth);
          const boxBottom = calcBoxRightBottom(maxY, parentTop, parentHeight);

          parentRef.current.querySelectorAll(`#${GRABBED_ID}`).forEach((element) => {
            element.removeAttribute('id');
          });

          parentRef.current.querySelectorAll(selectors).forEach((element) => {
            const {
              x: elementLeft,
              y: elementTop,
              width: elementWidth,
              height: elementHeight,
            } = element.getBoundingClientRect();
            const elementRight = elementLeft + elementWidth;
            const elementBottom = elementTop + elementHeight;
            if (covered === 'partial') {
              if (
                elementLeft < boxRight &&
                boxLeft < elementRight &&
                elementTop < boxBottom &&
                boxTop < elementBottom
              ) {
                element.id = GRABBED_ID;
              }
            } else if (covered === 'whole') {
              if (
                boxLeft < elementLeft &&
                elementRight < boxRight &&
                boxTop < elementTop &&
                elementBottom < boxBottom
              ) {
                element.id = GRABBED_ID;
              }
            }
          });

          originX.current = 0;
          originY.current = 0;
          currentX.current = 0;
          currentY.current = 0;

          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
          setIsShowedDragBox(false);
        }
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  }, [covered, isShowedDragBox, parentRef, selectors, updateTranslate]);

  return (
    <div className={cx('drag-box-wrapper')}>
      {isShowedDragBox && (
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
