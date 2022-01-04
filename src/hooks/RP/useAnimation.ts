import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import * as BABYLON from '@babylonjs/core';
import { useSelector } from 'reducers';
import { filterQuaternion, filterVector, getTotalTransformKeys } from 'utils/RP';
import * as animatingControlsActions from 'actions/animatingControlsAction';

const useAnimation = () => {
  const dispatch = useDispatch();

  const _screenList = useSelector((state) => state.plaskProject.screenList);
  const _visualizedAssetIds = useSelector((state) => state.plaskProject.visualizedAssetIds);
  const _fps = useSelector((state) => state.plaskProject.fps);

  const _animationIngredients = useSelector((state) => state.animationData.animationIngredients);

  const _startTimeIndex = useSelector((state) => state.animatingControls.startTimeIndex);
  const _endTimeIndex = useSelector((state) => state.animatingControls.endTimeIndex);

  // 키프레임 수정이 정상적으로 적용되는지 확인하는 코드
  // useEffect(() => {
  //   console.log('_animationIngredients: ', _animationIngredients);
  // }, [_animationIngredients]);

  // scene에 animationGroup이 누적되어 추가되는지 확인하는 코드
  // useEffect(() => {
  //   _screenList.forEach(({ scene }) => {
  //     console.log('scene.animationGroups: ', scene.animationGroups);
  //   });
  // }, [_screenList, currentAnimationGroup]);

  // 애니메이션 생성
  useEffect(() => {
    const visualizedAnimationIngredients = _animationIngredients.filter(
      (animationIngredient) => _visualizedAssetIds.includes(animationIngredient.assetId) && animationIngredient.current,
    );

    if (visualizedAnimationIngredients.length > 0) {
      _screenList.forEach(({ scene }) => {
        scene.animationGroups.forEach((animationGroup) => {
          scene.removeAnimationGroup(animationGroup);
        });
      });

      const newAnimationGroup = new BABYLON.AnimationGroup(visualizedAnimationIngredients.length === 1 ? visualizedAnimationIngredients[0].name : 'totalAnimationGroup');

      visualizedAnimationIngredients.forEach((animationIngredient) => {
        // layer 고려가 들어가야 함
        // 각 layer의 transformKeys 합해주는 연산 필요
        const { id, name, assetId, tracks, layers } = animationIngredient;

        const transformKeysListForTargetId: {
          [id in string]: {
            target: BABYLON.Mesh | BABYLON.TransformNode;
            positionTransformKeysList: Array<BABYLON.IAnimationKey[]>;
            rotationQuaternionTransformKeysList: Array<BABYLON.IAnimationKey[]>;
            scalingTransformKeysList: Array<BABYLON.IAnimationKey[]>;
          };
        } = {};

        tracks.forEach((track) => {
          // 비어있는 트랙은 애니메이션 그룹 생성 시 사용하지 않음
          if (track.transformKeys.length > 0) {
            if (track.property !== 'rotation') {
              // rotation track은 단순히 TP내 렌더링 역할만을 하며, 애니메이션 생성 시에는 rotationQuaternion track을 사용
              if (track.isIncluded) {
                if (track.property === 'position') {
                  if (transformKeysListForTargetId[track.targetId]) {
                    transformKeysListForTargetId[track.targetId].positionTransformKeysList.push(
                      track.useFilter ? filterVector(track.transformKeys, track.filterMinCutoff, track.filterBeta) : track.transformKeys,
                    );
                  } else {
                    transformKeysListForTargetId[track.targetId] = {
                      target: track.target,
                      positionTransformKeysList: [track.useFilter ? filterVector(track.transformKeys, track.filterMinCutoff, track.filterBeta) : track.transformKeys],
                      rotationQuaternionTransformKeysList: [],
                      scalingTransformKeysList: [],
                    };
                  }
                } else if (track.property === 'rotationQuaternion') {
                  if (transformKeysListForTargetId[track.targetId]) {
                    transformKeysListForTargetId[track.targetId].rotationQuaternionTransformKeysList.push(
                      track.useFilter ? filterQuaternion(track.transformKeys, track.filterMinCutoff, track.filterBeta) : track.transformKeys,
                    );
                  } else {
                    transformKeysListForTargetId[track.targetId] = {
                      target: track.target,
                      positionTransformKeysList: [],
                      rotationQuaternionTransformKeysList: [track.useFilter ? filterQuaternion(track.transformKeys, track.filterMinCutoff, track.filterBeta) : track.transformKeys],
                      scalingTransformKeysList: [],
                    };
                  }
                } else if (track.property === 'scaling') {
                  if (transformKeysListForTargetId[track.targetId]) {
                    transformKeysListForTargetId[track.targetId].scalingTransformKeysList.push(
                      track.useFilter ? filterVector(track.transformKeys, track.filterMinCutoff, track.filterBeta) : track.transformKeys,
                    );
                  } else {
                    transformKeysListForTargetId[track.targetId] = {
                      target: track.target,
                      positionTransformKeysList: [],
                      rotationQuaternionTransformKeysList: [],
                      scalingTransformKeysList: [track.useFilter ? filterVector(track.transformKeys, track.filterMinCutoff, track.filterBeta) : track.transformKeys],
                    };
                  }
                }
              }
            }
          }
        });

        Object.entries(transformKeysListForTargetId).forEach(([targetId, { target, positionTransformKeysList, rotationQuaternionTransformKeysList, scalingTransformKeysList }]) => {
          const positionTotalTransformKeys = getTotalTransformKeys(positionTransformKeysList, false);
          const rotationQuaternionTotalTransformKeys = getTotalTransformKeys(rotationQuaternionTransformKeysList, true);
          const scalingTotalTransformKeys = getTotalTransformKeys(scalingTransformKeysList, false);

          const newPositionAnimation = new BABYLON.Animation(
            `${target.name}|position`,
            'position',
            _fps,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE,
          );
          newPositionAnimation.setKeys(positionTotalTransformKeys);

          const newRotationQuaternionAnimation = new BABYLON.Animation(
            `${target.name}|rotationQuaternion`,
            'rotationQuaternion',
            _fps,
            BABYLON.Animation.ANIMATIONTYPE_QUATERNION,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE,
          );
          newRotationQuaternionAnimation.setKeys(rotationQuaternionTotalTransformKeys);

          const newScalingAnimation = new BABYLON.Animation(
            `${target.name}|scaling`,
            'scaling',
            _fps,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE,
          );
          newScalingAnimation.setKeys(scalingTotalTransformKeys);

          newAnimationGroup.addTargetedAnimation(newPositionAnimation, target);
          newAnimationGroup.addTargetedAnimation(newRotationQuaternionAnimation, target);
          newAnimationGroup.addTargetedAnimation(newScalingAnimation, target);
        });
      });

      newAnimationGroup.normalize(_startTimeIndex, _endTimeIndex);
      dispatch(animatingControlsActions.setCurrentAnimationGroup({ animationGroup: newAnimationGroup }));
    }
  }, [_animationIngredients, _endTimeIndex, _fps, _screenList, _startTimeIndex, _visualizedAssetIds, dispatch]);
};

export default useAnimation;
