import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import _ from 'lodash';
import { Dispatch, SetStateAction } from 'react';

interface FnAddJointMeshes {
  skeletonHelper: THREE.SkeletonHelper;
  camera: THREE.Camera;
  renderer: THREE.Renderer;
  cameraControls: OrbitControls;
  transformControls: TransformControls;
  innerMixer: THREE.AnimationMixer;
  innerCurrentBone: THREE.Bone | undefined;
  setInnerCurrentBone: Dispatch<SetStateAction<THREE.Bone | undefined>>;
  storeCurrentBone: any;
}

/**
 * Add sphere meshes to the joint points of thee bones with the default settings and event listeners.
 * The transform properties of the bone can be controlled by dragging this joint meshes.
 *
 * @param skeletonHelper - The skeleton helper of the model which has the bones array
 * @param camera - The camera attached to the canvas
 * @param renderer - The renderer whose domElement is canvas
 * @param cameraControls - The camera controls attached to the canvas
 * @param transformControls - The transform controls added to the scene, and will be attached to the selected joint mesh
 * @param innerMixer - The animation mixer defined within the useRendering.ts file (not the global state mixer)
 * @param innerCurrentBone - The current selected bone
 * @param setInnerCurrentBone - A function setting the innerCurrentBone
 * @param setCurrentBoneIndex - A function setting the current Bone index
 *
 */
const fnAddJointMeshes = (props: FnAddJointMeshes) => {
  const {
    skeletonHelper,
    camera,
    renderer,
    cameraControls,
    transformControls,
    innerMixer,
    innerCurrentBone,
    setInnerCurrentBone,
    storeCurrentBone,
  } = props;
  const innerBones: THREE.Bone[] = [];
  _.forEach(skeletonHelper.bones, (bone) => {
    const boneGeometry = new THREE.SphereBufferGeometry(1, 32, 32);
    const boneMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      opacity: 0.5,
      transparent: true,
    });
    boneMaterial.depthWrite = false;
    boneMaterial.depthTest = false;

    const boneMesh = new THREE.Mesh(boneGeometry, boneMaterial);
    bone.add(boneMesh);
    innerBones.push(bone);
  });

  if (innerBones.length === skeletonHelper.bones.length) {
    const dragControls = new DragControls(innerBones, camera, renderer.domElement);
    dragControls.addEventListener('hoveron', () => {
      cameraControls.enabled = false;
    });
    dragControls.addEventListener('hoveroff', () => {
      cameraControls.enabled = true;
    });
    dragControls.addEventListener('dragstart', (event) => {
      if (innerCurrentBone !== event.object.parent) {
        transformControls.attach(event.object.parent);
        setInnerCurrentBone(event.object.parent);
        storeCurrentBone(event.object.parent);
        dragControls.enabled = false;
      }
      if (innerMixer) {
        innerMixer.timeScale = 0;
      }
    });
    dragControls.addEventListener('dragend', (event) => {
      dragControls.enabled = true;
    });
  }
};

export default fnAddJointMeshes;
