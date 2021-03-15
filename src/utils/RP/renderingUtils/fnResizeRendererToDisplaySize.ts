import * as THREE from 'three';

interface FnResizeRendererToDisplaySize {
  renderer: THREE.WebGL1Renderer;
  renderingDiv: HTMLElement;
}

/**
 * Checks if the sizes of the canvas and its parent div are equivalent or not.
 * And if the result is false, resizes the canvas.
 * And this function also returns needResize. (boolean)
 *
 * @param renderer - The renderer which has the domElement(canvas)
 * @param renderingDiv - The root div element of the canvas
 *
 * @returns Boolenan value if the canvas need to be resized
 *
 */
const fnResizeRendererToDisplaySize = (props: FnResizeRendererToDisplaySize) => {
  const { renderer, renderingDiv } = props;
  const canvas = renderer.domElement;
  const needResize =
    canvas.width !== renderingDiv.clientWidth || canvas.height !== renderingDiv.clientHeight;
  if (needResize) {
    renderer.setSize(renderingDiv.clientWidth, renderingDiv.clientHeight);
  }
  return needResize;
};

export default fnResizeRendererToDisplaySize;
