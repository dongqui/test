import React, {
  memo,
  useEffect,
  useRef,
  RefObject,
  useState,
  useCallback,
  FunctionComponent,
} from 'react';
import classNames from 'classnames/bind';
import styles from './DragBox.module.scss';
import _ from 'lodash';

const cx = classNames.bind(styles);

interface Props {
  isAllCovered: boolean;
  onChangeIsUpdated: () => void;
  onDragStart: (event: MouseEvent | React.MouseEvent<HTMLDivElement, MouseEvent>) => boolean | void;
  onDragEnd: () => void;
  parentRef: RefObject<HTMLElement>;
}

export const GRABBED = 'grabbed';
export const GRABBABLE = 'grabbable';

/**
 * - 드래그 박스 안에 포함 된 요소에다가 selected 효과를 적용시키는 컴포넌트 입니다.
 * - 드래그 박스에 포함 여부를 체크 할 태그에는, 반드시 grabbable이라는 이름으로 id를 추가 시킵니다.
 * - 박스 안에 포함 된 요소인 경우, id가 grabbable -> grabbed로 전환됩니다. #grabbed가 있는 tag에다가 style을 적용하면 됩니다.
 *   드래그 박스를 다시 생성했을 때 #grabbed인 태그가 박스 안에 포함되지 않으면, grabbed -> grabbable로 전환됩니다.
 * - 한가지 주의사항으로, 드래그 박스를 호출 한 부모 컴포넌트에는 반드시 아래와 같은 style을 적용해야 합니다.
 *   1) position: relative -> 호출 한 컴포넌트 기준으로 드래그 박스 위치가 결졍되기 때문에, 부모 컴포넌트는 relative를, 드래그 박스는 absolute.
 *   2) user-select: none -> 다른 태그에다가 텍스트를 선택하지 못하도록 막음
 *
 * @param covered - 드래그 박스에 일부만 포함시킬지, 전체 포함시킬지 선택(partial=일부 포함, whole=전체 포함)
 * @param onChangeIsUpdated - 부모 컴포넌트에서 isUpdated state를 변경시키기 위해 내려준 함수입니다.
 * @param parentRef - 드래그 박스 컴포넌트를 호출시킨 부모 컴포넌트 ref
 * 
 * 아래와 같이 handleIsUpdated callback을 내려주고 useDragBox hooks를 사용하면, 선택 된 태그 리스트를 확인 할 수 있습니다.
    const [isUpdated, setIsUpdated] = useState(false);
    const handleChange = useCallback(() => {
      setIsUpdated(!isUpdated);
    }, [isUpdated]);
    const list = useDragBox({ ref: dopeSheetRef, isUpdated, onChangeIsUpdated: handleIsUpdated });
    <DragBox
      covered="partial"
      onChangeIsUpdated={handleChange} />
      parentRef={dopeSheetRef}
 */
const DragBox: FunctionComponent<Props> = ({
  isAllCovered,
  onChangeIsUpdated,
  parentRef,
  onDragStart,
  onDragEnd,
}) => {
  const [isOpenedDragBox, setIsOpenedDragBox] = useState(false);
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
        const { left: parentLeft, top: parentTop } = parentRef.current.getBoundingClientRect();
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
    const handleMouseDown = (event: MouseEvent) => {
      const isMustStop = onDragStart(event);
      if (isMustStop) return;
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
  }, [onDragStart, parentRef, updateTranslate]);

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

          parentRef.current.querySelectorAll(`#${GRABBED}`).forEach((element) => {
            element.id = GRABBABLE;
          });

          parentRef.current.querySelectorAll(`#${GRABBABLE}`).forEach((element) => {
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
              element.id = GRABBED;
            } else if (!isAllCovered && partialContains) {
              element.id = GRABBED;
            }
          });
          onChangeIsUpdated();
        }
      };

      const handleMouseUp = () => {
        if (parentRef.current) {
          // const { minX, maxX, minY, maxY } = getMinMaxXY();
          // const {
          //   x: parentLeft,
          //   y: parentTop,
          //   width: parentWidth,
          //   height: parentHeight,
          // } = parentRef.current.getBoundingClientRect();
          // const calcBoxLeftTop = (now: number, min: number) => (now < min ? min : now);
          // const calcBoxRightBottom = (now: number, min: number, max: number) =>
          //   min + max < now ? min + max : now;

          // const boxLeft = calcBoxLeftTop(minX, parentLeft);
          // const boxTop = calcBoxLeftTop(minY, parentTop);
          // const boxRight = calcBoxRightBottom(maxX, parentLeft, parentWidth);
          // const boxBottom = calcBoxRightBottom(maxY, parentTop, parentHeight);

          // parentRef.current.querySelectorAll(`#${GRABBED}`).forEach((element) => {
          //   element.id = GRABBABLE;
          // });

          // parentRef.current.querySelectorAll(`#${GRABBABLE}`).forEach((element) => {
          //   const {
          //     x: elementLeft,
          //     y: elementTop,
          //     width: elementWidth,
          //     height: elementHeight,
          //   } = element.getBoundingClientRect();
          //   const elementRight = elementLeft + elementWidth;
          //   const elementBottom = elementTop + elementHeight;
          //   const isSmallerThanBoxCoord = (box: number, element: number) => box < element;
          //   const isBiggerThanBoxCoord = (box: number, element: number) => element < box;

          //   const allContains =
          //     isSmallerThanBoxCoord(boxLeft, elementLeft) &&
          //     isSmallerThanBoxCoord(boxTop, elementTop) &&
          //     isBiggerThanBoxCoord(boxRight, elementRight) &&
          //     isBiggerThanBoxCoord(boxBottom, elementBottom);

          //   const partialContains =
          //     isSmallerThanBoxCoord(boxLeft, elementRight) &&
          //     isSmallerThanBoxCoord(boxTop, elementBottom) &&
          //     isBiggerThanBoxCoord(boxRight, elementLeft) &&
          //     isBiggerThanBoxCoord(boxBottom, elementTop);

          //   if (isAllCovered && allContains) {
          //     element.id = GRABBED;
          //   } else if (!isAllCovered && partialContains) {
          //     element.id = GRABBED;
          //   }
          // });

          originX.current = 0;
          originY.current = 0;
          currentX.current = 0;
          currentY.current = 0;

          // onChangeIsUpdated();
          onDragEnd();
          setIsOpenedDragBox(false);
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        }
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  }, [isAllCovered, isOpenedDragBox, onChangeIsUpdated, onDragEnd, parentRef, updateTranslate]);

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
