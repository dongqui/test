import { GLTFLoader } from '../../three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

interface useGetAnimationDataProps {
  url: string;
}
export const fnGetAnimationData = async ({ url }: useGetAnimationDataProps) => {
  const loader = new GLTFLoader();
  try {
    const { scene, animations } = await loader.loadAsync(url);
    const { bones } = new THREE.SkeletonHelper(scene);
    return {
      animations,
      bones,
      error: false,
    };
  } catch (error) {
    return {
      error: true,
      msg: error,
    };
  }
};
