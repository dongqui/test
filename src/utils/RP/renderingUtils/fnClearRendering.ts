import { Dispatch, SetStateAction } from 'react';
import * as THREE from 'three';
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
    THREE.Mesh | THREE.Line | TransformControls | THREE.SkeletonHelper | THREE.Object3D
  >;
  setContents: Dispatch<
    SetStateAction<
      Array<THREE.Mesh | THREE.Line | TransformControls | THREE.SkeletonHelper | THREE.Object3D>
    >
  >;
  theScene: THREE.Scene | undefined;
  setTheScene: Dispatch<SetStateAction<THREE.Scene | undefined>>;
}

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
  if (theScene && contents.length > 0) {
    contents.forEach((content: any) => {
      theScene.remove(content);
      content.traverse((node: any) => {
        if (!node.isMesh) return;
        node.geometry.dispose();
        const materials: Array<THREE.MeshBasicMaterial | THREE.MeshPhongMaterial> = Array.isArray(
          node.material,
        )
          ? node.material
          : [node.material];
        // material 타입 특정 시 타입 에러 발생
        materials.forEach((material: any) => {
          MAP_TYPES.forEach((mapType) => {
            material[mapType]?.dispose();
          });
        });
      });
    });
    setContents([]);
    setTheScene(undefined);
  }
};

export default fnClearRendering;
