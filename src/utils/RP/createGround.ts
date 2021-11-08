import * as BABYLON from '@babylonjs/core';

const defaultWidth = 100;
const defaultHeight = 100;
const defaultSubdivision = 100;

/**
 * ground를 생성합니다.
 *
 * @param scene - ground를 생성할 scene
 * @param useTexture - texture 사용 여부
 * @param width - ground의 가로 default = 30
 * @param height - ground의 세로 default = 30
 * @param subdivision - 한 면당 subdivisions의 수 default = 30
 */
const createGround = (
  scene: BABYLON.Scene,
  useTexture: boolean,
  width?: number,
  height?: number,
  subdivision?: number,
) => {
  const ground = BABYLON.Mesh.CreateGround(
    'ground',
    (width = defaultWidth),
    (height = defaultHeight),
    (subdivision = defaultSubdivision),
    scene,
  );
  ground.isPickable = false;
  const groundMaterial = new BABYLON.StandardMaterial('groundMaterial', scene);

  if (useTexture) {
    const diffuseTexture = new BABYLON.Texture('texture/texture_01.png', scene);
    // texture 반복과 관련한 설정입니다.
    diffuseTexture.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
    diffuseTexture.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
    diffuseTexture.uScale = 50;
    diffuseTexture.vScale = 50;
    groundMaterial.diffuseTexture = diffuseTexture;
  }

  ground.material = groundMaterial;

  return ground;
};

export default createGround;
