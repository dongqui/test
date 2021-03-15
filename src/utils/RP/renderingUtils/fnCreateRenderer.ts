import * as THREE from 'three';

interface FnCreateRenderer {
  renderingDiv: HTMLElement;
}

/**
 * Creates and returns the renderer with default settings.
 *
 * @param renderingDiv - The div element where the domElement of the created renderer will be attatched
 *
 * @returns THREE.WebGl1Renderer
 */
const fnCreateRenderer = (props: FnCreateRenderer) => {
  const { renderingDiv } = props;
  const renderer = new THREE.WebGL1Renderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.setSize(renderingDiv.clientWidth, renderingDiv.clientHeight);

  return renderer;
};

export default fnCreateRenderer;
