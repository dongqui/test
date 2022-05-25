import { Fragment, FunctionComponent } from 'react';
import IKControllerSection from './IKControllerSection';
import FilterSection from './FilterSection';
import TransformSection from './TransformSection';
import SelectionTrackerSection from './SelectionTrackerSection';

import { useSelector } from 'reducers';

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
  const _retargetMaps = useSelector((state) => state.animationData.retargetMaps);
  const _selectedLayer = useSelector((state) => state.trackList.selectedLayer); // === selectedLayerId (inappropriate naming)
  const _animationIngredients = useSelector((state) => state.animationData.animationIngredients);
  const _playState = useSelector((state) => state.animatingControls.playState);
  const _playDirection = useSelector((state) => state.animatingControls.playDirection);

  return (
    <Fragment>
      <SelectionTrackerSection isAllActive={isAllActive} selectableObjects={_selectableObjects} selectedTargets={_selectedTargets} />

      <TransformSection isAllActive={isAllActive} selectableObjects={_selectableObjects} selectedTargets={_selectedTargets} />
      <FilterSection
        isAllActive={isAllActive}
        visualizedAssetIds={_visualizedAssetIds}
        selectedTargets={_selectedTargets}
        seletedLayer={_selectedLayer}
        animationIngredients={_animationIngredients}
        playState={_playState}
        playDirection={_playDirection}
      />
      <IKControllerSection
        isAllActive={isAllActive}
        visualizedAssetIds={_visualizedAssetIds}
        retargetMaps={_retargetMaps}
        seletedLayer={_selectedLayer}
        animationIngredients={_animationIngredients}
        selectableObjects={_selectableObjects}
        selectedTargets={_selectedTargets}
      />
    </Fragment>
  );
};

export default AnimationTab;
