import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { LPDataType } from 'types';
import { fnGetAnimationClipForExport } from 'utils/TP/editingUtils';
import _ from 'lodash';

interface FnExportModelToFbx {
  modelName: string;
  modelUrl: string;
  motions: LPDataType[];
}

/**
 * LP 내의 모델을 .fbx 형식으로 추출합니다.
 *
 */
const fnExportModelToFbx = async (props: FnExportModelToFbx) => {
  // scene 이랑 animations 가 필요
  // glb 로 뽑은 후에 api 거쳐서 추출
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
      const file = new File([blob], `${modelName.slice(0, -4)}.glb`);
    },
    options,
  );
};

export default fnExportModelToFbx;
