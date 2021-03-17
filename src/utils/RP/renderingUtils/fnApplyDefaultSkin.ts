/* eslint-disable no-param-reassign */
import * as THREE from 'three';
import _ from 'lodash';

const SKIN_CHECK_DURATION = 1000;

const defaultMaterial = new THREE.MeshPhongMaterial({
  color: '#404040',
  depthWrite: true,
  side: THREE.FrontSide,
  skinning: true,
});

// load 된 objcet의 model 에 대해 타입 특정 시 에러 발생
interface FnApplyDefaultSkin {
  model: any;
}

/**
 * This function will be called when adding the model to the scene.
 * It checks whether the model's skin is supported by THREE.js or not.
 * If not, it will apply the default skin to the model.
 *
 * @param model - The model of the object
 *
 */
const fnApplyDefaultSkin = (props: FnApplyDefaultSkin) => {
  const { model } = props;
  const skinnedMeshes = _.filter(model.children, (child) => child.type === 'SkinnedMesh');
  if (_.isEmpty(skinnedMeshes)) {
    _.forEach(model.children, (innerChild) => {
      skinnedMeshes.push(..._.filter(innerChild.children, (c) => c.type === 'SkinnedMesh'));
    });
  }
  setTimeout(() => {
    _.forEach(skinnedMeshes, (mesh) => {
      const materials: any[] = [];
      if (_.isArray(mesh.material)) {
        _.forEach(mesh.material, (m) => {
          if (m.version === 0) {
            materials.push(m);
          }
        });
      } else if (mesh.material.version === 0) {
        materials.push(mesh.material);
      }
      if (!_.isEmpty(materials)) {
        _.forEach(materials, (material) => {
          if (!material.map) {
            material.color = new THREE.Color('#404040');
          }
        });
      }
      const skippedMaterials = _.filter(
        materials,
        (material) => material.map && _.isUndefined(material.map.image),
      );
      if (!_.isEmpty(skippedMaterials)) {
        mesh.material = defaultMaterial;
      }
    });
  }, SKIN_CHECK_DURATION);
};

export default fnApplyDefaultSkin;
