import * as BABYLON from '@babylonjs/core';
import { ShootView } from 'types/common';

const defaultWidth = 100;
const defaultHeight = 100;

const createGround = (
  scene: BABYLON.Scene,
  useTexture: boolean,
  width: number,
  height: number,
  view: ShootView,
) => {
  const ground = BABYLON.MeshBuilder.CreatePlane(
    'ground',
    {
      width: width ?? defaultWidth,
      height: height ?? defaultHeight,
      sideOrientation: BABYLON.Mesh.DOUBLESIDE,
    },
    scene,
  );
  ground.renderingGroupId = 0;
  ground.isPickable = false;
  ground.id = view;
  BABYLON.Tags.EnableFor(ground);
  //@ts-ignore
  ground.addTags('ground');
  ground.isVisible = view === 'top';
  const groundMaterial = new BABYLON.StandardMaterial('groundMaterial', scene);

  if (useTexture) {
    const emissiveTexture = new BABYLON.Texture('texture/texture_02.png', scene);
    // texture 반복과 관련한 설정입니다.
    emissiveTexture.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
    emissiveTexture.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
    emissiveTexture.uScale = 50;
    emissiveTexture.vScale = 50;
    groundMaterial.emissiveTexture = emissiveTexture;
    groundMaterial.disableLighting = true;
  }
  ground.material = groundMaterial;

  switch (view) {
    case 'top': {
      ground.rotate(BABYLON.Axis.X, Math.PI / 2);
      break;
    }
    case 'bottom': {
      // ground.position = new Vector3(0, height, 0);
      ground.rotate(BABYLON.Axis.X, -Math.PI / 2);
      break;
    }
    case 'left': {
      // ground.position = new Vector3(-width / 2, 0, 0);
      ground.rotate(BABYLON.Axis.Y, Math.PI / 2);
      break;
    }
    case 'right': {
      // ground.position = new Vector3(width / 2, 0, 0);
      ground.rotate(BABYLON.Axis.Y, -Math.PI / 2);
      break;
    }
    case 'front': {
      // ground.position = new Vector3(0, 0, height / 2);
      break;
    }
    case 'back': {
      // ground.position = new Vector3(0, 0, -height / 2);
      ground.rotate(BABYLON.Axis.Z, Math.PI);
      break;
    }
    default: {
      break;
    }
  }

  return ground;
};

/**
 * ground를 생성합니다.
 *
 * @param scene - ground를 생성할 scene
 * @param useTexture - texture 사용 여부
 * @param width - ground의 가로 default = 30
 * @param height - ground의 세로 default = 30
 * @param subdivision - 한 면당 subdivisions의 수 default = 30
 */
const createGrounds = (
  scene: BABYLON.Scene,
  useTexture: boolean,
  width?: number,
  height?: number,
) => {
  const grounds: BABYLON.Mesh[] = [];

  const views: ShootView[] = ['top', 'bottom', 'left', 'right', 'front', 'back'];
  views.forEach((view) => {
    grounds.push(
      createGround(scene, useTexture, width ?? defaultWidth, height ?? defaultHeight, view),
    );
  });

  return grounds;
};

export default createGrounds;
