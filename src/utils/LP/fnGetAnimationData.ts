import { GLTFLoader } from '../../three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

interface FnGetAnimationData {
  url: string;
}
/**
 * 파일 url 을 통해서 애니메이션 데이터, bone 데이터를 받는다.
 *
 * @param url - 파일 url
 *
 * @return 애니메이션 데이터, bone 데이터
 */
const fnGetAnimationData = async ({ url }: FnGetAnimationData) => {
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
export default fnGetAnimationData;
