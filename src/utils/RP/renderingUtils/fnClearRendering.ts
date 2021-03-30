import content from '*.svg';
import { Dispatch, SetStateAction } from 'react';
import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';

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
      >
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
    contents.forEach(async (content: any) => {
      if (content.type === 'Object3D') {
        if (content.children.length > 0) {
          content.children.forEach(async (child: any) => {
            await child.material?.dispose();
            await child.geometry?.dispose();
          });
        }
        content.dispose();
      }
      if (content.type === 'Line') {
        await content.geometry.dispose();
        await content.material.dispose();
      }
      if (content.type === 'Mesh') {
        await content.geometry.dispose();
        await content.material.dispose();
      }
      if (content.type === 1009) {
        // texture
        await content.dispose();
      }
      if (content.type !== 1009) {
        content.traverse(async (node: any) => {
          if (node.isMesh) {
            await node.geometry.dispose();
            if (Array.isArray(node.material)) {
              node.material.forEach((m: THREE.MeshBasicMaterial | THREE.MeshPhongMaterial) => {
                m.dispose();
              });
            } else {
              await node.material.dispose();
            }
          }
        });
      }
      theScene.remove(content);
    });
    setContents([]);
    setTheScene(undefined);
  }
};

export default fnClearRendering;
