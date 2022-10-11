import { FunctionComponent, memo, useState } from 'react';
import { find, filter } from 'lodash';
import TagManager from 'react-gtm-module';

import { useSelector } from 'reducers';
import { BaseModal } from 'components/Modal';
import { BaseForm, BaseField } from 'components/Form';
import { AnimationIngredient } from 'types/common';
import Dropdown from './Dropdown';

import classnames from 'classnames/bind';
import styles from './ExportModal.module.scss';

const cx = classnames.bind(styles);

interface Props {
  onClose: () => void;
  motions: LP.Node[];
  onConfirm: (data: any) => void;
  onCancel?: () => void;
  targetMotrionId?: string;
}

const ExportModal: FunctionComponent<React.PropsWithChildren<Props>> = ({ onClose, motions, targetMotrionId, onConfirm, onCancel }) => {
  const baseMotionList =
    motions.length > 0
      ? [
          {
            value: 'none',
            label: 'None',
          },
          {
            value: 'all',
            label: 'Export all',
          },
        ]
      : [
          {
            value: 'none',
            label: 'None',
          },
        ];

  const motionList = baseMotionList.concat(
    motions.map((motion) => ({
      value: motion.id,
      label: motion.name,
    })),
  );

  const _assetList = useSelector((state) => state.plaskProject.assetList);
  const _retargetMaps = useSelector((state) => state.animationData.retargetMaps);
  const _nodes = useSelector((state) => state.lpNode.nodes);

  const assetId = motions[0].assetId;
  const currentAsset = find(_assetList, { id: assetId });
  const targetMotion = find(_nodes, { id: targetMotrionId });
  const initialMotionValue = {
    value: targetMotion ? targetMotion.id : motions[0].id,
    label: targetMotion ? targetMotion.name : motions[0].name,
  };

  const [values, setValues] = useState({
    motion: initialMotionValue.value,
    format: {
      value: 'fbx',
      label: 'fbx',
    },
  });

  const handleSubmit = (data: any) => {
    TagManager.dataLayer({
      dataLayer: {
        event: 'export_asset',
      },
    });
    onConfirm(data);
    onClose();
  };
  const retargetMap = currentAsset && find(_retargetMaps, { assetId: currentAsset.id });
  const isErrorRetargetMap = retargetMap && retargetMap.values.some((value) => !value.targetTransformNodeId);

  const disableBVH = values.motion === 'none' || values.motion === 'all';

  const formatList =
    !retargetMap || !isErrorRetargetMap
      ? [
          {
            value: 'fbx',
            label: 'fbx',
            disabled: false,
          },
          {
            value: 'fbx_unreal',
            label: 'fbx (Unreal engine)',
            disabled: false,
          },
          {
            value: 'glb',
            label: 'glb',
            disabled: false,
          },
          {
            value: 'bvh',
            label: 'bvh',
            disabled: disableBVH,
          },
        ]
      : [
          {
            value: 'fbx',
            label: 'fbx',
            disabled: false,
          },
          {
            value: 'fbx_unreal',
            label: 'fbx (Unreal engine)',
            disabled: false,
          },
          {
            value: 'glb',
            label: 'glb',
            disabled: false,
          },
        ];

  return (
    <BaseModal>
      <BaseForm onSubmit={handleSubmit}>
        {(props) => {
          const { setFormValue } = props;

          const handleFormatChange = (onChange: (...event: any[]) => void, format: string) => {
            onChange(format);

            if (values.format.value !== format) {
              setValues({
                ...values,
                format: {
                  label: format,
                  value: format,
                },
              });
            }
          };

          const handleMotionOnChange = (onChange: (...event: any[]) => void, motion: string) => {
            onChange(motion);

            if (values.motion !== motion) {
              if ((motion === 'none' || motion === 'all') && values.format.value === 'bvh') {
                setFormValue('format', 'fbx');
                setValues({
                  motion: motion,
                  format: {
                    label: 'fbx',
                    value: 'fbx',
                  },
                });

                return;
              }

              setValues({
                ...values,
                motion: motion,
              });
            }
          };

          return (
            <>
              <div className={cx('title')}>Export Setting</div>
              <div className={cx('field')}>
                <div className={cx('row')}>
                  <div className={cx('field-label')}>Motion:</div>
                  <div className={cx('field-value')}>
                    <BaseField<Field.DropdownProps, string>
                      render={({ onChange, ...rest }) => <Dropdown name="motion" onChange={(params) => handleMotionOnChange(onChange, params)} {...rest} />}
                      control={props.control}
                      defaultValue={values.motion}
                      name="motion"
                      list={motionList}
                      initialValue={initialMotionValue}
                      required
                    />
                  </div>
                </div>
                <div className={cx('row')}>
                  <div className={cx('field-label')}>Format:</div>
                  <div className={cx('field-value')}>
                    <BaseField<Field.DropdownProps, string>
                      render={({ onChange, ...rest }) => <Dropdown name="format" onChange={(params) => handleFormatChange(onChange, params)} {...rest} />}
                      control={props.control}
                      defaultValue={values.format.value}
                      name="format"
                      list={formatList}
                      initialValue={formatList[0]}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className={cx('buttons')}>
                <button className={cx('button', 'cancel')} onClick={onClose}>
                  Cancel
                </button>
                <button data-cy="modal-confirm" className={cx('button', 'positive')} type="submit">
                  Export
                </button>
              </div>
            </>
          );
        }}
      </BaseForm>
    </BaseModal>
  );
};

export default memo(ExportModal);
