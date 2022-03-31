import { Axis, Mesh, MeshBuilder, Scene, StandardMaterial, Tags, Texture } from '@babylonjs/core';
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
const createGround = (scene: Scene, useTexture: boolean, width: number, height: number, view: PlaskView) => {
  const ground = MeshBuilder.CreatePlane(
    'ground',
    {
      width: width ?? defaultWidth,
      height: height ?? defaultHeight,
      sideOrientation: Mesh.DOUBLESIDE,
    },
    scene,
  );
  ground.renderingGroupId = 0;
  ground.isPickable = false;
  ground.id = `groud//${view}`;
  Tags.EnableFor(ground);
  //@ts-ignore
  ground.addTags('ground');
  ground.isVisible = view === 'top';
  const groundMaterial = new StandardMaterial('groundMaterial', scene);

  if (useTexture) {
    const emissiveTexture = new Texture('texture/texture_02.png', scene);
    // settings for texture repeat
    emissiveTexture.wrapU = Texture.WRAP_ADDRESSMODE;
    emissiveTexture.wrapV = Texture.WRAP_ADDRESSMODE;
    emissiveTexture.uScale = 250;
    emissiveTexture.vScale = 250;
    groundMaterial.emissiveTexture = emissiveTexture;
    groundMaterial.disableLighting = true;
  }
  ground.material = groundMaterial;

  switch (view) {
    case 'top': {
      ground.rotate(Axis.X, Math.PI / 2);
      break;
    }
    case 'bottom': {
      ground.rotate(Axis.X, -Math.PI / 2);
      break;
    }
    case 'left': {
      ground.rotate(Axis.Y, Math.PI / 2);
      break;
    }
    case 'right': {
      ground.rotate(Axis.Y, -Math.PI / 2);
      break;
    }
    case 'front': {
      break;
    }
    case 'back': {
      ground.rotate(Axis.Z, Math.PI);
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
const createGrounds = (scene: Scene, useTexture: boolean, width?: number, height?: number) => {
  const grounds: Mesh[] = [];

  const views: PlaskView[] = ['top', 'bottom', 'left', 'right', 'front', 'back'];
  views.forEach((view) => {
    grounds.push(createGround(scene, useTexture, width ?? defaultWidth, height ?? defaultHeight, view));
  });

  return grounds;
};

export default createGrounds;
