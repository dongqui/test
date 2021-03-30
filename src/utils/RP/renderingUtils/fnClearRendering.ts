import { Dispatch, SetStateAction } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';

const MAP_TYPES = [
  'map',
  'aoMap',
  'emissiveMap',
  'glossinessMap',
  'metalnessMap',
  'normalMap',
  'roughnessMap',
  'specularMap',
];

// load 된 objcet 에 대해 타입 특정 시 에러 발생
interface FnClearRendering {
  renderingDiv: HTMLElement;
  contents: Array<
    | THREE.Mesh
    | THREE.Line
    | TransformControls
    | THREE.SkeletonHelper
    | THREE.Object3D
    | THREE.Texture
    | OrbitControls
    | THREE.WebGL1Renderer
  >;
  setContents: Dispatch<
    SetStateAction<
      Array<
        | THREE.Mesh
        | THREE.Line
        | TransformControls
        | THREE.SkeletonHelper
        | THREE.Object3D
        | THREE.Texture
        | OrbitControls
      >
    >
  >;
  theScene: THREE.Scene | undefined;
  setTheScene: Dispatch<SetStateAction<THREE.Scene | undefined>>;
}

const traverseDispose = (target: any) => {
  if (target.traverse) {
    target.traverse((node: any) => {
      // node 가 mesh 인 경우 geometry 와 material 을 각각 dispose
      if (node.isMesh) {
        // geometry dispose
        node.geometry.dispose();

        // material dispose
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        materials.forEach((material: any) => {
          MAP_TYPES.forEach((mapType) => {
            if (material[mapType]) material[mapType].dispose();
          });
        });
      }
    });
  }
};

/**
 * Removes children of rendering div and dispose all meshes for preventing resoure leaking.
 *
 * @param renderingDiv - The root div element to clear
 * @param contents - The contents array whose elements are disposable
 * @param setContents - A function setting the contents array
 * @param theScene - The elements of the contents array will be removed from this scene
 * @param setTheScene - A function setting the theScene
 *
 */
const fnClearRendering = (props: FnClearRendering) => {
  const { renderingDiv, contents, setContents, theScene, setTheScene } = props;
  if (renderingDiv) {
    while (renderingDiv.firstChild) {
      renderingDiv.removeChild(renderingDiv.firstChild);
    }
  }
  // scene 순환하며 node 들의 geometry 와 material dispose
  if (theScene) {
    traverseDispose(theScene);
  }
  if (theScene && contents.length > 0) {
    contents.forEach((content: any) => {
      // THREE.Texture
      if (content.type === 1009) {
        if (content.dispose) content.dispose();
      } else {
        // 자체 dispose
        if (content.geometry) content.geometry.dispose();
        if (content.material) content.material.dispose();
        // 내부 node 순환
        traverseDispose(content);
      }
      theScene.remove(content);
    });
    setContents([]);
    setTheScene(undefined);
  }
};

export default fnClearRendering;
