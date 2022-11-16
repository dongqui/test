import { FunctionComponent, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { RootState, useSelector } from 'reducers';
import * as commonActions from 'actions/Common/globalUI';
import * as globalUIActions from 'actions/Common/globalUI';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import { Switch } from 'components/Input';
import { ExportFormat } from 'types/common';
import UserInfo from './UserInfo/UserInfo';
import MainLogoDropDown from './DropDown/MainLogoDropDown';
import SupportDropdown from './DropDown/SupportDropdown';
import { ONBOARDING_ID } from 'containers/Onboarding/id';

import classNames from 'classnames/bind';
import styles from './UpperBar.module.scss';

const cx = classNames.bind(styles);

interface Props {
  switchMode: () => void | boolean;
  defaultMode: 'VM' | 'EM';
}

const UpperBar: FunctionComponent<React.PropsWithChildren<Props>> = ({ switchMode, defaultMode }) => {
  const dispatch = useDispatch();
  const { mode } = useSelector((state: RootState) => state.modeSelection);
  const { plaskProject, lpNode, trackList } = useSelector((state) => state);

  const modelId = plaskProject.visualizedAssetIds[0];
  const motions = lpNode.nodes.filter((node) => node.type === 'MOTION' && node.assetId === modelId);
  const selectedMotion = motions.find((motion) => motion.animationId === trackList.animationIngredientId);
  const exportAvailable = modelId && motions.length > 0 && selectedMotion !== undefined;

  const handleChangeSwitchMode = useCallback(() => {
    dispatch(commonActions.closeModal('GuideModal'));
    localStorage.setItem('onboarding_2', 'onboarding_2');
    return switchMode();
  }, [dispatch, switchMode]);

  const UBOption = [
    {
      key: 'EM',
      label: 'Editing',
      value: 'EM',
    },
    {
      key: 'VM',
      label: 'MoCap',
      value: 'VM',
    },
  ];

  const handleExport = () => {
    if (exportAvailable) {
      if (selectedMotion && selectedMotion.assetId) {
        dispatch(
          globalUIActions.openModal('ExportModal', {
            onConfirm: (data: { motion: string; format: ExportFormat }) => {
              if (selectedMotion && selectedMotion.assetId) {
                dispatch(
                  lpNodeActions.exportAsset({
                    ...data,
                    parentId: selectedMotion.parentId,
                    nodeName: selectedMotion.name,
                    assetId: selectedMotion.assetId,
                    type: 'MOTION',
                  }),
                );
              }
            },
            motions: motions,
            targetMotrionId: selectedMotion.id,
          }),
        );
      }
    } else {
      alert('model visualize && motion must exist');
    }
  };

  return (
    <div className={cx('wrap')}>
      <div className={cx('left-upper')}>
        <MainLogoDropDown />
      </div>
      <div className={cx('middle-upper')}>
        <Switch
          id={ONBOARDING_ID.VIDEO_MODE}
          options={UBOption}
          type="primary"
          defaultValue={defaultMode}
          onChange={handleChangeSwitchMode}
          className={cx('mode-switch')}
          value={mode === 'videoMode' ? 'VM' : mode === 'animationMode' ? 'EM' : ''}
        />
      </div>
      <div className={cx('right-upper')}>
        <button
          onClick={handleExport}
          className={cx('colorful-button', {
            disabled: !exportAvailable,
          })}
        >
          <span>Export</span>
        </button>
        <SupportDropdown />
        <UserInfo />
      </div>
    </div>
  );
};

export default UpperBar;
