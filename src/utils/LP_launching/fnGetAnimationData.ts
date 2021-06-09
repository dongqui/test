import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

interface FnGetAnimationData {
  url: string;
}
interface ResultType {
  animations: THREE.AnimationClip[];
  bones: THREE.Bone[];
  isError: boolean;
  errorMessage: string;
}
/**
 * 파일 url 을 통해서 애니메이션 데이터, bone 데이터를 받는다.
 *
 * @param url - 파일 url
 *
 * @return 애니메이션 데이터, bone 데이터
 */
const fnGetAnimationData = async (params: FnGetAnimationData): Promise<ResultType> => {
  const { url } = params;
  const loader = new GLTFLoader();

  const { scene, animations } = await loader
    .loadAsync(url)
    .then((result) => result)
    .catch((e) => {
      throw Error(e);
    });
  const { bones } = new THREE.SkeletonHelper(scene);

  return {
    animations,
    bones,
    isError: false,
    errorMessage: '',
  };
};
export default fnGetAnimationData;
