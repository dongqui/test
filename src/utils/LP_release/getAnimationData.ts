import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

interface GetAnimationData {
  url: string;
}
interface ResultType {
  animations: THREE.AnimationClip[];
  bones: THREE.Bone[];
  isError: boolean;
  errorMsg: string;
}
/**
 * 파일 url 을 통해서 애니메이션 데이터, bone 데이터를 받는다.
 *
 * @param url - 파일 url
 *
 * @return 애니메이션 데이터, bone 데이터
 */
const getAnimationData = async (params: GetAnimationData): Promise<ResultType> => {
  const { url } = params;
  const loader = new GLTFLoader();

  try {
    const { scene, animations } = await loader.loadAsync(url);
    const { bones } = new THREE.SkeletonHelper(scene);

    return {
      animations,
      bones,
      isError: false,
      errorMsg: '',
    };
  } catch (error) {
    return {
      animations: [],
      bones: [],
      isError: true,
      errorMsg: error,
    };
  }
};
export default getAnimationData;
