import { GLTFLoader } from '../../three/examples/jsm/loaders/GLTFLoader';

interface useGetAnimationDataProps {
  url: string;
}
export const fnGetAnimationData = async ({ url }: useGetAnimationDataProps) => {
  const loader = new GLTFLoader();
  try {
    const { animations = [] } = await loader.loadAsync(url);
    return {
      result: animations,
      error: false,
    };
  } catch (error) {
    return {
      error: true,
      msg: error,
    };
  }
};
