/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-param-reassign */
import { useCallback, useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import _ from 'lodash';
import { GLTFLoader } from '../../three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from '../../three/examples/jsm/loaders/FBXLoader';
import { OrbitControls } from '../../three/examples/jsm/controls/OrbitControls';
import { TransformControls } from '../../three/examples/jsm/controls/TransformControls';
import { DragControls } from '../../three/examples/jsm/controls/DragControls';
import { useHistory } from './useHistory';
import { FORMAT_TYPES } from '../../interfaces';
import { RenderingOption } from '../../interfaces/RP';

const MAP_TYPES = [
  'map',
  'aoMap',
  'emissiveMap',
  'glossinessMap',
  'metalnessMap',
  'normalMap',
  'roughnessMap',
  'specularMap',
];

const RENDERING_OPTION = {
  scene: {
    backgroundColor: '#454545',
    fogColor: 0xbbbbbb,
  },
  camera: {
    fov: 50,
    aspect: 1920 / 1080,
    near: 0.1,
    value: 500,
  },
  renderer: {
    shadowMap: true,
  },
  light: {
    hemiLight: {
      color: 0xaaaaaa,
      position: {
        x: 0,
        y: 20,
        z: 0,
      },
    },
    dirLight: {
      color: 0xffffff,
      intensity: 0.54,
      position: {
        x: -8,
        y: 12,
        z: 8,
      },
      shadow: {
        mapSize: new THREE.Vector2(1000, 1000),
        camera: {
          near: 0.1,
          far: 1500,
          left: 8.25 * -1,
          right: 8.25,
          top: 8.25,
          bottom: 8.25 * -1,
        },
      },
    },
  },
  ground: {
    textureUrl: 'texture/texture_01.png',
    textureRepeat: {
      x: 300,
      y: 300,
    },
    width: 1000,
    height: 1000,
    color: '#454545',
    depthWrite: false,
    side: THREE.DoubleSide,
    position: {
      x: 0,
      y: 0,
      z: 0,
    },
    receiveShadow: true,
  },
  axis: {
    x: {
      color: '#ea2027',
      points: [new THREE.Vector3(-500, 0, 0), new THREE.Vector3(500, 0, 0)],
    },
    y: {
      color: '#20b812',
      points: [new THREE.Vector3(0, -500, 0), new THREE.Vector3(0, 500, 0)],
    },
    z: {
      color: '#0652dd',
      points: [new THREE.Vector3(0, 0, -500), new THREE.Vector3(0, 0, 500)],
    },
  },
  cameraControls: {
    target: {
      x: 0,
      y: 0,
      z: 0,
    },
    enabled: true,
    enablePan: true,
    maxDistance: 300,
    minZoom: 1.0001,
  },
  skeletonJoint: {
    color: 0xffffff,
    opacity: 0.5,
    transparent: true,
    segments: {
      width: 32,
      height: 32,
    },
  },
};

const SKIN_CHECK_DURATION = 1000;

let innerMixer: any;

// 회색입히기 위한 기본 material
const defaultMaterial = new THREE.MeshPhongMaterial({
  color: '#404040',
  depthWrite: true,
  side: THREE.FrontSide,
  skinning: true,
});

export const useRenderingModel = ({
  id,
  fileUrl,
  format,
  setMixer,
  renderingOptions,
  setSkeletonHelper,
  setAnimations,
}: {
  id: string;
  fileUrl?: string;
  format: FORMAT_TYPES;
  setMixer: Function;
  renderingOptions: RenderingOption[] | undefined;
  setSkeletonHelper: Function;
  setAnimations: Function;
}) => {
  const [currentBone, setCurrentBone] = useState(null); // 현재 드래그한 Bone
  const [contents, setContents] = useState<any[]>([]); // clear하기 위해 content 담아놓은 array
  const [theScene, setTheScene] = useState<THREE.Scene | null>(null); // clear 함수에서 사용하기 위해 component state로 관리
  const [theCameraControls, setTheCameraControls] = useState<OrbitControls | undefined>(undefined);
  // const [isViewportOpen, setIsViewportOpen] = useState(false);

  const clock = new THREE.Clock();

  const multiKeyController = useMemo(
    () => ({
      v: { pressed: false },
      r: { pressed: false },
      k: { pressed: false },
      V: { pressed: false },
      R: { pressed: false },
      K: { pressed: false },
      ㅍ: { pressed: false },
      ㄱ: { pressed: false },
      ㅏ: { pressed: false },
    }),
    [],
  );

  const { pushToUndoArray, popFromUndoArray, resetRedoArray, popFromRedoArray } = useHistory();

  const createScene = useCallback(() => {
    const scene = new THREE.Scene(); // scene 생성
    scene.background = new THREE.Color(RENDERING_OPTION.scene.backgroundColor); // scene 배경색
    if (_.find(renderingOptions, (item, index) => _.isEqual(item.key, 'sceneFogPower'))?.value) {
      scene.fog = new THREE.Fog(
        RENDERING_OPTION.scene.fogColor,
        _.find(renderingOptions, (item, index) => _.isEqual(item.key, 'sceneFogNear'))?.value,
        _.find(renderingOptions, (item, index) => _.isEqual(item.key, 'sceneFogFar'))?.value,
      ); // scene 안개 (color, near, far)
    }
    return scene;
  }, [renderingOptions]);

  const createCamera = useCallback(() => {
    const camera = new THREE.PerspectiveCamera(
      RENDERING_OPTION.camera.fov,
      RENDERING_OPTION.camera.aspect,
      RENDERING_OPTION.camera.near,
      RENDERING_OPTION.camera?.value,
    ); // camera 생성
    if (!_.find(renderingOptions, (item, index) => _.isEqual(item.key, 'sceneYUp'))?.value) {
      camera.up.set(0, 0, 1); // z-up
    }
    // camera 위치 (default)
    let cameraPosition = _.find(renderingOptions, (item, index) =>
      _.isEqual(item.key, 'cameraDefaultPosition'),
    )?.value;
    if (_.isEqual(format, FORMAT_TYPES.fbx)) {
      // camera 위치 (fbx)
      cameraPosition = _.find(renderingOptions, (item, index) =>
        _.isEqual(item.key, 'cameraFbxPosition'),
      )?.value;
    }
    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    const cameraLookAt = _.find(renderingOptions, (item, index) =>
      _.isEqual(item.key, 'cameraLookAt'),
    )?.value;
    camera.lookAt(cameraLookAt.x, cameraLookAt.y, cameraLookAt.z); // camera 방향
    return camera;
  }, [renderingOptions, format]);

  const createRenderer = useCallback(
    ({ renderingDiv }: { renderingDiv: HTMLDivElement | undefined }) => {
      const renderer = new THREE.WebGL1Renderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.shadowMap.enabled = RENDERING_OPTION.renderer.shadowMap; // 그림자 보이게 설정
      renderer.outputEncoding = THREE.sRGBEncoding; // 결과물 encoding 설정
      renderer.setSize(renderingDiv?.clientWidth ?? 0, renderingDiv?.clientHeight ?? 0); // renderer 사이즈 설정
      return renderer;
    },
    [],
  );

  const addLights = useCallback(
    ({ scene }: { scene: THREE.Scene }) => {
      // 반구형 조명
      const hemiLight = new THREE.HemisphereLight(RENDERING_OPTION.light.hemiLight.color); // 반구형 조명
      hemiLight.position.set(
        RENDERING_OPTION.light.hemiLight.position.x,
        RENDERING_OPTION.light.hemiLight.position.y,
        RENDERING_OPTION.light.hemiLight.position.z,
      );
      scene.add(hemiLight);

      // 방향 조명
      const dirLight = new THREE.DirectionalLight(
        RENDERING_OPTION.light.dirLight.color,
        RENDERING_OPTION.light.dirLight.intensity,
      );
      dirLight.position.set(
        RENDERING_OPTION.light.dirLight.position.x,
        RENDERING_OPTION.light.dirLight.position.y,
        RENDERING_OPTION.light.dirLight.position.z,
      );
      dirLight.castShadow = _.find(renderingOptions, (item, index) =>
        _.isEqual(item.key, 'dirLightCastShadow'),
      )?.value;
      if (
        _.find(renderingOptions, (item, index) => _.isEqual(item.key, 'dirLightCastShadow'))?.value
      ) {
        dirLight.shadow.mapSize = RENDERING_OPTION.light.dirLight.shadow.mapSize;
        dirLight.shadow.camera.near = RENDERING_OPTION.light.dirLight.shadow.camera.near;
        dirLight.shadow.camera.far = RENDERING_OPTION.light.dirLight.shadow.camera.far;
        dirLight.shadow.camera.left = RENDERING_OPTION.light.dirLight.shadow.camera.left;
        dirLight.shadow.camera.right = RENDERING_OPTION.light.dirLight.shadow.camera.right;
        dirLight.shadow.camera.top = RENDERING_OPTION.light.dirLight.shadow.camera.top;
        dirLight.shadow.camera.bottom = RENDERING_OPTION.light.dirLight.shadow.camera.bottom;
      }
      scene.add(dirLight);
    },
    [renderingOptions],
  );

  const addGround = useCallback(
    ({
      scene,
      camera,
      renderer,
    }: {
      scene: THREE.Scene;
      camera: THREE.Camera;
      renderer: THREE.Renderer;
    }) => {
      // ground
      const texture = new THREE.TextureLoader().load(RENDERING_OPTION.ground.textureUrl, () => {
        renderer.render(scene, camera);
      });
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(
        RENDERING_OPTION.ground.textureRepeat.x,
        RENDERING_OPTION.ground.textureRepeat.y,
      );
      const groundMesh = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(
          RENDERING_OPTION.ground.width,
          RENDERING_OPTION.ground.height,
        ),
        new THREE.MeshPhongMaterial({
          color: RENDERING_OPTION.ground.color,
          map: texture,
          depthWrite: RENDERING_OPTION.ground.depthWrite,
          side: RENDERING_OPTION.ground.side,
        }),
      );
      groundMesh.position.set(
        RENDERING_OPTION.ground.position.x,
        RENDERING_OPTION.ground.position.y,
        RENDERING_OPTION.ground.position.z,
      );
      if (_.find(renderingOptions, (item, index) => _.isEqual(item.key, 'sceneYUp'))?.value) {
        groundMesh.rotation.x = -Math.PI / 2; // y-up
      } else {
        groundMesh.rotation.x = -Math.PI; // z-up
      }
      groundMesh.receiveShadow = RENDERING_OPTION.ground.receiveShadow;
      scene.add(groundMesh);

      // x, y, z axis
      const xMaterial = new THREE.LineBasicMaterial({ color: RENDERING_OPTION.axis.x.color });
      const xGeometry = new THREE.BufferGeometry().setFromPoints(RENDERING_OPTION.axis.x.points);
      const xAxis = new THREE.Line(xGeometry, xMaterial);
      scene.add(xAxis);
      if (_.find(renderingOptions, (item, index) => _.isEqual(item.key, 'sceneYUp'))?.value) {
        const zMaterial = new THREE.LineBasicMaterial({ color: RENDERING_OPTION.axis.z.color });
        const zGeometry = new THREE.BufferGeometry().setFromPoints(RENDERING_OPTION.axis.z.points);
        const zAxis = new THREE.Line(zGeometry, zMaterial);
        scene.add(zAxis);
        return { groundMesh, axesArray: [xAxis, zAxis] };
      }
      const yMaterial = new THREE.LineBasicMaterial({ color: RENDERING_OPTION.axis.y.color });
      const yGeometry = new THREE.BufferGeometry().setFromPoints(RENDERING_OPTION.axis.y.points);
      const yAxis = new THREE.Line(yGeometry, yMaterial);
      scene.add(yAxis);
      return { groundMesh, axesArray: [xAxis, yAxis] };
    },
    [renderingOptions],
  );

  const createCameraControls = useCallback(
    ({ camera, renderer }: { camera: THREE.Camera; renderer: THREE.Renderer }) => {
      // 카메라 컨트롤러 생성 및 설정
      const cameraControls = new OrbitControls(camera, renderer.domElement);
      // cameraControls에서 마우스 컨트롤 관련 preventDefault를 한 상태.. 우선 막는거는 했는데, 결국에는 cameraControls 커스텀 필요할 듯..
      cameraControls.mouseButtons = {
        // @ts-ignore
        LEFT: THREE.MOUSE.NONE,
        MIDDLE: THREE.MOUSE.PAN,
        // @ts-ignore
        RIGHT: THREE.MOUSE.NONE,
      };
      cameraControls.target.set(
        RENDERING_OPTION.cameraControls.target.x,
        RENDERING_OPTION.cameraControls.target.y,
        RENDERING_OPTION.cameraControls.target.z,
      );
      cameraControls.update();
      cameraControls.enablePan = RENDERING_OPTION.cameraControls.enablePan;
      cameraControls.enabled = RENDERING_OPTION.cameraControls.enabled;
      cameraControls.maxDistance = RENDERING_OPTION.cameraControls.maxDistance;
      cameraControls.minZoom = RENDERING_OPTION.cameraControls.minZoom; // 최대 zoom-in 할 경우 조작 불가능해지는 버그 방지용
      cameraControls.addEventListener('change', () => {
        if (cameraControls.object.position.y < 1.01) {
          const { x, y, z } = cameraControls.object.position;
          cameraControls.object.position.set(x, y + 0.01, z);
        }
        if (cameraControls.object.position.y > 100) {
          const { x, y, z } = cameraControls.object.position;
          cameraControls.object.position.set(x, y - 1, z);
        }
      });
      return cameraControls;
    },
    [],
  );

  const createTransformControls = useCallback(
    ({
      scene,
      camera,
      renderer,
      cameraControls,
    }: {
      scene: THREE.Scene;
      camera: THREE.Camera;
      renderer: THREE.Renderer;
      cameraControls: OrbitControls;
    }) => {
      // 트랜스폼 컨트롤러 생성 (bone에 부착된 mesh 움직이는 컨트롤러)
      const transformControls: any = new TransformControls(camera, renderer.domElement);
      transformControls.addEventListener('change', () => {
        renderer.render(scene, camera);
      });
      transformControls.addEventListener('dragging-changed', (event: any) => {
        cameraControls.enabled = !event?.value; // 요소 드래그 중에는 카메라 이동 불가하도록 설정
        if (event.value) {
          const bone = event.target.object;
          const { mode } = transformControls;
          let value;
          switch (mode) {
            case 'translate':
              value = {
                x: bone.position.x,
                y: bone.position.y,
                z: bone.position.z,
              };
              break;
            case 'rotate':
              value = {
                w: bone.quaternion.w,
                x: bone.quaternion.x,
                y: bone.quaternion.y,
                z: bone.quaternion.z,
              };
              break;
            case 'scale':
              value = {
                x: bone.scale.x,
                y: bone.scale.y,
                z: bone.scale.z,
              };
              break;
            default:
              break;
          }
          pushToUndoArray({ bone, mode, value });
          resetRedoArray();
        }
      });
      // 트랜스폼 컨트롤러 scene에 추가
      scene.add(transformControls);
      // setTheTransformControls(transformControls);
      return transformControls;
    },
    [pushToUndoArray, resetRedoArray],
  );

  const handleTransformControlsShortcutDown = useCallback(
    ({
      event,
      transformControls,
    }: {
      event: KeyboardEvent;
      transformControls: TransformControls;
    }) => {
      switch (event.key) {
        case 'Escape': // esc
          // 현재 transformControl 붙어 있는 것 제거
          if (transformControls) {
            transformControls.detach();
            // setCurrentBoneIndex(undefined);
          }
          break;
        case 'q': // q
        case 'Q':
        case 'ㅂ':
          // 이동방향 기준 범위 변경
          if (transformControls) {
            transformControls.setSpace(transformControls.space === 'local' ? 'world' : 'local');
          }
          break;
        case 'Shift': // shift
          // 설정한 단위로 변경
          if (transformControls) {
            transformControls.setTranslationSnap(1);
            transformControls.setRotationSnap(THREE.MathUtils.degToRad(15));
          }
          break;
        case 'w': // w
        case 'W':
        case 'ㅈ':
          // position 변경 모드
          if (transformControls) {
            transformControls.setMode('translate');
          }
          break;
        case 'e': // e
        case 'E':
        case 'ㄷ':
          // rotation 변경 모드
          if (transformControls) {
            transformControls.setMode('rotate');
          }
          break;
        case 'r': // r
        case 'R':
        case 'ㄱ':
          // scale 변경 모드
          if (
            transformControls &&
            !(
              multiKeyController.v.pressed ||
              multiKeyController.V.pressed ||
              multiKeyController.ㅍ.pressed
            )
          ) {
            transformControls.setMode('scale');
          }
          break;
        case ']': // +, =, num+
          // transformControls 크기 증가
          if (transformControls && transformControls.size < 2.0) {
            transformControls.setSize(transformControls.size + 0.1);
          }
          break;
        case '[': // -, _, num-
          // transformControls 크기 감소
          if (transformControls && transformControls.size > 0.2) {
            transformControls.setSize(transformControls.size - 0.1);
          }
          break;
        default:
          break;
      }
    },
    [multiKeyController],
  );

  const handleTransformControlsShortcutUp = useCallback(
    ({ event, transformControls }: { event: any; transformControls: TransformControls }) => {
      switch (event.key) {
        case 'Shift': // shift
          // 기본 단위로 변경
          if (transformControls) {
            transformControls.setTranslationSnap(null);
            transformControls.setRotationSnap(null);
          }
          break;
        default:
          break;
      }
    },
    [],
  );

  const createMixer = useCallback(
    ({ object }: { object: any }) => {
      if (_.isEqual(format, FORMAT_TYPES.glb) || _.isEqual(format, FORMAT_TYPES.gltf)) {
        innerMixer = new THREE.AnimationMixer(object.scene);
      } else if (_.isEqual(format, FORMAT_TYPES.fbx)) {
        innerMixer = new THREE.AnimationMixer(object);
      }
      setMixer(innerMixer);
    },
    [format, setMixer],
  );

  const addModel = useCallback(
    ({ scene, object }: { scene: THREE.Scene; object: any }) => {
      let model: any;
      if (_.isEqual(format, FORMAT_TYPES.glb) || _.isEqual(format, FORMAT_TYPES.gltf)) {
        model = object.scene || object.scenes[0];
      } else if (_.isEqual(format, FORMAT_TYPES.fbx)) {
        object.scale.multiplyScalar(0.05);
        object.traverse((child: any) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        model = object;
      }
      // load 후 model을 scene에 추가
      setTimeout(() => {
        scene.add(model);
      }, SKIN_CHECK_DURATION);
      // object.scene 내에 mesh가 존재한다면 그림자 추가
      model.traverse((obj: any) => {
        if (obj.isMesh) {
          // 아래는 회색 입히기
          // eslint-disable-next-line no-param-reassign
          obj.castShadow = true;
        }
      });
      return model;
    },
    [format],
  );

  const applyDefaultSkin = useCallback(({ model }: { model: any }) => {
    const skinnedMeshes = _.filter(model.children, (child) => child.type === 'SkinnedMesh');
    if (_.isEmpty(skinnedMeshes)) {
      _.forEach(model.children, (innerChild) => {
        skinnedMeshes.push(..._.filter(innerChild.children, (c) => c.type === 'SkinnedMesh'));
      });
    }
    setTimeout(() => {
      _.forEach(skinnedMeshes, (mesh) => {
        const materials: any[] = [];
        if (_.isArray(mesh.material)) {
          _.forEach(mesh.material, (m) => {
            if (m.version === 0) {
              materials.push(m);
            }
          });
        } else if (mesh.material.version === 0) {
          materials.push(mesh.material);
        }
        if (!_.isEmpty(materials)) {
          _.forEach(materials, (material) => {
            if (!material.map) {
              material.color = new THREE.Color('#404040');
            }
          });
        }
        const skippedMaterials = _.filter(
          materials,
          (material) => material.map && _.isUndefined(material.map.image),
        );
        if (!_.isEmpty(skippedMaterials)) {
          mesh.material = defaultMaterial;
        }
      });
    }, SKIN_CHECK_DURATION);
  }, []);

  const addSkeletonHelper = useCallback(
    ({ scene, model }: { scene: THREE.Scene; model: THREE.Object3D }) => {
      const skeletonHelper = new THREE.SkeletonHelper(model);
      skeletonHelper.visible = _.find(renderingOptions, (item, index) =>
        _.isEqual(item.key, 'skeletonBonesPower'),
      )?.value;
      setTimeout(() => {
        scene.add(skeletonHelper);
      }, SKIN_CHECK_DURATION);
      setSkeletonHelper(skeletonHelper);
      return skeletonHelper;
    },
    [renderingOptions, setSkeletonHelper],
  );

  const addJointMeshes = useCallback(
    ({
      skeletonHelper,
      camera,
      renderer,
      cameraControls,
      transformControls,
    }: {
      skeletonHelper: THREE.SkeletonHelper;
      camera: THREE.Camera;
      renderer: THREE.Renderer;
      cameraControls: OrbitControls;
      transformControls: TransformControls;
    }) => {
      const innerBones: THREE.Bone[] = [];
      // skeleton helper의 bones 순회하며, 구형 mesh 추가
      skeletonHelper.bones.forEach((bone) => {
        // Bone에 부착할 Mesh 정의
        const boneMaterial = new THREE.MeshPhongMaterial({
          color: RENDERING_OPTION.skeletonJoint.color,
          opacity: RENDERING_OPTION.skeletonJoint.opacity,
          transparent: RENDERING_OPTION.skeletonJoint.transparent,
        });
        boneMaterial.depthWrite = false; // skin 내부에 있어도 보이도록 설정
        boneMaterial.depthTest = false;

        const boneGeometry = new THREE.SphereBufferGeometry(
          _.find(renderingOptions, (item, index) =>
            _.isEqual(item.key, 'skeletonJointMeshesRadius'),
          )?.value,
          RENDERING_OPTION.skeletonJoint.segments.width,
          RENDERING_OPTION.skeletonJoint.segments.height,
        );

        const boneMesh = new THREE.Mesh(boneGeometry, boneMaterial);
        // bone에 부착
        bone.add(boneMesh);
        innerBones.push(bone);
      });
      // skeleton bones를 모두 담았을 때
      if (innerBones.length === skeletonHelper.bones.length) {
        // bones를 param에 넣어서 드래그 컨트롤러 생성
        const dragControls = new DragControls(innerBones, camera, renderer.domElement);
        // 드래그 컨트롤러 이벤트 리스너 추가
        dragControls.addEventListener('hoveron', () => {
          cameraControls.enabled = false;
        });
        dragControls.addEventListener('hoveroff', () => {
          cameraControls.enabled = true;
        });
        dragControls.addEventListener('dragstart', (event) => {
          if (currentBone !== event.object.parent) {
            transformControls.attach(event.object.parent);
            setCurrentBone(event.object.parent);
            // setCurrentBoneIndex(
            //   _.findIndex(skeletonHelper.bones, (bone) => _.isEqual(bone, event.object.parent)),
            // );
            dragControls.enabled = false;
          }
          if (innerMixer) {
            innerMixer.timeScale = 0; // 드래그하면 애니메이션 일시정지
          }
        });
        dragControls.addEventListener('dragend', (event) => {
          dragControls.enabled = true;
        });
      }
    },
    [renderingOptions, currentBone],
  );

  const handleCameraControlsShortcutDown = useCallback(
    ({ event, cameraControls }: { event: KeyboardEvent; cameraControls: any }) => {
      switch (event.key) {
        case 'Alt': // alt
          cameraControls.mouseButtons.MIDDLE = THREE.MOUSE.ROTATE;
          break;
        case 'Shift':
        case 'Meta':
        case 'Control':
          cameraControls.mouseButtons.MIDDLE = THREE.MOUSE.ROTATE;
          cameraControls.rotateSpeed = 0;
          break;
        case 'v': // v (viewport)
        case 'V':
        case 'ㅍ':
          if (multiKeyController[event.key]) {
            multiKeyController[event.key].pressed = true;
          }
          // setIsViewportOpen(true);
          break;
        case 't': // t (top)
        case 'T':
        case 'ㅅ':
          if (!_.find(renderingOptions, (item, index) => _.isEqual(item.key, 'sceneYUp'))?.value) {
            cameraControls.object.position.set(0, -5, 10);
            cameraControls.object.lookAt(0, 0, 0);
            cameraControls.target.set(0, 0, 0);
            cameraControls.update();
          } else {
            cameraControls.object.position.set(0, 10, 0);
            cameraControls.object.lookAt(0, 0, 0);
            cameraControls.target.set(0, 0, 0);
            cameraControls.update();
          }
          break;
        case 'b': // b (bottom)
        case 'B':
        case 'ㅠ':
          if (!_.find(renderingOptions, (item, index) => _.isEqual(item.key, 'sceneYUp'))?.value) {
            cameraControls.object.position.set(0, -5, -10);
            cameraControls.object.lookAt(0, 0, 0);
            cameraControls.target.set(0, 0, 0);
            cameraControls.update();
          } else {
            cameraControls.object.position.set(0, -10, 0);
            cameraControls.object.lookAt(0, 0, 0);
            cameraControls.target.set(0, 0, 0);
            cameraControls.update();
          }
          break;
        case 'l': // l (left)
        case 'L':
        case 'ㅣ':
          if (!_.find(renderingOptions, (item, index) => _.isEqual(item.key, 'sceneYUp'))?.value) {
            cameraControls.object.position.set(-10, 0, 5);
            cameraControls.object.lookAt(0, 0, 0);
            cameraControls.target.set(0, 0, 0);
            cameraControls.update();
          } else {
            cameraControls.object.position.set(-10, 5, 0);
            cameraControls.object.lookAt(0, 0, 0);
            cameraControls.target.set(0, 0, 0);
            cameraControls.update();
          }
          break;
        case 'r': // r (right)
        case 'R':
        case 'ㄱ':
          if (multiKeyController[event.key]) {
            multiKeyController[event.key].pressed = true;
          }
          if (
            (multiKeyController.v.pressed ||
              multiKeyController.V.pressed ||
              multiKeyController.ㅍ.pressed) &&
            multiKeyController[event.key].pressed
          ) {
            if (
              !_.find(renderingOptions, (item, index) => _.isEqual(item.key, 'sceneYUp'))?.value
            ) {
              cameraControls.object.position.set(10, 0, 5);
              cameraControls.object.lookAt(0, 0, 0);
              cameraControls.target.set(0, 0, 0);
              cameraControls.update();
            } else {
              cameraControls.object.position.set(10, 5, 0);
              cameraControls.object.lookAt(0, 0, 0);
              cameraControls.target.set(0, 0, 0);
              cameraControls.update();
            }
          }
          break;
        case 'f': // f (front)
        case 'F':
        case 'ㄹ':
          if (!_.find(renderingOptions, (item, index) => _.isEqual(item.key, 'sceneYUp'))?.value) {
            cameraControls.object.position.set(0, -10, 5);
            cameraControls.object.lookAt(0, 0, 0);
            cameraControls.target.set(0, 0, 0);
            cameraControls.update();
          } else {
            cameraControls.object.position.set(0, 5, 10);
            cameraControls.object.lookAt(0, 0, 0);
            cameraControls.target.set(0, 0, 0);
            cameraControls.update();
          }
          break;
        case 'k': // k (back)
        case 'K':
        case 'ㅏ':
          if (multiKeyController[event.key]) {
            multiKeyController[event.key].pressed = true;
          }
          if (
            (multiKeyController.v.pressed ||
              multiKeyController.V.pressed ||
              multiKeyController.ㅍ.pressed) &&
            multiKeyController[event.key].pressed
          ) {
            if (
              !_.find(renderingOptions, (item, index) => _.isEqual(item.key, 'sceneYUp'))?.value
            ) {
              cameraControls.object.position.set(0, 10, 5);
              cameraControls.object.lookAt(0, 0, 0);
              cameraControls.target.set(0, 0, 0);
              cameraControls.update();
            } else {
              cameraControls.object.position.set(0, 5, -10);
              cameraControls.object.lookAt(0, 0, 0);
              cameraControls.target.set(0, 0, 0);
              cameraControls.update();
            }
          }
          break;
        default:
          break;
      }
    },
    [renderingOptions, multiKeyController],
  );

  const handleCameraControlsShortcutUp = useCallback(
    ({ event, cameraControls }: { event: KeyboardEvent; cameraControls: any }) => {
      switch (event.key) {
        case 'Alt': // alt
          cameraControls.mouseButtons.MIDDLE = THREE.MOUSE.PAN;
          break;
        case 'Shift':
        case 'Meta':
        case 'Control':
          cameraControls.mouseButtons.MIDDLE = THREE.MOUSE.PAN;
          cameraControls.rotateSpeed = 1;
          break;
        case 'v': // v
        case 'V':
        case 'ㅍ':
          // setIsViewportOpen(false);
          if (multiKeyController[event.key]) {
            multiKeyController[event.key].pressed = false;
          }
          break;
        case 'r':
        case 'R':
        case 'ㄱ':
          if (multiKeyController[event.key]) {
            multiKeyController[event.key].pressed = false;
          }
          break;
        case 'k':
        case 'K':
        case 'ㅏ':
          if (multiKeyController[event.key]) {
            multiKeyController[event.key].pressed = false;
          }
          break;
        default:
          break;
      }
    },
    [multiKeyController],
  );

  const handleHistoryShortcutDown = useCallback(
    ({ event }: { event: KeyboardEvent }) => {
      let info;
      switch (event.key) {
        case 'z':
        case 'Z':
        case 'ㅋ':
          // redo
          if (event.ctrlKey && event.shiftKey) {
            info = popFromRedoArray();
            if (info) {
              const { bone, mode, value } = info;
              if (mode === 'translate') {
                bone.position.set(value.x, value.y, value.z);
              } else if (mode === 'rotate') {
                bone.quaternion.set(value.x, value.y, value.z, value.w);
              } else {
                bone.scale.set(value.x, value.y, value.z);
              }
            }
          }
          // undo
          if (event.ctrlKey && !event.shiftKey) {
            info = popFromUndoArray();
            if (info) {
              const { bone, mode, value } = info;
              if (mode === 'translate') {
                bone.position.set(value.x, value.y, value.z);
              } else if (mode === 'rotate') {
                bone.quaternion.set(value.x, value.y, value.z, value.w);
              } else {
                bone.scale.set(value.x, value.y, value.z);
              }
            }
          }
          break;
        default:
          break;
      }
    },
    [popFromRedoArray, popFromUndoArray],
  );

  const clearRendering = useCallback(
    ({ renderingDiv }: { renderingDiv: any }) => {
      if (renderingDiv) {
        // 기존에 rendering 되어 있는 canvas를 삭제
        while (renderingDiv.firstChild) {
          renderingDiv.removeChild(renderingDiv.firstChild);
        }
      }
      // contents clear
      contents.forEach((content: any) => {
        // scene에서 삭제
        theScene?.remove(content);
        // content 및 하위 노드들이 mesh라면 geometry 및 material dispose
        content.traverse((node: any) => {
          if (!node.isMesh) return;
          node.geometry.dispose();
          const materials: any = Array.isArray(node.material) ? node.material : [node.material];
          materials.forEach((material: any) => {
            MAP_TYPES.forEach((mapType) => {
              material[mapType]?.dispose();
            });
          });
        });
      });
      setContents([]);
      setTheScene(null);
    },
    [contents, theScene],
  );

  const eraseSkinnedMeshes = useCallback(
    ({ skeletonHelper }: { skeletonHelper: THREE.SkeletonHelper }) => {
      const skinnedMeshes = _.filter(
        skeletonHelper.root.children,
        (child) => child.type === 'SkinnedMesh',
      );
      if (_.isEmpty(skinnedMeshes)) {
        _.forEach(skeletonHelper.root.children, (innerChild) => {
          skinnedMeshes.push(...innerChild.children);
        });
      }
      _.forEach(skinnedMeshes, (mesh) => {
        if (_.isEqual(mesh.type, 'SkinnedMesh')) {
          mesh.visible = false;
        }
      });
    },
    [],
  );

  const exportBonesJson = useCallback(
    ({ skeletonHelper }: { skeletonHelper: THREE.SkeletonHelper }) => {
      const { bones } = skeletonHelper;
      const blob = new Blob([JSON.stringify(bones)], { type: 'text/json' });
      const objUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.setAttribute('style', 'display: none;');
      a.setAttribute('href', objUrl);
      a.setAttribute('download', 'bonse.json');
      a.click();
    },
    [],
  );

  const resizeRendererToDisplaySize = ({
    renderer,
    renderingDiv,
  }: {
    renderer: THREE.WebGL1Renderer;
    renderingDiv: HTMLDivElement;
  }) => {
    const canvas = renderer.domElement;
    const needResize =
      canvas.width !== renderingDiv.clientWidth || canvas.height !== renderingDiv.clientHeight;
    if (needResize) {
      renderer.setSize(renderingDiv.clientWidth, renderingDiv.clientHeight);
    }
    return needResize;
  };

  useEffect(() => {
    // rendering할 div요소 선택
    const renderingDiv: any = document.getElementById(id);
    clearRendering({ renderingDiv });

    // scene 생성 및 설정
    const scene: THREE.Scene = createScene();
    setTheScene(scene);

    // camera 생성 및 설정
    const camera = createCamera();

    // renderer 생성 및 설정
    const renderer = createRenderer({ renderingDiv });

    // scene에 조명 추가
    addLights({ scene });

    // scene에 바닥 추가
    const { groundMesh, axesArray } = addGround({ scene, camera, renderer });
    setContents((prevContents) => [...prevContents, groundMesh]);
    _.forEach(axesArray, (axis) => setContents([...contents, axis]));

    // cameraControls 생성 및 설정
    const cameraControls = createCameraControls({ camera, renderer });
    setTheCameraControls(cameraControls);
    // setContents((prevContents) => ([...prevContents, cameraControls]));

    // scene에 transformControls 추가
    const transformControls = createTransformControls({
      scene,
      camera,
      renderer,
      cameraControls,
    });
    setContents((prevContents) => [...prevContents, transformControls]);

    const handleKeyDown = (event: any) => {
      handleTransformControlsShortcutDown({ event, transformControls });
      handleCameraControlsShortcutDown({ event, cameraControls });
      handleHistoryShortcutDown({ event });
    };

    const handleKeyUp = (event: any) => {
      handleTransformControlsShortcutUp({ event, transformControls });
      handleCameraControlsShortcutUp({ event, cameraControls });
    };

    renderingDiv.addEventListener('keydown', handleKeyDown);
    renderingDiv.addEventListener('keyup', handleKeyUp);

    // 파일 업로드를 통해 blobURL이 생성되었다면
    if (fileUrl) {
      let loader;
      // .glb 파일 load
      if (_.isEqual(format, FORMAT_TYPES.glb) || _.isEqual(format, FORMAT_TYPES.gltf)) {
        loader = new GLTFLoader(); // loader 생성
        // .fbx 파일 load
      } else if (_.isEqual(format, FORMAT_TYPES.fbx)) {
        loader = new FBXLoader();
      }
      loader?.load(
        fileUrl,
        (object: any) => {
          // eslint-disable-next-line no-console
          console.log('object: ', object);
          // animation mixer 생성 및 set
          createMixer({ object });
          // animations set
          setAnimations(object.animations);
          // store mainData 업데이트
          // if (!_.isUndefined(fnUpdateMainData) && !_.isEmpty(object.animations)) {
          //   fnUpdateMainData({ animations: _.cloneDeep(object.animations) });
          // }
          // scene에 model 추가
          const model = addModel({ scene, object });
          applyDefaultSkin({ model });
          setContents((prevContents) => [...prevContents, model]);
          // skeleton helper 생성 및 scene에 추가
          const skeletonHelper = addSkeletonHelper({ scene, model });
          // ml 팀 bones 전달용
          // exportBonesJson({ skeletonHelper });
          if (
            !_.find(renderingOptions, (item, index) => _.isEqual(item.key, 'modelMeshPower'))?.value
          ) {
            eraseSkinnedMeshes({ skeletonHelper });
          }
          setContents((prevContents) => [...prevContents, skeletonHelper]);
          if (
            _.find(renderingOptions, (item, index) =>
              _.isEqual(item.key, 'skeletonJointMeshesPower'),
            )?.value
          ) {
            // skeleton bone에 mesh 추가, 현재 리타겟팅 문제로 임시 주석처리
            addJointMeshes({
              skeletonHelper,
              camera,
              renderer,
              cameraControls,
              transformControls,
            });
          }
        },
        () => {},
        (error: any) => {
          // eslint-disable-next-line no-console
          console.log(error);
        },
      );
    }
    // RenderingDiv 아래에 새로운 canvas를 생성하고, scene과 camera를 추가
    renderingDiv.appendChild(renderer.domElement);

    const animate = () => {
      // mixer 에 의해 화면 자체 업데이트
      if (innerMixer) {
        innerMixer.update(clock.getDelta());
      }
      if (resizeRendererToDisplaySize({ renderer, renderingDiv })) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
      }
      // animate loop를 통해 렌더링
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      // 단축키 제거
      renderingDiv.removeEventListener('keydown', handleKeyDown);
      renderingDiv.removeEventListener('keyup', handleKeyUp);

      // clear
      clearRendering({ renderingDiv });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileUrl, renderingOptions]);
  return {
    theCameraControls,
  };
};
