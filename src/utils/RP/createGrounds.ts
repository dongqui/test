import * as BABYLON from '@babylonjs/core';
import { PlaskView } from 'types/common';

const defaultWidth = 500;
const defaultHeight = 500;

/**
 * Create a ground for specific view.
 * This function is used only inside of the createGrounds function.
 *
 * @param scene - scene where the ground will be added
 * @param useTexture - whether texture is used or not
 * @param width - ground's width
 * @param height - ground's height
 * @param view - target view(front, back, top, bottom, left, right)
 */
const createGround = (scene: BABYLON.Scene, useTexture: boolean, width: number, height: number, view: PlaskView) => {
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
  ground.id = `groud//${view}`;
  BABYLON.Tags.EnableFor(ground);
  //@ts-ignore
  ground.addTags('ground');
  ground.isVisible = view === 'top';
  const groundMaterial = new BABYLON.StandardMaterial('groundMaterial', scene);

  if (useTexture) {
    const emissiveTexture = new BABYLON.Texture('texture/texture_02.png', scene);
    // settings for texture repeat
    emissiveTexture.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
    emissiveTexture.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
    emissiveTexture.uScale = 250;
    emissiveTexture.vScale = 250;
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
      ground.rotate(BABYLON.Axis.X, -Math.PI / 2);
      break;
    }
    case 'left': {
      ground.rotate(BABYLON.Axis.Y, Math.PI / 2);
      break;
    }
    case 'right': {
      ground.rotate(BABYLON.Axis.Y, -Math.PI / 2);
      break;
    }
    case 'front': {
      break;
    }
    case 'back': {
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
 * create grounds on scene.root(Vector3.Zero) for 6 views.(front, back, top, bottom, left, right)
 *
 * @param scene - scene where grounds will be added
 * @param useTexture - whether texture is used or not
 * @param width - ground's width (default = 500)
 * @param height - ground's height (default = 500)
 */
const createGrounds = (scene: BABYLON.Scene, useTexture: boolean, width?: number, height?: number) => {
  const grounds: BABYLON.Mesh[] = [];

  const views: PlaskView[] = ['top', 'bottom', 'left', 'right', 'front', 'back'];
  views.forEach((view) => {
    grounds.push(createGround(scene, useTexture, width ?? defaultWidth, height ?? defaultHeight, view));
  });

  return grounds;
};

export default createGrounds;
