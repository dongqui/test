import { ChangeEvent, Dispatch, FocusEvent, Fragment, FunctionComponent, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import * as BABYLON from '@babylonjs/core';
import { isNull, isUndefined } from 'lodash';
import { useDispatch } from 'react-redux';
import { PlayDirection, PlayState } from 'types/RP';
import * as animationDataActions from 'actions/animationDataAction';
import { AnimationTitleToggle, StaticRangeInput } from 'components/ControlPanel';
import { Nullable, PlaskLayer, PlaskRotationType, PlaskTrack, AnimationIngredient } from 'types/common';
import { useSelector } from 'reducers';
import { convertToDegree, convertToRadian, forceClickAnimationPauseAndPlay } from 'utils/common';

import { PlaskTransformNode } from '3d/entities/PlaskTransformNode';
import { PlaskCard } from 'components/ControlPanel/Card';

import classNames from 'classnames/bind';
import styles from './index.module.scss';
const cx = classNames.bind(styles);

interface Props {
  isAllActive: boolean;
  visualizedAssetIds: Array<string>;
  selectedTargets: Array<PlaskTransformNode>;
  seletedLayer: string;
  animationIngredients: Array<AnimationIngredient>;
  playState: PlayState;
  playDirection: PlayDirection;
}

const FilterSection: FunctionComponent<Props> = ({ isAllActive, visualizedAssetIds, selectedTargets, seletedLayer, animationIngredients, playState, playDirection }) => {
  const _visualizedAssetIds = visualizedAssetIds;
  const _selectedTargets = selectedTargets;
  const _seletedLayer = seletedLayer;
  const _animationIngredients = animationIngredients;
  const _playState = playState;
  const _playDirection = playDirection;

  const dispatch = useDispatch();

  // The current structure is under the assumption of multi-models, but Plask app itself only supports single-model.
  // So, the next line is for making structure single-model like.
  const selectedAssetId = useMemo(() => _visualizedAssetIds[0], [_visualizedAssetIds]);

  const [controlTarget, setControlTarget] = useState<Nullable<BABYLON.TransformNode | BABYLON.Mesh>>(null);
  const [controlLayer, setControlLayer] = useState<Nullable<PlaskLayer>>(null);
  const [controlTrack, setControlTrack] = useState<Nullable<PlaskTrack>>(null);

  // section spread status
  const [isFilterSectionSpread, setIsFilterSectionSpread] = useState<boolean>(true);

  // filter section
  const [isFilterOn, setIsFilterOn] = useState<boolean>(false);
  const [fcValue, setFcValue] = useState<number>(10);
  const [betaValue, setBetaValue] = useState<number>(1);

  // select control track according to the selected target
  useEffect(() => {
    if (_selectedTargets.length === 0) {
      setControlTrack(null);
    } else if (_selectedTargets.length === 1) {
      const targetAssetId = _selectedTargets[0].id.split('//')[0];
      const targetAnimationIngredient = _animationIngredients.find((animationIngredient) => animationIngredient.assetId === targetAssetId && animationIngredient.current);
      if (!targetAnimationIngredient) {
        // We selected a target without animation tracks
        setControlLayer(null);
        setControlTrack(null);
        return;
      }
      const targetLayer = targetAnimationIngredient?.layers.find((layer) => layer.id === _seletedLayer)!;
      const targetTrack = targetLayer.tracks.find((track) => track.targetId === _selectedTargets[0].id)!;

      setControlLayer(targetLayer);
      setControlTrack(targetTrack);
    } else {
      setControlLayer(null);
      setControlTrack(null);
    }
  }, [_animationIngredients, _selectedTargets, _seletedLayer]);

  // change filter on/off according to the selected layer
  useEffect(() => {
    if (selectedAssetId) {
      const targetAnimationIngredient = _animationIngredients.find((animationIngredient) => animationIngredient.assetId === selectedAssetId && animationIngredient.current);
      const targetLayer = targetAnimationIngredient?.layers.find((layer) => layer.id === _seletedLayer);

      if (targetLayer) {
        const useFilter = targetLayer.useFilter;
        setIsFilterOn(useFilter);
      } else {
        setIsFilterOn(false);
      }
    } else {
      setIsFilterOn(false);
    }
  }, [_animationIngredients, _seletedLayer, selectedAssetId]);

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

  // callback to spread/fold filter section
  const handleSpreadFilter = useCallback(() => {
    if (isFilterSectionSpread) {
      setIsFilterSectionSpread(false);
    } else {
      setIsFilterSectionSpread(true);
    }
  }, [isFilterSectionSpread]);

  // callback to power filter on/off
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
            // @TODO anti-pattern
            // to use new animationGroup, click pause and play button
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
            // @TODO anti-pattern
            // to use new animationGroup, click pause and play button
            forceClickAnimationPauseAndPlay(_playState, _playDirection);
          }
        },
        [_playDirection, _playState, _seletedLayer, controlTrack, dispatch],
      ),
    },
  ];
  return (
    <PlaskCard
      type="toggle"
      title="Filter"
      isPowerOn={isFilterOn}
      activeStatus={isAllActive && isFilterOn}
      toggleOptions={{
        checked: isFilterOn,
        handleToggle: handleFilterToggle,
        canToggle: !isUndefined(selectedAssetId),
      }}
    >
      {filterRangeData.map((info, idx) => (
        <StaticRangeInput
          key={`${info.text}${idx}`}
          text={info.text}
          step={info.step}
          max={info.currentMax}
          currentValue={info.currentValue}
          decimalDigit={info.decimalDigit}
          activeStatus={isAllActive && isFilterOn && !isNull(controlTrack)}
          handleChange={info.handleChange}
          onChangeEnd={info.onChangeEnd}
        />
      ))}
      {(!isAllActive || !isFilterOn || isNull(controlTrack)) && <div className={cx('inactive-overlay')}></div>}
    </PlaskCard>
  );
};

export default FilterSection;
