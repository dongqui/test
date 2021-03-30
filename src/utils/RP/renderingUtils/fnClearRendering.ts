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
  if (theScene) {
    theScene.traverse((node: any) => {
      if (node.isMesh) {
        node.geometry.dispose();
        if (Array.isArray(node.material)) {
          node.material.forEach((m: any) => {
            MAP_TYPES.forEach((mapName) => {
              if (m[mapName]) {
                m[mapName].dispose();
              }
            });
          });
        } else {
          MAP_TYPES.forEach((mapName) => {
            if (node.material[mapName]) {
              node.material[mapName].dispose();
            }
          });
        }
      }
    });
  }
  if (theScene && contents.length > 0) {
    console.log(theScene, contents);
    contents.forEach((content: any) => {
      if (content.type === 'Object3D') {
        if (content.children.length > 0) {
          content.children.forEach((child: any) => {
            child.geometry?.dispose();
            MAP_TYPES.forEach((mapName) => {
              if (content.material && content.material[mapName]) {
                content.material[mapName].dispose();
              }
            });
          });
        }
        content.dispose();
      }
      if (content.type === 'Line') {
        content.geometry.dispose();
        MAP_TYPES.forEach((mapName) => {
          if (content.material[mapName]) {
            content.material[mapName].dispose();
          }
        });
      }
      if (content.type === 'Mesh') {
        content.geometry.dispose();
        MAP_TYPES.forEach((mapName) => {
          if (content.material && content.material[mapName]) {
            content.material[mapName].dispose();
          }
        });
      }
      if (content.type === 1009) {
        // texture
        if (content.dispose) content.dispose();
      }
      if (content.type !== 1009) {
        // 자체 dispose
        if (content.geometry) content.geometry.dispose();
        if (content.material) content.material.dispose();
        // 내부 순환
        if (content.traverse) {
          content.traverse((node: any) => {
            if (node.isMesh) {
              node.geometry.dispose();
              if (Array.isArray(node.material)) {
                node.material.forEach((m: any) => {
                  MAP_TYPES.forEach((mapName) => {
                    if (m[mapName]) {
                      m[mapName].dispose();
                    }
                  });
                });
              } else {
                MAP_TYPES.forEach((mapName) => {
                  if (node.material[mapName]) {
                    node.material[mapName].dispose();
                  }
                });
              }
            }
          });
        }
      }
      theScene.remove(content);
    });
    setContents([]);
    setTheScene(undefined);
  }
};

export default fnClearRendering;
