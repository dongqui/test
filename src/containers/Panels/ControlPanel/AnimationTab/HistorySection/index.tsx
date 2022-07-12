import { ChangeEvent, Dispatch, FocusEvent, Fragment, FunctionComponent, SetStateAction, useCallback, useEffect, useMemo, useState, useContext } from 'react';

import { isNull } from 'lodash';

import { AnimationTitleToggle } from 'components/ControlPanel';
import { Nullable } from 'types/common';
import { IconWrapper, SvgPath } from 'components/Icon';
import { PlaskTransformNode } from '3d/entities/PlaskTransformNode';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

import { FilledButton } from 'components/Button';
import { useSelector } from 'reducers';
import { useDispatch } from 'react-redux';
import * as plaskHistoryAction from 'actions/plaskHistoryAction';

const cx = classNames.bind(styles);

interface Props {
  isAllActive: boolean;
}

const HistorySection: FunctionComponent<Props> = ({ isAllActive }) => {
  // const [controlTarget, setControlTarget] = useState<Nullable<BABYLON.TransformNode | BABYLON.Mesh>>(null);
  // select control target according to the selected target
  const _history = useSelector((state) => state.plaskHistory.history);
  const _pointer = useSelector((state) => state.plaskHistory.pointer);

  const dispatch = useDispatch();

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

  const handleRedo = useCallback(() => {
    dispatch(plaskHistoryAction.redo());
  }, [dispatch]);
  const handleUndo = useCallback(() => {
    dispatch(plaskHistoryAction.undo());
  }, [dispatch]);
  return (
    <section className={cx('history-section')}>
      <div className={cx('container', { active: isSectionSpread })}>
        <div className={cx('inner-container')}>
          {_history.length ? (
            _history.map((e, idx) => {
              return (
                <div className={cx('text', { active: _pointer >= idx })} key={e.title + idx}>
                  {e.title}
                </div>
              );
            })
          ) : (
            <div className={cx('text')}>No History Available</div>
          )}
          <FilledButton onClick={handleUndo} className={cx('button')} key={`undo`} text={'undo'} type="default" fullSize={false} />
          <FilledButton onClick={handleRedo} className={cx('button')} key={`redo`} text={'redo'} type="default" fullSize={false} />
        </div>
        {!isAllActive && <div className={cx('inactive-overlay')}></div>}
      </div>
    </section>
  );
};

export default HistorySection;
