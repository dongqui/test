/**
 * target의 4개 꼭짓점 좌표를 계산하는 함수입니다.
 * @param targetElement target 요소를 element로 전달
 */
const getTargetCoordinates = (targetElement: HTMLElement | null) => {
  if (targetElement) {
    const { x, y, width, height } = targetElement.getBoundingClientRect();
    const leftTop = { x, y };
    const rightTop = { x: x + width, y };
    const leftBottom = { x, y: y + height };
    const rightBottom = { x: x + width, y: y + height };
    return { leftTop, rightTop, leftBottom, rightBottom };
  }
  return null;
};

export default getTargetCoordinates;
