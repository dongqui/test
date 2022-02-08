import { ChangeEvent, Dispatch, FocusEvent, Fragment, FunctionComponent, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import * as BABYLON from '@babylonjs/core';
import { isNull, isUndefined } from 'lodash';
import { useDispatch } from 'react-redux';

import AnimationInputWrapper from './AnimationInputWrapper';
import * as animationDataActions from 'actions/animationDataAction';
import { AnimationTitleToggle, AnimationRangeInput } from 'components/ControlPanel';
import { Nullable, PlaskRotationType, PlaskTrack } from 'types/common';
import { useSelector } from 'reducers';
import { convertToDegree, convertToRadian, forceClickAnimationPauseAndPlay } from 'utils/common';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  isAllActive: boolean;
}

const AnimationTab: FunctionComponent<Props> = ({ isAllActive }) => {
  const _visualizedAssetIds = useSelector((state) => state.plaskProject.visualizedAssetIds);
  const _selectableObjects = useSelector((state) => state.selectingData.selectableObjects);
  const _selectedTargets = useSelector((state) => state.selectingData.selectedTargets);
  const _seletedLayer = useSelector((state) => state.trackList.selectedLayer); // selectedLayerId에 해당
  const _animationIngredients = useSelector((state) => state.animationData.animationIngredients);
  const _playState = useSelector((state) => state.animatingControls.playState);
  const _playDirection = useSelector((state) => state.animatingControls.playDirection);

  const dispatch = useDispatch();

  // 다중모델 설계 내에서 단일모델 상황을 가정하기 위함 (추후 다중모델 설계 자체를 단일모델 설계로 변경할 계획)
  const selectedAssetId = useMemo(() => _visualizedAssetIds[0], [_visualizedAssetIds]);

  const [controlTarget, setControlTarget] = useState<Nullable<BABYLON.TransformNode | BABYLON.Mesh>>(null);
  const [controlTrack, setControlTrack] = useState<Nullable<PlaskTrack>>(null);

  // position value를 관리하는 useState
  const [positionX, setPositionX] = useState<number>(0);
  const [positionY, setPositionY] = useState<number>(0);
  const [positionZ, setPositionZ] = useState<number>(0);

  // euler value를 관리하는 useState
  const [eulerX, setEulerX] = useState<number>(0);
  const [eulerY, setEulerY] = useState<number>(0);
  const [eulerZ, setEulerZ] = useState<number>(0);

  // quarternion value를 관리하는 useState
  const [quarternionW, setQuarternionW] = useState<number>(1);
  const [quarternionX, setQuarternionX] = useState<number>(0);
  const [quarternionY, setQuarternionY] = useState<number>(0);
  const [quarternionZ, setQuarternionZ] = useState<number>(0);

  // sclae value를 관리하는 useState
  const [scaleX, setScaleX] = useState<number>(0);
  const [scaleY, setScaleY] = useState<number>(0);
  const [scaleZ, setScaleZ] = useState<number>(0);

  // section spread status
  const [isTransformSectionSpread, setIsTransformSectionSpread] = useState<boolean>(true);
  const [isFilterSectionSpread, setIsFilterSectionSpread] = useState<boolean>(true);

  // transform section
  const [currentRotationType, setCurrentRotationType] = useState<PlaskRotationType>('euler');

  // filter section
  const [isFilterOn, setIsFilterOn] = useState<boolean>(false);
  const [fcValue, setFcValue] = useState<number>(10);
  const [betaValue, setBetaValue] = useState<number>(1);

  // transform section을 위한 control target 선택
  useEffect(() => {
    if (_selectedTargets.length === 0) {
      // 선택되지 않은 경우
      setControlTarget(null);
    } else if (_selectedTargets.length === 1) {
      // 단일대상 선택된 경우
      setControlTarget(_selectedTargets[0]);
    } else {
      // 다중대상 선택된 경우
      setControlTarget(null);
    }
  }, [_selectableObjects, _selectedTargets]);

  // filter section을 위한 control track 선택
  useEffect(() => {
    if (_selectedTargets.length === 0) {
      setControlTrack(null);
    } else if (_selectedTargets.length === 1) {
      const targetAssetId = _selectedTargets[0].id.split('//')[0];
      const targetAnimationIngredient = _animationIngredients.find((animationIngredient) => animationIngredient.assetId === targetAssetId);
      const targetLayer = targetAnimationIngredient?.layers.find((layer) => layer.id === _seletedLayer);
      const targetTrack = targetLayer?.tracks.find((track) => track.targetId === _selectedTargets[0].id)!;

      setControlTrack(targetTrack);
    } else {
      setControlTrack(null);
    }
  }, [_animationIngredients, _selectedTargets, _seletedLayer]);

  // transform section 변경
  useEffect(() => {
    if (controlTarget) {
      const matrixUpdateObservable = controlTarget.onAfterWorldMatrixUpdateObservable.add((target) => {
        const { position, rotationQuaternion, scaling } = target;
        setPositionX(position.x);
        setPositionY(position.y);
        setPositionZ(position.z);

        const e = rotationQuaternion!.clone().toEulerAngles();
        setEulerX(convertToDegree(e.x));
        setEulerY(convertToDegree(e.y));
        setEulerZ(convertToDegree(e.z));

        setQuarternionW(rotationQuaternion!.w);
        setQuarternionX(rotationQuaternion!.x);
        setQuarternionY(rotationQuaternion!.y);
        setQuarternionZ(rotationQuaternion!.z);

        setScaleX(scaling.x);
        setScaleY(scaling.y);
        setScaleZ(scaling.z);
      });

      return () => {
        controlTarget.onAfterWorldMatrixUpdateObservable.remove(matrixUpdateObservable);
      };
    }
  }, [controlTarget]);

  // 선택 대상에 따라 filter toggle 변경
  useEffect(() => {
    if (selectedAssetId) {
      const targetAnimationIngredient = _animationIngredients.find((animationIngredient) => animationIngredient.assetId === selectedAssetId && animationIngredient.current);
      const targetLayer = targetAnimationIngredient?.layers.find((layer) => layer.id === _seletedLayer);

      if (targetLayer) {
        const hasFilteredTrack = Boolean(targetLayer.tracks.find((track) => track.useFilter));
        if (hasFilteredTrack) {
          setIsFilterOn(true);
        } else {
          setIsFilterOn(false);
        }
      } else {
        setIsFilterOn(false);
      }
    } else {
      setIsFilterOn(false);
    }
  }, [_animationIngredients, _seletedLayer, selectedAssetId]);

  // 선택 대상에 따라 filter parameters 변경
  useEffect(() => {
    if (controlTrack && controlTrack.useFilter) {
      setFcValue(controlTrack.filterMinCutoff);
      setBetaValue(controlTrack.filterBeta);
    } else {
      setFcValue(10);
      setBetaValue(1);
    }
  }, [controlTrack]);

  // Transform section을 펼치거나 접을 수 있는 콜백
  const handleSpreadTransform = useCallback(() => {
    if (isTransformSectionSpread) {
      setIsTransformSectionSpread(false);
    } else {
      setIsTransformSectionSpread(true);
    }
  }, [isTransformSectionSpread]);

  // Filter section읅 펼치거나 접을 수 있는 콜백
  const handleSpreadFilter = useCallback(() => {
    if (isFilterSectionSpread) {
      setIsFilterSectionSpread(false);
    } else {
      setIsFilterSectionSpread(true);
    }
  }, [isFilterSectionSpread]);

  // Filter의 활성화 비활성화
  const handleFilterToggle = useCallback(() => {
    if (selectedAssetId) {
      if (isFilterOn) {
        setIsFilterOn(false);
        // useFilter to false
        const targetAnimationIngredient = _animationIngredients.find((animationIngredient) => animationIngredient.assetId === selectedAssetId && animationIngredient.current);
        if (targetAnimationIngredient) {
          dispatch(animationDataActions.turnFilterOff({ animationIngredientId: targetAnimationIngredient.id, layerId: _seletedLayer }));
          forceClickAnimationPauseAndPlay(_playState, _playDirection);
        }
      } else {
        setIsFilterOn(true);
        // useFilter to true
        const targetAnimationIngredient = _animationIngredients.find((animationIngredient) => animationIngredient.assetId === selectedAssetId && animationIngredient.current);
        if (targetAnimationIngredient) {
          dispatch(animationDataActions.turnFilterOn({ animationIngredientId: targetAnimationIngredient.id, layerId: _seletedLayer }));
          forceClickAnimationPauseAndPlay(_playState, _playDirection);
        }
      }
    }
  }, [_animationIngredients, _playDirection, _playState, _seletedLayer, dispatch, isFilterOn, selectedAssetId]);

  const positionInputData = [
    {
      text: 'X',
      handleBlur: useCallback(
        (event: FocusEvent<HTMLInputElement>) => {
          if (isNaN(parseFloat(event.target.value))) {
            return;
          }

          if (controlTarget) {
            setPositionX(parseFloat(event.target.value));
            controlTarget.position.x = parseFloat(event.target.value);
          }
        },
        [controlTarget],
      ),
      defaultValue: useMemo(() => (controlTarget ? controlTarget.position.x : 0), [controlTarget]),
      decimalDigit: 4,
      currentValue: positionX,
    },
    {
      text: 'Y',
      handleBlur: useCallback(
        (event: FocusEvent<HTMLInputElement>) => {
          if (isNaN(parseFloat(event.target.value))) {
            return;
          }

          if (controlTarget) {
            setPositionY(parseFloat(event.target.value));
            controlTarget.position.y = parseFloat(event.target.value);
          }
        },
        [controlTarget],
      ),
      defaultValue: useMemo(() => (controlTarget ? controlTarget.position.y : 0), [controlTarget]),
      decimalDigit: 4,
      currentValue: positionY,
    },
    {
      text: 'Z',
      handleBlur: useCallback(
        (event: FocusEvent<HTMLInputElement>) => {
          if (isNaN(parseFloat(event.target.value))) {
            return;
          }

          if (controlTarget) {
            setPositionZ(parseFloat(event.target.value));
            controlTarget.position.z = parseFloat(event.target.value);
          }
        },
        [controlTarget],
      ),
      defaultValue: useMemo(() => (controlTarget ? controlTarget.position.z : 0), [controlTarget]),
      decimalDigit: 4,
      currentValue: positionZ,
    },
  ];

  const eulerInputData = [
    {
      text: 'X',
      handleBlur: useCallback(
        (event: FocusEvent<HTMLInputElement>) => {
          if (isNaN(parseFloat(event.target.value))) {
            return;
          }

          if (controlTarget) {
            const prevE = controlTarget.rotationQuaternion!.clone().toEulerAngles();
            const e = prevE.clone();
            e.x = convertToRadian(parseFloat(event.target.value));
            const q = e.toQuaternion();

            setEulerX(parseFloat(event.target.value));
            controlTarget.rotationQuaternion = q;
          }
        },
        [controlTarget],
      ),
      defaultValue: useMemo(() => {
        if (controlTarget) {
          const q = controlTarget.rotationQuaternion!.clone();
          return convertToDegree(q.toEulerAngles().x);
        } else {
          return 0;
        }
      }, [controlTarget]),
      decimalDigit: 4,
      currentValue: eulerX,
    },
    {
      text: 'Y',
      handleBlur: useCallback(
        (event: FocusEvent<HTMLInputElement>) => {
          if (isNaN(parseFloat(event.target.value))) {
            return;
          }

          if (controlTarget) {
            const prevE = controlTarget.rotationQuaternion!.clone().toEulerAngles();
            const e = prevE.clone();
            e.y = convertToRadian(parseFloat(event.target.value));
            const q = e.toQuaternion();

            setEulerY(parseFloat(event.target.value));
            controlTarget.rotationQuaternion = q;
          }
        },
        [controlTarget],
      ),
      defaultValue: useMemo(() => {
        if (controlTarget) {
          const q = controlTarget.rotationQuaternion!.clone();
          return convertToDegree(q.toEulerAngles().y);
        } else {
          return 0;
        }
      }, [controlTarget]),
      decimalDigit: 4,
      currentValue: eulerY,
    },
    {
      text: 'Z',
      handleBlur: useCallback(
        (event: FocusEvent<HTMLInputElement>) => {
          if (isNaN(parseFloat(event.target.value))) {
            return;
          }

          if (controlTarget) {
            const prevE = controlTarget.rotationQuaternion!.clone().toEulerAngles();
            const e = prevE.clone();
            e.z = convertToRadian(parseFloat(event.target.value));
            const q = e.toQuaternion();

            setEulerZ(parseFloat(event.target.value));
            controlTarget.rotationQuaternion = q;
          }
        },
        [controlTarget],
      ),
      defaultValue: useMemo(() => {
        if (controlTarget) {
          const q = controlTarget.rotationQuaternion!.clone();
          return convertToDegree(q.toEulerAngles().z);
        } else {
          return 0;
        }
      }, [controlTarget]),
      decimalDigit: 4,
      currentValue: eulerZ,
    },
  ];

  const quaternionInputData = [
    {
      text: 'W',
      handleBlur: useCallback(
        (event: FocusEvent<HTMLInputElement>) => {
          if (isNaN(parseFloat(event.target.value))) {
            return;
          }

          if (controlTarget) {
            setQuarternionW(parseFloat(event.target.value));
            controlTarget.rotationQuaternion!.w = parseFloat(event.target.value);
          }
        },
        [controlTarget],
      ),
      defaultValue: useMemo(() => (controlTarget ? controlTarget.rotationQuaternion!.w : 1), [controlTarget]),
      decimalDigit: 4,
      currentValue: quarternionW,
    },
    {
      text: 'X',
      handleBlur: useCallback(
        (event: FocusEvent<HTMLInputElement>) => {
          if (isNaN(parseFloat(event.target.value))) {
            return;
          }

          if (controlTarget) {
            setQuarternionX(parseFloat(event.target.value));
            controlTarget.rotationQuaternion!.x = parseFloat(event.target.value);
          }
        },
        [controlTarget],
      ),
      defaultValue: useMemo(() => (controlTarget ? controlTarget.rotationQuaternion!.x : 0), [controlTarget]),
      decimalDigit: 4,
      currentValue: quarternionX,
    },
    {
      text: 'Y',
      handleBlur: useCallback(
        (event: FocusEvent<HTMLInputElement>) => {
          if (isNaN(parseFloat(event.target.value))) {
            return;
          }

          if (controlTarget) {
            setQuarternionY(parseFloat(event.target.value));
            controlTarget.rotationQuaternion!.y = parseFloat(event.target.value);
          }
        },
        [controlTarget],
      ),
      defaultValue: useMemo(() => (controlTarget ? controlTarget.rotationQuaternion!.y : 0), [controlTarget]),
      decimalDigit: 4,
      currentValue: quarternionY,
    },
    {
      text: 'Z',
      handleBlur: useCallback(
        (event: FocusEvent<HTMLInputElement>) => {
          if (isNaN(parseFloat(event.target.value))) {
            return;
          }

          if (controlTarget) {
            setQuarternionZ(parseFloat(event.target.value));
            controlTarget.rotationQuaternion!.z = parseFloat(event.target.value);
          }
        },
        [controlTarget],
      ),
      defaultValue: useMemo(() => (controlTarget ? controlTarget.rotationQuaternion!.z : 0), [controlTarget]),
      decimalDigit: 4,
      currnetValue: quarternionZ,
    },
  ];

  const scaleInputData = [
    {
      text: 'X',
      handleBlur: useCallback(
        (event: FocusEvent<HTMLInputElement>) => {
          if (isNaN(parseFloat(event.target.value))) {
            return;
          }

          if (controlTarget) {
            setScaleX(parseFloat(event.target.value));
            controlTarget.scaling.x = parseFloat(event.target.value);
          }
        },
        [controlTarget],
      ),
      defaultValue: useMemo(() => (controlTarget ? controlTarget.scaling.x : 0), [controlTarget]),
      decimalDigit: 4,
      currentValue: scaleX,
    },
    {
      text: 'Y',
      handleBlur: useCallback(
        (event: FocusEvent<HTMLInputElement>) => {
          if (isNaN(parseFloat(event.target.value))) {
            return;
          }

          if (controlTarget) {
            setScaleY(parseFloat(event.target.value));
            controlTarget.scaling.y = parseFloat(event.target.value);
          }
        },
        [controlTarget],
      ),
      defaultValue: useMemo(() => (controlTarget ? controlTarget.scaling.x : 0), [controlTarget]),
      decimalDigit: 4,
      currentValue: scaleY,
    },
    {
      text: 'Z',
      handleBlur: useCallback(
        (event: FocusEvent<HTMLInputElement>) => {
          if (isNaN(parseFloat(event.target.value))) {
            return;
          }

          if (controlTarget) {
            setScaleZ(parseFloat(event.target.value));
            controlTarget.scaling.z = parseFloat(event.target.value);
          }
        },
        [controlTarget],
      ),
      defaultValue: useMemo(() => (controlTarget ? controlTarget.scaling.x : 0), [controlTarget]),
      decimalDigit: 4,
      currentValue: scaleZ,
    },
  ];

  const filterRangeData = [
    {
      text: 'Fcmin',
      step: 0.01,
      currentMax: 10,
      currentValue: fcValue,
      setCurrentValue: setFcValue,
      decimalDigit: 2,
      handleChange: (event: ChangeEvent<HTMLInputElement>) => {
        setFcValue(parseFloat(event.target.value));
      },
      onChangeEnd: useCallback(
        (inputValue: number) => {
          if (controlTrack) {
            dispatch(animationDataActions.changeTrackFilterMinCutoff({ layerId: _seletedLayer, trackId: controlTrack.id, value: inputValue }));
            // 새로운 animationGroup을 사용하기 위해, 일시정지 후 재생
            forceClickAnimationPauseAndPlay(_playState, _playDirection);
          }
        },
        [_playDirection, _playState, _seletedLayer, controlTrack, dispatch],
      ),
    },
    {
      text: 'Beta',
      step: 0.001,
      currentMax: 1,
      currentValue: betaValue,
      setCurrentValue: setBetaValue,
      decimalDigit: 3,
      handleChange: (event: ChangeEvent<HTMLInputElement>) => {
        setBetaValue(parseFloat(event.target.value));
      },
      onChangeEnd: useCallback(
        (inputValue: number) => {
          if (controlTrack) {
            dispatch(animationDataActions.changeTrackFilterBeta({ layerId: _seletedLayer, trackId: controlTrack.id, value: inputValue }));
            // 새로운 animationGroup을 사용하기 위해, 일시정지 후 재생
            forceClickAnimationPauseAndPlay(_playState, _playDirection);
          }
        },
        [_playDirection, _playState, _seletedLayer, controlTrack, dispatch],
      ),
    },
  ];

  const rotationTypeDropdownData: Array<{ text: PlaskRotationType; handleSelect: Dispatch<SetStateAction<PlaskRotationType>> }> = [
    { text: 'euler', handleSelect: () => setCurrentRotationType('euler') },
    { text: 'quaternion', handleSelect: () => setCurrentRotationType('quaternion') },
  ];

  return (
    <Fragment>
      <section className={cx('transform-section')}>
        <AnimationTitleToggle text="Transform" isSpread={isTransformSectionSpread} handleSpread={handleSpreadTransform} activeStatus={isAllActive && !isNull(controlTarget)} />
        <div className={cx('container', { active: isTransformSectionSpread })}>
          <AnimationInputWrapper inputTitle="Position" inputInfo={positionInputData} activeStatus={isAllActive && !isNull(controlTarget)} />
          {currentRotationType === 'euler' ? (
            <AnimationInputWrapper inputTitle="Euler" inputInfo={eulerInputData} dropdownList={rotationTypeDropdownData} activeStatus={isAllActive && !isNull(controlTarget)} />
          ) : (
            // prettier-ignore
            <AnimationInputWrapper inputTitle="Quaternion" inputInfo={quaternionInputData} dropdownList={rotationTypeDropdownData} activeStatus={isAllActive && !isNull(controlTarget)} />
          )}
          <AnimationInputWrapper inputTitle="Scale" inputInfo={scaleInputData} activeStatus={isAllActive && !isNull(controlTarget)} />
          {!(isAllActive && !isNull(controlTarget)) && <div className={cx('inactive-overlay')}></div>}
        </div>
      </section>
      <section className={cx('filter-section')}>
        <AnimationTitleToggle
          text="Filter"
          isSpread={isFilterSectionSpread}
          handleSpread={handleSpreadFilter}
          isPowerOn={isFilterOn}
          handleToggle={handleFilterToggle}
          withSwitch={true}
          checked={isFilterOn}
          activeStatus={isAllActive && isFilterOn}
          canToggle={!isUndefined(selectedAssetId)}
        />
        <div className={cx('container', { active: isFilterSectionSpread })}>
          {filterRangeData.map((info, idx) => (
            <AnimationRangeInput
              key={`${info.text}${idx}`}
              text={info.text}
              step={info.step}
              currentMax={info.currentMax}
              currentValue={info.currentValue}
              decimalDigit={info.decimalDigit}
              activeStatus={isAllActive && isFilterOn && !isNull(controlTrack)}
              handleChange={info.handleChange}
              onChangeEnd={info.onChangeEnd}
            />
          ))}
          {(!isAllActive || !isFilterOn || isNull(controlTrack)) && <div className={cx('inactive-overlay')}></div>}
        </div>
      </section>
    </Fragment>
  );
};

export default AnimationTab;
