import { FunctionComponent, useState, memo, Fragment, useEffect, useMemo, useCallback, useRef, ChangeEvent } from 'react';
import { useDispatch } from 'react-redux';
import { isNull } from 'lodash';

import { useSelector } from 'reducers';
import { FilledButton } from 'components/Button';
import { AnimationRangeInput, AnimationTitleToggle, DropdownWrapper, RetargetMapIndicator } from 'components/ControlPanel';
import { IconWrapper, SvgPath } from 'components/Icon';
import { RetargetSourceBoneType } from 'types/common';
import * as selectingDataActions from 'actions/selectingDataAction';
import * as animationDataActions from 'actions/animationDataAction';
import * as globalUIActions from 'actions/Common/globalUI';
import { RETARGET_TARGET_BONE_NONE } from 'utils/const';
import { checkIsTargetMesh } from 'utils/RP';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  isAllActive: boolean;
}

const RetargetTab: FunctionComponent<Props> = ({ isAllActive }) => {
  const dispatch = useDispatch();

  const isSelectedTargetBoneOption = useRef(false); // targetBone dropdown을 선택했을 경우에만 Assign 버튼이 활성화 되도록 체크

  const _retargetMaps = useSelector((state) => state.animationData.retargetMaps);
  const _visualizedAssetIds = useSelector((state) => state.plaskProject.visualizedAssetIds);
  const _selectedTargets = useSelector((state) => state.selectingData.selectedTargets);
  const _selectableObjects = useSelector((state) => state.selectingData.selectableObjects);

  const [isMappingSectionSpread, setIsMappingSectionSpread] = useState<boolean>(true);
  const [currentSourceBoneName, setCurrentSourceBoneName] = useState<RetargetSourceBoneType>();
  const [currentTargetTransformNode, setCurrentTargetTransformNode] = useState<{ id: string | null; name: string }>(); // none menu는 id가 null
  const [hipSpace, setHipSpace] = useState<number>(106);
  const [mappedBones, setMappedBones] = useState<string[]>([]);
  const [canAssign, setCanAssign] = useState(false);

  const mappingCompleted = useMemo(() => mappedBones.length === 24, [mappedBones.length]);
  const multipleBoneSelected = useMemo(() => _selectedTargets.filter((target) => !checkIsTargetMesh(target)).length > 1, [_selectedTargets]);
  const visualizedRetargetMap = useMemo(() => _retargetMaps.find((retargetMap) => retargetMap.assetId === _visualizedAssetIds[0]), [_retargetMaps, _visualizedAssetIds]); // 단일 모델
  const visualizedTransformNodes = useMemo(() => _selectableObjects.filter((object) => !checkIsTargetMesh(object) && !object.name.toLowerCase().includes('armature')), [
    _selectableObjects,
  ]);

  // 이미 mapping 된 target bone인지 체크
  const checkAlreadyMappedTargetBone = useCallback(
    (sourceBoneName: RetargetSourceBoneType) => {
      const retargetMap = _retargetMaps.find((retaretMap) => retaretMap.assetId === _visualizedAssetIds[0]);
      const sourceBone = retargetMap?.values.find((retargetMapValue) => retargetMapValue.sourceBoneName === sourceBoneName);
      return sourceBone?.targetTransformNodeId || null; // null인 경우 mapping되지 않은 상태
    },
    [_retargetMaps, _visualizedAssetIds],
  );

  // map 완료된 bone set하는 로직
  useEffect(() => {
    if (visualizedRetargetMap) {
      const mappedSourceBoneNames = visualizedRetargetMap.values.filter((value) => !isNull(value.targetTransformNodeId)).map((v) => v.sourceBoneName);
      setMappedBones(mappedSourceBoneNames);
    }
  }, [visualizedRetargetMap]);

  // Assign 버튼 활성화
  useEffect(() => {
    if (currentSourceBoneName && currentTargetTransformNode && isSelectedTargetBoneOption.current) {
      const mappedTargetTransformNodeId = checkAlreadyMappedTargetBone(currentSourceBoneName);
      setCanAssign(() => {
        if (mappedTargetTransformNodeId === RETARGET_TARGET_BONE_NONE && !currentTargetTransformNode.id) return false; // none과 mapping 되어 있는데, target bone dropdown에서 none 선택
        if (mappedTargetTransformNodeId !== currentTargetTransformNode.id) return true; // 선택한 boneTarget dropdown과 이미 mapping 된 boneTarget이 다른 경우
        if (currentSourceBoneName && currentTargetTransformNode.name === RETARGET_TARGET_BONE_NONE) return true; // sourceTarget을 선택했고, boneTarget에서는 none을 선택
        return false;
      });
    } else {
      setCanAssign(false); // Assign 버튼 클릭 / viewport에서 빈 영역 클릭 시, Assign 버튼 비활성화
    }
  }, [currentSourceBoneName, currentTargetTransformNode, checkAlreadyMappedTargetBone]);

  // model 변경 or clear 시, dropdown 리셋/assign 버튼 비활성화
  useEffect(() => {
    setCurrentSourceBoneName(undefined);
    setCurrentTargetTransformNode(undefined);
    setCanAssign(false);
    setHipSpace(106);
  }, [_visualizedAssetIds]);

  // rp 선택에 의한 targetTransformNode 변경
  useEffect(() => {
    if (_selectedTargets.length === 1) {
      if (!checkIsTargetMesh(_selectedTargets[0]) && !_selectedTargets[0].name.toLowerCase().includes('armature')) {
        setCurrentTargetTransformNode({ id: _selectedTargets[0].id, name: _selectedTargets[0].name });
        isSelectedTargetBoneOption.current = true;
      }
    } else if (_selectedTargets.length === 0) {
      setCurrentTargetTransformNode((prevState) => {
        if (prevState?.name === RETARGET_TARGET_BONE_NONE) return prevState; // none 메뉴인 경우 state 유지
        return undefined;
      });
    }
  }, [_selectedTargets]);

  // 스켈레톤 icon 위에 circle로 bone들을 찍기위한 데이터
  const sourceBoneList: { left: number; top: number; name: RetargetSourceBoneType }[] = [
    { left: 92, top: 186, name: 'hips' },
    { left: 92, top: 152, name: 'spine' },
    { left: 92, top: 124, name: 'spine1' },
    { left: 92, top: 96, name: 'spine2' },
    { left: 92, top: 57, name: 'neck' },
    { left: 92, top: 23, name: 'head' },
    { left: 101, top: 72, name: 'leftShoulder' },
    { left: 127, top: 78, name: 'leftArm' },
    { left: 137, top: 130, name: 'leftForeArm' },
    { left: 155, top: 163, name: 'leftHand' },
    { left: 164, top: 181, name: 'leftHandIndex1' },
    { left: 83, top: 72, name: 'rightShoulder' },
    { left: 57, top: 78, name: 'rightArm' },
    { left: 47, top: 130, name: 'rightForeArm' },
    { left: 29, top: 163, name: 'rightHand' },
    { left: 20, top: 181, name: 'rightHandIndex1' },
    { left: 113, top: 201, name: 'leftUpLeg' },
    { left: 115, top: 255, name: 'leftLeg' },
    { left: 118, top: 327, name: 'leftFoot' },
    { left: 121, top: 352, name: 'leftToeBase' },
    { left: 71, top: 201, name: 'rightUpLeg' },
    { left: 69, top: 255, name: 'rightLeg' },
    { left: 66, top: 327, name: 'rightFoot' },
    { left: 63, top: 352, name: 'rightToeBase' },
  ];

  // source bone pointer/dropdown 클릭 시 active 효과 적용
  // source bone과 mapping 된 target bone에도 active 효과 적용
  const selectSourceBone = (sourceBoneName: RetargetSourceBoneType) => {
    const mappedTargetTransformNodeId = checkAlreadyMappedTargetBone(sourceBoneName);
    if (mappedTargetTransformNodeId === RETARGET_TARGET_BONE_NONE) {
      setCurrentTargetTransformNode({ id: null, name: RETARGET_TARGET_BONE_NONE });
      dispatch(selectingDataActions.resetSelectedTargets());
    } else if (mappedTargetTransformNodeId !== null) {
      const transformNode = visualizedTransformNodes.find((visualizedTransformNode) => visualizedTransformNode.id === mappedTargetTransformNodeId);
      if (transformNode) {
        setCurrentTargetTransformNode({ id: transformNode.id, name: transformNode.name });
        dispatch(selectingDataActions.defaultSingleSelect({ target: transformNode }));
      }
    }
    setCurrentSourceBoneName(sourceBoneName);
    isSelectedTargetBoneOption.current = false;
  };

  // sourceBone을 선택하기 위한 드랍다운으로 넘길 데이터
  const sourceBoneOptions = sourceBoneList.map((bone) => ({
    text: bone.name,
    handleSelect: () => selectSourceBone(bone.name),
  }));

  // targetBone(targetTransformNode)를 선택하기 위한 드랍다운으로 넘길 데이터
  const targetTransformNodeOptions = useMemo(() => {
    const noneMenu = {
      text: RETARGET_TARGET_BONE_NONE,
      handleSelect: () => {
        setCurrentTargetTransformNode({ id: null, name: RETARGET_TARGET_BONE_NONE });
        dispatch(selectingDataActions.resetSelectedTargets());
        isSelectedTargetBoneOption.current = true;
      },
    };
    const transformNodeMenu = visualizedTransformNodes.map((transformNode) => ({
      text: transformNode.name,
      handleSelect: () => {
        dispatch(selectingDataActions.defaultSingleSelect({ target: transformNode }));
        isSelectedTargetBoneOption.current = true;
      },
    }));
    return [noneMenu, ...transformNodeMenu];
  }, [dispatch, visualizedTransformNodes]);

  // source target - bone target 매핑 전달
  const dispatchBoneMapping = useCallback(() => {
    if (currentSourceBoneName && currentTargetTransformNode && visualizedRetargetMap) {
      isSelectedTargetBoneOption.current = false;
      dispatch(
        animationDataActions.assignBoneMapping({
          assetId: visualizedRetargetMap.assetId,
          sourceBoneName: currentSourceBoneName,
          targetTransformNodeId: currentTargetTransformNode.id || RETARGET_TARGET_BONE_NONE,
        }),
      );
    }
  }, [currentSourceBoneName, currentTargetTransformNode, visualizedRetargetMap, dispatch]);

  // Assign 버튼 클릭
  const handleAssignButtonClick = useCallback(() => {
    if (currentSourceBoneName && currentTargetTransformNode) {
      const mappedTargetTransformNodeId = checkAlreadyMappedTargetBone(currentSourceBoneName);
      if (currentTargetTransformNode.name !== RETARGET_TARGET_BONE_NONE && mappedTargetTransformNodeId !== null && mappedTargetTransformNodeId !== RETARGET_TARGET_BONE_NONE) {
        dispatch(
          globalUIActions.openModal('ConfirmModal', {
            title: 'Change Mapping',
            message: 'Are you sure you want to change an existing mapping?',
            confirmText: 'Change',
            onConfirm: () => {
              dispatchBoneMapping();
            },
            cancelText: 'Cancel',
          }),
        );
      } else {
        dispatchBoneMapping();
      }
    }
  }, [currentSourceBoneName, currentTargetTransformNode, checkAlreadyMappedTargetBone, dispatch, dispatchBoneMapping]);

  // 조절 된 hip space값 전달
  const dispatchChangedHipSpace = useCallback(
    (hipSpaece: number) => {
      if (visualizedRetargetMap) {
        dispatch(animationDataActions.changeHipSpace({ assetId: visualizedRetargetMap.assetId, hipSpaece }));
      }
    },
    [visualizedRetargetMap, dispatch],
  );

  const handleSpreadMapping = useCallback(() => {
    if (isMappingSectionSpread) {
      setIsMappingSectionSpread(false);
    } else {
      setIsMappingSectionSpread(true);
    }
  }, [isMappingSectionSpread]);

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setHipSpace(parseFloat(event.target.value));
  }, []);

  return (
    <Fragment>
      <section className={cx('mapping-section')}>
        <AnimationTitleToggle text="Mapping" isSpread={isMappingSectionSpread} handleSpread={handleSpreadMapping} activeStatus={isAllActive} />
        {isAllActive && <RetargetMapIndicator isMapped={mappingCompleted} />}
        <div className={cx('container', 'mapping-icon', { active: isMappingSectionSpread })}>
          <div className={cx('skeleton-wrapper')}>
            <IconWrapper icon={SvgPath.Body} className={cx('skeleton')} />
          </div>
          <div className={cx('bones-wrapper')}>
            {sourceBoneList.map((bone, idx) => (
              <div
                key={idx}
                className={cx({ selected: bone.name === currentSourceBoneName })}
                id={bone.name}
                style={{ left: bone.left, top: bone.top }}
                onClick={() => selectSourceBone(bone.name)}
              >
                <div className={cx('bone', { mapped: mappedBones.includes(bone.name) })}></div>
              </div>
            ))}
          </div>
          {(!isAllActive || _selectedTargets.length >= 2) && <div className={cx('inactive-overlay')}></div>}
        </div>
        <div className={cx('container', { active: isMappingSectionSpread })}>
          <DropdownWrapper
            className={cx('mapping-dropdown')}
            title="Source"
            currentValue={currentSourceBoneName}
            options={sourceBoneOptions}
            activeStatus={isAllActive}
            inactiveMessage="Select Option"
          />
          <DropdownWrapper
            className={cx('mapping-dropdown')}
            title="Target"
            currentValue={currentTargetTransformNode?.name}
            options={targetTransformNodeOptions}
            activeStatus={isAllActive && !multipleBoneSelected}
            inactiveMessage={multipleBoneSelected ? 'Multiple Bones Selected' : 'Select Option'}
          />
          <div className={cx('inner-container')}>
            <FilledButton className={cx('mapping-assign-button', { active: canAssign })} onClick={handleAssignButtonClick}>
              Assign
            </FilledButton>
            {!canAssign && <div className={cx('inactive-overlay')}></div>}
          </div>
          <AnimationRangeInput
            text="Hip space"
            step={0.01}
            currentMax={10}
            currentValue={hipSpace}
            decimalDigit={1}
            activeStatus={isAllActive}
            onChangeEnd={dispatchChangedHipSpace}
            handleChange={handleChange}
            limitMax={1000}
          />
          {(!isAllActive || _selectedTargets.length >= 2) && <div className={cx('inactive-overlay')}></div>}
        </div>
      </section>
    </Fragment>
  );
};

export default memo(RetargetTab);
