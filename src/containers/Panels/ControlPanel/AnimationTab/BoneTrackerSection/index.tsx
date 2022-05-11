import { ChangeEvent, Dispatch, FocusEvent, Fragment, FunctionComponent, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';

import * as BABYLON from '@babylonjs/core';
import { isNull } from 'lodash';

import { AnimationTitleToggle } from 'components/ControlPanel';
import { Nullable } from 'types/common';
import { IconWrapper, SvgPath } from 'components/Icon';
import { PlaskTransformNode } from '3d/entities/PlaskTransformNode';

import classNames from 'classnames/bind';
import styles from './index.module.scss';
const cx = classNames.bind(styles);

interface Props {
  isAllActive: boolean;
  selectableObjects: Array<PlaskTransformNode>;
  selectedTargets: Array<PlaskTransformNode>;
}

const TransformSection: FunctionComponent<Props> = ({ isAllActive, selectableObjects, selectedTargets }) => {
  const _selectableObjects = selectableObjects;
  const _selectedTargets = selectedTargets;

  const [controlTarget, setControlTarget] = useState<Nullable<BABYLON.TransformNode | BABYLON.Mesh>>(null);

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

  // section spread status
  const [isSectionSpread, setIsSectionSpread] = useState<boolean>(true);

  // callback to spread/fold transform section
  const handleSpreadTransform = useCallback(() => {
    if (isSectionSpread) {
      setIsSectionSpread(false);
    } else {
      setIsSectionSpread(true);
    }
  }, [isSectionSpread]);

  return (
    <section className={cx('bone-tracker-section')}>
      <div className={cx('container', { active: isSectionSpread })}>
        <div className={cx('inner-container')}>
          <span className={cx('text', { active: controlTarget })}>{controlTarget ? controlTarget.name : 'None'}</span>
        </div>
        {!(isAllActive && !isNull(controlTarget)) && <div className={cx('inactive-overlay')}></div>}
      </div>
    </section>
  );
};

export default TransformSection;
