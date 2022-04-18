import { ChangeEvent, Dispatch, FocusEvent, Fragment, FunctionComponent, SetStateAction, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { isNull, isUndefined } from 'lodash';
import { useDispatch } from 'react-redux';

import AnimationInputWrapper from './AnimationInputWrapper';
import * as animationDataActions from 'actions/animationDataAction';
import { AnimationTitleToggle, AnimationRangeInput } from 'components/ControlPanel';
import { Nullable, PlaskLayer, PlaskRotationType, PlaskTrack } from 'types/common';
import { useSelector } from 'reducers';
import { convertToDegree, convertToRadian, forceClickAnimationPauseAndPlay } from 'utils/common';
import { Mesh, TransformNode } from '@babylonjs/core';
import { BabylonContext } from 'contexts/RP/BabylonContext';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

interface Props {
  isAllActive: boolean;
}

const AnimationTab: FunctionComponent<Props> = ({ isAllActive }) => {
  const _visualizedAssetIds = useSelector((state) => state.plaskProject.visualizedAssetIds);
  const _selectableObjects = useSelector((state) => state.selectingData.present.selectableObjects);
  const _selectedTargets = useSelector((state) => state.selectingData.present.selectedTargets);
  const _selectedLayer = useSelector((state) => state.trackList.selectedLayer); // === selectedLayerId (inappropriate naming)
  const _animationIngredients = useSelector((state) => state.animationData.animationIngredients);
  const _playState = useSelector((state) => state.animatingControls.playState);
  const _playDirection = useSelector((state) => state.animatingControls.playDirection);

  const dispatch = useDispatch();

  // The current structure is under the assumption of multi-models, but Plask app itself only supports single-model.
  // So, the next line is for making structure single-model like.
  const selectedAssetId = useMemo(() => _visualizedAssetIds[0], [_visualizedAssetIds]);

  const [controlTarget, setControlTarget] = useState<Nullable<TransformNode | Mesh>>(null);
  const [controlLayer, setControlLayer] = useState<Nullable<PlaskLayer>>(null);
  const [controlTrack, setControlTrack] = useState<Nullable<PlaskTrack>>(null);

  // useState for position value
  const [positionX, setPositionX] = useState<number>(0);
  const [positionY, setPositionY] = useState<number>(0);
  const [positionZ, setPositionZ] = useState<number>(0);

  // useState for euler value
  const [eulerX, setEulerX] = useState<number>(0);
  const [eulerY, setEulerY] = useState<number>(0);
  const [eulerZ, setEulerZ] = useState<number>(0);

  // useState for quaternion value
  const [quaternionW, setQuaternionW] = useState<number>(1);
  const [quaternionX, setQuaternionX] = useState<number>(0);
  const [quaternionY, setQuaternionY] = useState<number>(0);
  const [quaternionZ, setQuaternionZ] = useState<number>(0);

  // useState for scaling value
  const [scaleX, setScaleX] = useState<number>(0);
  const [scaleY, setScaleY] = useState<number>(0);
  const [scaleZ, setScaleZ] = useState<number>(0);

  // section spread status
  const [isTransformSectionSpread, setIsTransformSectionSpread] = useState<boolean>(true);
  const [isFilterSectionSpread, setIsFilterSectionSpread] = useState<boolean>(true);

  // transform section
  const [currentRotationType, setCurrentRotationType] = useState<PlaskRotationType>('euler');

  // filter section
  // 1euro filter values. refer https://cristal.univ-lille.fr/~casiez/1euro/
  const [isFilterOn, setIsFilterOn] = useState<boolean>(false);
  const [fcValue, setFcValue] = useState<number>(10);
  const [betaValue, setBetaValue] = useState<number>(1);

  // select control target according to the selected target
  useEffect(() => {
    if (_selectedTargets.length === 0) {
      // case nothing is selected
      setControlTarget(null);
    } else if (_selectedTargets.length === 1) {
      // case single target is selected
      setControlTarget(_selectedTargets[0].reference);
    } else {
      // case multi targets are selected
      setControlTarget(null);
    }
  }, [_selectableObjects, _selectedTargets]);

  // select control track according to the selected target
  useEffect(() => {
    if (_selectedTargets.length === 0) {
      setControlTrack(null);
    } else if (_selectedTargets.length === 1) {
      const targetAssetId = _selectedTargets[0].id.split('//')[0];
      const targetAnimationIngredient = _animationIngredients.find((animationIngredient) => animationIngredient.assetId === targetAssetId && animationIngredient.current);
      const targetLayer = targetAnimationIngredient?.layers.find((layer) => layer.id === _selectedLayer)!;
      const targetTrack = targetLayer.tracks.find((track) => track.targetId === _selectedTargets[0].id)!;

      setControlLayer(targetLayer);
      setControlTrack(targetTrack);
    } else {
      setControlLayer(null);
      setControlTrack(null);
    }
  }, [_animationIngredients, _selectedTargets, _selectedLayer]);

  // set states related to target's properties when target's matrix is updated
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

        setQuaternionW(rotationQuaternion!.w);
        setQuaternionX(rotationQuaternion!.x);
        setQuaternionY(rotationQuaternion!.y);
        setQuaternionZ(rotationQuaternion!.z);

        setScaleX(scaling.x);
        setScaleY(scaling.y);
        setScaleZ(scaling.z);
      });

      return () => {
        controlTarget.onAfterWorldMatrixUpdateObservable.remove(matrixUpdateObservable);
      };
    }
  }, [controlTarget]);

  // change filter on/off according to the selected layer
  useEffect(() => {
    if (selectedAssetId) {
      const targetAnimationIngredient = _animationIngredients.find((animationIngredient) => animationIngredient.assetId === selectedAssetId && animationIngredient.current);
      const targetLayer = targetAnimationIngredient?.layers.find((layer) => layer.id === _selectedLayer);

      if (targetLayer) {
        const useFilter = targetLayer.useFilter;
        setIsFilterOn(useFilter);
      } else {
        setIsFilterOn(false);
      }
    } else {
      setIsFilterOn(false);
    }
  }, [_animationIngredients, _selectedLayer, selectedAssetId]);

  // change filter parameters according to the selected track
  useEffect(() => {
    if (controlLayer && controlLayer.useFilter && controlTrack) {
      setFcValue(controlTrack.filterMinCutoff);
      setBetaValue(controlTrack.filterBeta);
    } else {
      setFcValue(10);
      setBetaValue(1);
    }
  }, [controlLayer, controlTrack]);

  // callback to spread/fold transform section
  const handleSpreadTransform = useCallback(() => {
    setIsTransformSectionSpread((prevState) => !prevState);
  }, []);

  // callback to spread/fold filter section
  const handleSpreadFilter = useCallback(() => {
    setIsFilterSectionSpread((prevState) => !prevState);
  }, []);

  // callback to power filter on/off
  const handleFilterToggle = useCallback(() => {
    if (selectedAssetId) {
      const targetAnimationIngredient = _animationIngredients.find((animationIngredient) => animationIngredient.assetId === selectedAssetId && animationIngredient.current);
      if (targetAnimationIngredient) {
        if (isFilterOn) {
          dispatch(animationDataActions.turnFilterOff({ animationIngredientId: targetAnimationIngredient.id, layerId: _selectedLayer }));
        } else {
          dispatch(animationDataActions.turnFilterOn({ animationIngredientId: targetAnimationIngredient.id, layerId: _selectedLayer }));
        }
      }
      setIsFilterOn((prevState) => !prevState);
      forceClickAnimationPauseAndPlay(_playState, _playDirection);
    }
  }, [_animationIngredients, _playDirection, _playState, _selectedLayer, dispatch, isFilterOn, selectedAssetId]);

  const { plaskEngine } = useContext(BabylonContext);

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
            controlTarget.getPlaskEntity().fromTransformNode();
            plaskEngine.userAction([controlTarget.getPlaskEntity()]);
          }
        },
        [controlTarget, plaskEngine],
      ),
      defaultValue: useMemo(() => (controlTarget ? controlTarget.position.x : 0), [controlTarget]),
      decimalDigit: 4,
      currentValue: `${positionX}`,
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
            controlTarget.getPlaskEntity().fromTransformNode();
            plaskEngine.userAction([controlTarget.getPlaskEntity()]);
          }
        },
        [controlTarget, plaskEngine],
      ),
      defaultValue: useMemo(() => (controlTarget ? controlTarget.position.y : 0), [controlTarget]),
      decimalDigit: 4,
      currentValue: `${positionY}`,
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
            controlTarget.getPlaskEntity().fromTransformNode();
            plaskEngine.userAction([controlTarget.getPlaskEntity()]);
          }
        },
        [controlTarget, plaskEngine],
      ),
      defaultValue: useMemo(() => (controlTarget ? controlTarget.position.z : 0), [controlTarget]),
      decimalDigit: 4,
      currentValue: `${positionZ}`,
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
            controlTarget.getPlaskEntity().fromTransformNode();
            plaskEngine.userAction([controlTarget.getPlaskEntity()]);
          }
        },
        [controlTarget, plaskEngine],
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
      currentValue: `${eulerX}`,
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
            controlTarget.getPlaskEntity().fromTransformNode();
            plaskEngine.userAction([controlTarget.getPlaskEntity()]);
          }
        },
        [controlTarget, plaskEngine],
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
      currentValue: `${eulerY}`,
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
            controlTarget.getPlaskEntity().fromTransformNode();
            plaskEngine.userAction([controlTarget.getPlaskEntity()]);
          }
        },
        [controlTarget, plaskEngine],
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
      currentValue: `${eulerZ}`,
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
            setQuaternionW(parseFloat(event.target.value));
            controlTarget.rotationQuaternion!.w = parseFloat(event.target.value);
            controlTarget.getPlaskEntity().fromTransformNode();
            plaskEngine.userAction([controlTarget.getPlaskEntity()]);
          }
        },
        [controlTarget, plaskEngine],
      ),
      defaultValue: useMemo(() => (controlTarget ? controlTarget.rotationQuaternion!.w : 1), [controlTarget]),
      decimalDigit: 4,
      currentValue: `${quaternionW}`,
    },
    {
      text: 'X',
      handleBlur: useCallback(
        (event: FocusEvent<HTMLInputElement>) => {
          if (isNaN(parseFloat(event.target.value))) {
            return;
          }

          if (controlTarget) {
            setQuaternionX(parseFloat(event.target.value));
            controlTarget.rotationQuaternion!.x = parseFloat(event.target.value);
            controlTarget.getPlaskEntity().fromTransformNode();
            plaskEngine.userAction([controlTarget.getPlaskEntity()]);
          }
        },
        [controlTarget, plaskEngine],
      ),
      defaultValue: useMemo(() => (controlTarget ? controlTarget.rotationQuaternion!.x : 0), [controlTarget]),
      decimalDigit: 4,
      currentValue: `${quaternionX}`,
    },
    {
      text: 'Y',
      handleBlur: useCallback(
        (event: FocusEvent<HTMLInputElement>) => {
          if (isNaN(parseFloat(event.target.value))) {
            return;
          }

          if (controlTarget) {
            setQuaternionY(parseFloat(event.target.value));
            controlTarget.rotationQuaternion!.y = parseFloat(event.target.value);
            controlTarget.getPlaskEntity().fromTransformNode();
            plaskEngine.userAction([controlTarget.getPlaskEntity()]);
          }
        },
        [controlTarget, plaskEngine],
      ),
      defaultValue: useMemo(() => (controlTarget ? controlTarget.rotationQuaternion!.y : 0), [controlTarget]),
      decimalDigit: 4,
      currentValue: `${quaternionY}`,
    },
    {
      text: 'Z',
      handleBlur: useCallback(
        (event: FocusEvent<HTMLInputElement>) => {
          if (isNaN(parseFloat(event.target.value))) {
            return;
          }

          if (controlTarget) {
            setQuaternionZ(parseFloat(event.target.value));
            controlTarget.rotationQuaternion!.z = parseFloat(event.target.value);
            controlTarget.getPlaskEntity().fromTransformNode();
            plaskEngine.userAction([controlTarget.getPlaskEntity()]);
          }
        },
        [controlTarget, plaskEngine],
      ),
      defaultValue: useMemo(() => (controlTarget ? controlTarget.rotationQuaternion!.z : 0), [controlTarget]),
      decimalDigit: 4,
      currnetValue: `${quaternionZ}`,
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
            controlTarget.getPlaskEntity().fromTransformNode();
            plaskEngine.userAction([controlTarget.getPlaskEntity()]);
          }
        },
        [controlTarget, plaskEngine],
      ),
      defaultValue: useMemo(() => (controlTarget ? controlTarget.scaling.x : 0), [controlTarget]),
      decimalDigit: 4,
      currentValue: `${scaleX}`,
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
            controlTarget.getPlaskEntity().fromTransformNode();
            plaskEngine.userAction([controlTarget.getPlaskEntity()]);
          }
        },
        [controlTarget, plaskEngine],
      ),
      defaultValue: useMemo(() => (controlTarget ? controlTarget.scaling.x : 0), [controlTarget]),
      decimalDigit: 4,
      currentValue: `${scaleY}`,
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
            controlTarget.getPlaskEntity().fromTransformNode();
            plaskEngine.userAction([controlTarget.getPlaskEntity()]);
          }
        },
        [controlTarget, plaskEngine],
      ),
      defaultValue: useMemo(() => (controlTarget ? controlTarget.scaling.x : 0), [controlTarget]),
      decimalDigit: 4,
      currentValue: `${scaleZ}`,
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
            dispatch(animationDataActions.changeTrackFilterMinCutoff({ layerId: _selectedLayer, trackId: controlTrack.id, value: inputValue }));
            // @TODO anti-pattern
            // to use new animationGroup, click pause and play button
            forceClickAnimationPauseAndPlay(_playState, _playDirection);
          }
        },
        [_playDirection, _playState, _selectedLayer, controlTrack, dispatch],
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
            dispatch(animationDataActions.changeTrackFilterBeta({ layerId: _selectedLayer, trackId: controlTrack.id, value: inputValue }));
            // @TODO anti-pattern
            // to use new animationGroup, click pause and play button
            forceClickAnimationPauseAndPlay(_playState, _playDirection);
          }
        },
        [_playDirection, _playState, _selectedLayer, controlTrack, dispatch],
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
          {!(isAllActive && !isNull(controlTarget)) && <div className={cx('inactive-overlay')} />}
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
          {(!isAllActive || !isFilterOn || isNull(controlTrack)) && <div className={cx('inactive-overlay')} />}
        </div>
      </section>
    </Fragment>
  );
};

export default AnimationTab;
