import { HemisphericLight, Scene, Vector3 } from '@babylonjs/core';

const defaultReflectionDirectionArray = [0, 1, 1];

/**
 * create hemisphereic light with default settings
 *
 * @param scene - scene where the light will be added
 * @param reflectionDirection - the direcion where the light is reflected to (default = (0, 1, 1))
 */
const createHemisphericLight = (scene: Scene, reflectionDirection?: Vector3) => {
  const hemisphericLight = new HemisphericLight('hemisphericLight', (reflectionDirection = Vector3.FromArray(defaultReflectionDirectionArray)), scene);
  hemisphericLight.intensity = 0.9;

  return hemisphericLight;
};

export default createHemisphericLight;
