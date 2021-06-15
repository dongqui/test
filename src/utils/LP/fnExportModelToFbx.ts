import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { fnGetAnimationClipForExport } from 'utils/TP/editingUtils';
import _ from 'lodash';
import { setConvertGlbToFbx } from 'utils/common/api';
import { LPItemListOldType } from 'types/LP';

interface FnExportModelToFbx {
  modelName: string;
  modelUrl: string;
  motions: LPItemListOldType;
}

/**
 * LP 내의 모델을 .fbx 형식으로 추출합니다.
 *
 * @param modelName - 추출 대상 모델의 이름
 * @param modelUrl - 추출 대상 모델의 url
 * @param motions - 추출 대상 모델이 포함하고 있는 모션들
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
    async (res) => {
      // ts-ignore 없애면 blob 생성 시 타입 에러
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const blob = new Blob([res], { type: 'octet/stream' });
      const file = new File([blob], `${modelName.slice(0, -4)}.glb`);
      // api 실패 시 throw error
      try {
        await setConvertGlbToFbx({
          file,
          type: 'glb',
          id: String(Date.now() / 1000),
        })
          .then((res) => {
            const a = document.createElement('a');
            a.download = `${modelName.slice(0, -4)}.fbx`;
            a.href = res;
            a.click();
          })
          .catch((e) => {
            throw Error(e);
          });
      } catch (error) {
        throw Error(error);
      }
    },
    options,
  );
};

export default fnExportModelToFbx;
