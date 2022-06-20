import { ChangeEvent, Dispatch, FocusEvent, Fragment, FunctionComponent, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';

import * as BABYLON from '@babylonjs/core';
import { isNull } from 'lodash';

import { AnimationTitleToggle } from 'components/ControlPanel';
import { Nullable } from 'types/common';
import { IconWrapper, SvgPath } from 'components/Icon';
import { PlaskTransformNode } from '3d/entities/PlaskTransformNode';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

import plaskCommandManager from 'command/PlaskCommandManager';
const cx = classNames.bind(styles);

interface Props {
  isAllActive: boolean;
}

const HistorySection: FunctionComponent<Props> = ({ isAllActive }) => {
  // const [controlTarget, setControlTarget] = useState<Nullable<BABYLON.TransformNode | BABYLON.Mesh>>(null);
  // select control target according to the selected target
  useEffect(() => {}, []);

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
          <div className={cx('text', { active: true })}>{plaskCommandManager.pointer}</div>
          {plaskCommandManager.history.map((e) => {
            return (
              <div className={cx('text', { active: true })} key={e.command.redo.type}>
                {e.command.redo.type}
              </div>
            );
          })}
        </div>
        {!isAllActive && <div className={cx('inactive-overlay')}></div>}
      </div>
    </section>
  );
};

export default HistorySection;
