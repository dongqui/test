import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { LPDataType } from 'types';
import _ from 'lodash';
import { fnGetAnimationClipForExport } from 'utils/TP/editingUtils';

interface FnExportModelToGlb {
  modelName: string;
  modelUrl: string;
  motions: LPDataType[];
}

/**
 * LP 내의 모델을 .glb 형식으로 추출합니다.
 *
 * @param modelName - 추출 대상 모델의 이름
 * @param modelUrl - 추출 대상 모델의 url
 * @param motions - 추출 대상 모델이 포함하고 있는 모션들
 *
 */
const fnExportModelToGlb = async (props: FnExportModelToGlb) => {
  // scene 이랑 animations 가 필요
  // mainData 에서 model 의 name, url, motions 배열 받으면 될 듯
  const { modelName, modelUrl, motions } = props;
  const loader = new GLTFLoader();
  const scene = await loader.loadAsync(modelUrl).then((object) => object.scene || object.scenes[0]);
  const animations =
    motions.length !== 0
      ? _.map(motions, (motion) =>
          fnGetAnimationClipForExport({
            name: motion.name,
            baseLayer: motion.baseLayer,
            layers: motion.layers,
          }),
        )
      : [];
  const options = {
    binary: true,
    animations,
  };
  const exporter = new GLTFExporter();
  exporter.parse(
    scene,
    (res) => {
      // ts-ignore 없애면 blob 생성 시 타입 에러
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const blob = new Blob([res], { type: 'octet/stream' });
      const objURL = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.download = `${modelName.slice(0, -4)}.glb`;
      a.href = objURL;
      a.click();
    },
    options,
  );
};

export default fnExportModelToGlb;
