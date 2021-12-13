import { FunctionComponent, useState, memo, Fragment, useEffect, useMemo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import * as BABYLON from '@babylonjs/core';
import { isNull } from 'lodash';
import { useSelector } from 'reducers';
import { FilledButton } from 'components/Button';
import { AnimationRangeInput, AnimationTitleToggle, DropdownWrapper, RetargetMapIndicator } from 'components/ControlPanel';
import { IconWrapper, SvgPath } from 'components/Icon';
import { RetargetSourceBoneType } from 'types/common';
import * as selectingDataActions from 'actions/selectingDataAction';
import * as animationDataActions from 'actions/animationDataAction';
import { checkIsTargetMesh } from 'utils/RP';
import classNames from 'classnames/bind';
import styles from './RetargetTab.module.scss';

const cx = classNames.bind(styles);

interface Props {
  isAllActive: boolean;
}

const RetargetTab: FunctionComponent<Props> = ({ isAllActive }) => {
  const _retargetMaps = useSelector((state) => state.animationData.retargetMaps);
  const _visualizedAssetIds = useSelector((state) => state.plaskProject.visualizedAssetIds);
  const _selectedTargets = useSelector((state) => state.selectingData.selectedTargets);
  const _selectableObjects = useSelector((state) => state.selectingData.selectableObjects);

  const dispatch = useDispatch();

  // mapping setion의 펼침여부
  const [isMappingSectionSpread, setIsMappingSectionSpread] = useState<boolean>(true);
  // 아래 2가지가 선택된 상태에서 assign 버튼을 누르면 retargetMap의 values update
  const [currentSourceBoneName, setCurrentSourceBoneName] = useState<RetargetSourceBoneType>();
  const [currentTargetTransformNode, setCurrentTargetTransformNode] = useState<BABYLON.TransformNode>();
  // hipsSpace 조절하면 retargetMap의 hipSpace update
  const [hipSpace, setHipSpace] = useState<number>(106);
  // mappedBones에 속하는 bone은 파란색 배경색을 입힘
  const [mappedBones, setMappedBones] = useState<string[]>([]);
  // mapping complete badge 상태
  const mappingCompleted = useMemo(() => mappedBones.length === 24, [mappedBones.length]);
  const [canAssign, setCanAssign] = useState(false);
  const multipleBoneSelected = useMemo(() => _selectedTargets.filter((target) => !checkIsTargetMesh(target)).length > 1, [_selectedTargets]);

  // map 완료된 bone set하는 로직
  useEffect(() => {
    const visualizedRetargetMap = _retargetMaps.find((retargetMap) => retargetMap.assetId === _visualizedAssetIds[0]); // 단일 모델
    // visualize된 asset에 해당하는 retargetMap을 찾음
    if (visualizedRetargetMap) {
      // targetTransformNodeId가 null이 아닌 sourceBone의 이름들
      const mappedSourceBoneNames = visualizedRetargetMap.values.filter((value) => !isNull(value.targetTransformNodeId)).map((v) => v.sourceBoneName);
      // mapping이 완료된 bone들을 의미하는 mappedBones로 set
      setMappedBones(mappedSourceBoneNames);

      console.log('mappedSourceBoneNames: ', mappedSourceBoneNames);
    }
  }, [_retargetMaps, _visualizedAssetIds]);

  // currentSourceBoneName, currentTargetTransformNode 모두 있을 경우 Assign 버튼 활성화
  useEffect(() => {
    if (currentSourceBoneName && currentTargetTransformNode) setCanAssign(true);
  }, [currentSourceBoneName, currentTargetTransformNode]);

  // model 변경 or clear 시 dropdown 리샛, assign 버튼 비활성화
  useEffect(() => {
    setCurrentSourceBoneName(undefined);
    setCurrentTargetTransformNode(undefined);
    setCanAssign(false);
  }, [_visualizedAssetIds]);

  // rp 선택에 의한 targetTransformNode 변경
  useEffect(() => {
    // 단일 선택 시에 (cf. 다중 선택 시에는 RT에 영향을 주지 않음)
    if (_selectedTargets.length === 1) {
      // controller가 아니라면
      if (!checkIsTargetMesh(_selectedTargets[0]) && !_selectedTargets[0].name.toLowerCase().includes('armature')) {
        setCurrentTargetTransformNode(_selectedTargets[0]);
      }
    }
  }, [_selectedTargets]);

  // 스켈레톤 icon 위에 circle로 bone들을 찍기위한 데이터
  const sourceBoneList = [
    { left: 92, top: 186, name: 'hips' },
    { left: 92, top: 152, name: 'spine' },
    { left: 92, top: 124, name: 'spine1' },
    { left: 92, top: 96, name: 'spine2' },
    { left: 92, top: 57, name: 'neck' },
    { left: 92, top: 23, name: 'head' },
    { left: 83, top: 72, name: 'leftShoulder' },
    { left: 57, top: 78, name: 'leftArm' },
    { left: 47, top: 130, name: 'leftForeArm' },
    { left: 29, top: 163, name: 'leftHand' },
    { left: 20, top: 181, name: 'leftHandIndex1' },
    { left: 101, top: 72, name: 'rightShoulder' },
    { left: 127, top: 78, name: 'rightArm' },
    { left: 137, top: 130, name: 'rightForeArm' },
    { left: 155, top: 163, name: 'rightHand' },
    { left: 164, top: 181, name: 'rightHandIndex1' },
    { left: 71, top: 201, name: 'leftUpLeg' },
    { left: 69, top: 255, name: 'leftLeg' },
    { left: 66, top: 327, name: 'leftFoot' },
    { left: 63, top: 352, name: 'leftToeBase' },
    { left: 113, top: 201, name: 'rightUpLeg' },
    { left: 115, top: 255, name: 'rightLeg' },
    { left: 118, top: 327, name: 'rightFoot' },
    { left: 121, top: 352, name: 'rightToeBase' },
  ];

  // sourceBone을 선택하기 위한 드랍다운으로 넘길 데이터
  const sourceBoneOptions = sourceBoneList.map((bone) => ({
    text: bone.name,
    handleSelect: () => setCurrentSourceBoneName(bone.name as RetargetSourceBoneType),
  }));

  // targetBone(targetTransformNode)를 선택하기 위한 드랍다운으로 넘길 데이터
  const targetTransformNodeOptions = useMemo(() => {
    const visualizedTransformNodes = _selectableObjects.filter((object) => !checkIsTargetMesh(object) && !object.name.toLowerCase().includes('armature'));

    return visualizedTransformNodes.map((transformNode) => ({
      text: transformNode.name,
      handleSelect: () => {
        // current targetBone(transformNode)으로 선택
        setCurrentTargetTransformNode(transformNode);
        // RP에서 gizmo 부착
        dispatch(selectingDataActions.defaultSingleSelect({ target: transformNode }));
      },
    }));
  }, [_selectableObjects, dispatch]);

  // assign 버튼 클릭
  const handleAssignButtonClick = useCallback(() => {
    // animationData의 retargetMaps에서 assetId가 currentAssetId와 같은 retargetMap 찾은 후
    // 해당 retargetMap의 values 중 sourceBoneName이 currentSourceBoneName인 값의 targetTarnsformNodeId를 currentTargetTransformNode의 id로 업데이트
    if (currentSourceBoneName && currentTargetTransformNode) {
      const currentAssetId = currentTargetTransformNode.id.split('//')[0];
      dispatch(animationDataActions.assignBoneMapping({ assetId: currentAssetId, sourceBoneName: currentSourceBoneName, targetTransformNodeId: currentTargetTransformNode.id }));
      setCanAssign(false);
    }
  }, [currentSourceBoneName, currentTargetTransformNode, dispatch]);

  return (
    <Fragment>
      <section className={cx('mapping-section')}>
        <AnimationTitleToggle text="Mapping" isSpread={isMappingSectionSpread} setIsSpread={setIsMappingSectionSpread} activeStatus={isAllActive} />
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
                onClick={() => setCurrentSourceBoneName(bone.name as RetargetSourceBoneType)}
              >
                <div className={cx('bone', { mapped: mappedBones.includes(bone.name) })}></div>
              </div>
            ))}
          </div>
          {(!isAllActive || _selectedTargets.length >= 2) && <div className={cx('inactive-overlay')}></div>}
        </div>
        <div className={cx('container', { active: isMappingSectionSpread })}>
          <DropdownWrapper className={cx('mapping-dropdown')} title="Source" currentValue={currentSourceBoneName} options={sourceBoneOptions} activeStatus={isAllActive} />
          <DropdownWrapper
            className={cx('mapping-dropdown')}
            title="Target"
            currentValue={currentTargetTransformNode?.name}
            options={targetTransformNodeOptions}
            activeStatus={isAllActive && !multipleBoneSelected}
            inactiveMessage={multipleBoneSelected ? 'Multiple Bones Selected' : undefined}
          />
          <div className={cx('inner-container')}>
            <FilledButton className={cx('mapping-assign-button', { active: canAssign })} onClick={handleAssignButtonClick}>
              Assign
            </FilledButton>
            {!canAssign && <div className={cx('inactive-overlay')}></div>}
          </div>
          <AnimationRangeInput text="Hip space" step={0.01} currentMax={10} currentValue={hipSpace} setCurrentValue={setHipSpace} decimalDigit={1} activeStatus={isAllActive} />
          {(!isAllActive || _selectedTargets.length >= 2) && <div className={cx('inactive-overlay')}></div>}
        </div>
      </section>
    </Fragment>
  );
};

export default memo(RetargetTab);
