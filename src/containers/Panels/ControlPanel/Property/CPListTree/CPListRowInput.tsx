import React, { useCallback, useEffect, useState, useRef, Fragment } from 'react';
import * as THREE from 'three';
import { useReactiveVar } from '@apollo/client';
import { CPNameType } from 'types/CP';
import { RenderingDataPropertyName } from 'types/RP';
import { fnConvertDegreeToEuler, fnConvertEulerToDegree } from 'utils/common';
import {
  fnChangeBonePosition,
  fnChangeBoneQuaternion,
  fnChangeBoneRotation,
  fnChangeBoneScale,
} from 'utils/CP/transformUtils';
import { IconWrapper, SvgPath } from 'components/Icon';
import { CPInput } from './CPInput';
import { Segment } from 'components/Segment';
import _ from 'lodash';
import classNames from 'classnames/bind';
import styles from './CPListRowInput.module.scss';
import { useDispatch } from 'react-redux';
import * as boneTransformActions from 'actions/boneTransform';
import { useSelector } from 'reducers';

const cx = classNames.bind(styles);

export interface CPListRowInputProps {
  rowKey: string;
  name: string;
  w?: RenderingDataPropertyName.quaternionW;
  x?:
    | RenderingDataPropertyName.quaternionX
    | RenderingDataPropertyName.positionX
    | RenderingDataPropertyName.rotationX
    | RenderingDataPropertyName.scaleX;
  y?:
    | RenderingDataPropertyName.quaternionY
    | RenderingDataPropertyName.positionY
    | RenderingDataPropertyName.rotationY
    | RenderingDataPropertyName.scaleY;
  z?:
    | RenderingDataPropertyName.quaternionZ
    | RenderingDataPropertyName.positionZ
    | RenderingDataPropertyName.rotationZ
    | RenderingDataPropertyName.scaleZ;
}

interface InputValueType {
  w?: number;
  x: number;
  y: number;
  z: number;
}

const CPListRowInputComponent: React.FC<CPListRowInputProps> = ({
  name,
  w = RenderingDataPropertyName.quaternionW,
  x = RenderingDataPropertyName.positionX,
  y = RenderingDataPropertyName.positionY,
  z = RenderingDataPropertyName.positionZ,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const { currentBone, transformControls } = useSelector((state) => state.renderingData);

  const [initialValue, setInitialValue] = useState<InputValueType>({
    x: 0,
    y: 0,
    z: 0,
  });

  const [values, setValue] = useState<InputValueType>(initialValue);

  const [isModeSelectOpen, setIsModeSelectOpen] = useState(false);
  const [quaternionMode, setQuaternionMode] = useState(false);

  const dispatch = useDispatch();
  type NormalAxisType = 'x' | 'y' | 'z';
  type QuaternionAxisType = 'x' | 'y' | 'z' | 'w';

  const handleBlur = useCallback(
    (e: any) => {
      const value = e.target.value;
      const name = e.target.name;
      const property = name?.slice(0, -1).toLowerCase();
      const axis: any = name?.slice(-1).toLowerCase();

      if (_.isNaN(parseFloat(value))) {
        return;
      }

      if (currentBone) {
        const boneTransformValues = {
          bone: currentBone,
          position: {
            x: _.round(currentBone.position.x, 4),
            y: _.round(currentBone.position.y, 4),
            z: _.round(currentBone.position.z, 4),
          },
          quaternion: {
            x: _.round(currentBone.quaternion.x, 4),
            y: _.round(currentBone.quaternion.y, 4),
            z: _.round(currentBone.quaternion.z, 4),
            w: _.round(currentBone.quaternion.w, 4),
          },
          rotation: {
            x: _.round(currentBone.rotation.x, 4),
            y: _.round(currentBone.rotation.y, 4),
            z: _.round(currentBone.rotation.z, 4),
          },
          scale: {
            x: _.round(currentBone.scale.x, 4),
            y: _.round(currentBone.scale.y, 4),
            z: _.round(currentBone.scale.z, 4),
          },
        };

        switch (property) {
          case 'position':
            if (currentBone) {
              fnChangeBonePosition({ targetBone: currentBone, axis, value: parseFloat(value) });
              boneTransformValues.position[axis as NormalAxisType] = parseFloat(value);
              dispatch(boneTransformActions.changeBoneTransform(boneTransformValues));
            }
            break;
          case 'rotation':
          case 'quaternion':
            if (quaternionMode) {
              fnChangeBoneQuaternion({
                targetBone: currentBone,
                axis,
                value: parseFloat(value),
              });
              boneTransformValues.quaternion[axis as QuaternionAxisType] = _.round(
                parseFloat(value),
                4,
              );
              // q -> r 해서 적용
              const e = new THREE.Euler().setFromQuaternion(
                new THREE.Quaternion(
                  boneTransformValues.quaternion.x,
                  boneTransformValues.quaternion.y,
                  boneTransformValues.quaternion.z,
                  boneTransformValues.quaternion.w,
                ).normalize(),
                'XYZ',
              );
              boneTransformValues.rotation.x = _.round(e.x, 4);
              boneTransformValues.rotation.y = _.round(e.y, 4);
              boneTransformValues.rotation.z = _.round(e.z, 4);
              dispatch(boneTransformActions.changeBoneTransform(boneTransformValues));
            } else {
              fnChangeBoneRotation({
                targetBone: currentBone,
                axis,
                value: fnConvertDegreeToEuler({ degreeValue: parseFloat(value) }),
              });
              boneTransformValues.rotation[axis as NormalAxisType] = _.round(
                fnConvertDegreeToEuler({
                  degreeValue: parseFloat(value),
                }),
                4,
              );
              // d -> r -> q 해서 적용
              const q = new THREE.Quaternion().setFromEuler(
                new THREE.Euler(
                  boneTransformValues.rotation.x,
                  boneTransformValues.rotation.y,
                  boneTransformValues.rotation.z,
                ),
              );
              boneTransformValues.quaternion.x = _.round(q.x, 4);
              boneTransformValues.quaternion.y = _.round(q.y, 4);
              boneTransformValues.quaternion.z = _.round(q.z, 4);
              boneTransformValues.quaternion.w = _.round(q.w, 4);
              dispatch(boneTransformActions.changeBoneTransform(boneTransformValues));
            }
            break;
          case 'scale':
            fnChangeBoneScale({ targetBone: currentBone, axis, value: parseFloat(value) });
            boneTransformValues.scale[axis as NormalAxisType] = _.round(parseFloat(value), 4);
            dispatch(boneTransformActions.changeBoneTransform(boneTransformValues));
            break;
          default:
            break;
        }
      }
    },
    [currentBone, dispatch, quaternionMode],
  );

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (_.isEqual(e.key, 'Enter')) {
      e.currentTarget.blur();
    }
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'Enter':
        event.currentTarget.blur();
        break;
      default:
        break;
    }
  };

  const boneTransform = useSelector((state) => state.undoableBoneTransform);

  // undo/redo 시 input 값 변경
  useEffect(() => {
    if (boneTransform && !Object.values(boneTransform.present).includes(undefined)) {
      const {
        present: { position, rotation, quaternion, scale },
      } = boneTransform;
      if (_.isEqual(name, CPNameType.Position) && position) {
        setInitialValue({
          x: position.x ? _.round(position.x, 4) : 0,
          y: position.y ? _.round(position.y, 4) : 0,
          z: position.z ? _.round(position.z, 4) : 0,
        });
      }
      if (_.isEqual(name, CPNameType.Rotation) && quaternion && rotation) {
        if (quaternionMode) {
          setInitialValue({
            w: quaternion.w ? _.round(quaternion.w, 4) : 1,
            x: quaternion.x ? _.round(quaternion.x, 4) : 0,
            y: quaternion.y ? _.round(quaternion.y, 4) : 0,
            z: quaternion.z ? _.round(quaternion.z, 4) : 0,
          });
        } else {
          setInitialValue({
            x: rotation.x ? _.round(fnConvertEulerToDegree({ eulerValue: rotation.x }), 4) : 0,
            y: rotation.y ? _.round(fnConvertEulerToDegree({ eulerValue: rotation.y }), 4) : 0,
            z: rotation.z ? _.round(fnConvertEulerToDegree({ eulerValue: rotation.z }), 4) : 0,
          });
        }
      }
      if (_.isEqual(name, CPNameType.Scale) && scale) {
        setInitialValue({
          x: scale.x ? _.round(scale.x, 4) : 1,
          y: scale.y ? _.round(scale.y, 4) : 1,
          z: scale.z ? _.round(scale.z, 4) : 1,
        });
      }
    }
  }, [boneTransform, name, quaternionMode]);

  // transformControls 드래그 조작 시
  useEffect(() => {
    if (transformControls) {
      // THREE example 소스라 타입 지원하지 않습니다
      const handleObjectChange = (event: any) => {
        // event.target 이 transformControls,
        // event.target.object 가 컨트롤 한 Bone 입니다
        const targetObject = event.target.object;
        if (_.isEqual(name, CPNameType.Position)) {
          setInitialValue({
            x: targetObject?.position?.x ? _.round(targetObject?.position?.x, 4) : 0,
            y: targetObject?.position?.y ? _.round(targetObject?.position?.y, 4) : 0,
            z: targetObject?.position?.z ? _.round(targetObject?.position?.z, 4) : 0,
          });
        }
        if (_.isEqual(name, CPNameType.Rotation)) {
          if (quaternionMode) {
            setInitialValue({
              w: targetObject?.quaternion?.w ? _.round(targetObject?.quaternion?.w, 4) : 1,
              x: targetObject?.quaternion?.x ? _.round(targetObject?.quaternion?.x, 4) : 0,
              y: targetObject?.quaternion?.y ? _.round(targetObject?.quaternion?.y, 4) : 0,
              z: targetObject?.quaternion?.z ? _.round(targetObject?.quaternion?.z, 4) : 0,
            });
          } else {
            setInitialValue({
              x: targetObject?.rotation?.x
                ? _.round(fnConvertEulerToDegree({ eulerValue: targetObject?.rotation?.x }), 4)
                : 0,
              y: targetObject?.rotation?.y
                ? _.round(fnConvertEulerToDegree({ eulerValue: targetObject?.rotation?.y }), 4)
                : 0,
              z: targetObject?.rotation?.z
                ? _.round(fnConvertEulerToDegree({ eulerValue: targetObject?.rotation?.z }), 4)
                : 0,
            });
          }
        }
        if (_.isEqual(name, CPNameType.Scale)) {
          setInitialValue({
            x: targetObject?.scale?.x ? _.round(targetObject?.scale?.x, 4) : 1,
            y: targetObject?.scale?.y ? _.round(targetObject?.scale?.y, 4) : 1,
            z: targetObject?.scale?.z ? _.round(targetObject?.scale?.z, 4) : 1,
          });
        }
      };
      transformControls.addEventListener('objectChange', handleObjectChange);
      return () => {
        transformControls.removeEventListener('objectChange', handleObjectChange);
      };
    }
  }, [name, quaternionMode, transformControls]);

  // currentBone 변경 시 input 값 변경
  useEffect(() => {
    if (_.isEqual(name, CPNameType.Position)) {
      setInitialValue({
        x: currentBone?.position?.x ? _.round(currentBone?.position?.x, 4) : 0,
        y: currentBone?.position?.y ? _.round(currentBone?.position?.y, 4) : 0,
        z: currentBone?.position?.z ? _.round(currentBone?.position?.z, 4) : 0,
      });
    }
    if (_.isEqual(name, CPNameType.Rotation)) {
      if (quaternionMode) {
        setInitialValue({
          w: currentBone?.quaternion?.w ? _.round(currentBone?.quaternion?.w, 4) : 1,
          x: currentBone?.quaternion?.x ? _.round(currentBone?.quaternion?.x, 4) : 0,
          y: currentBone?.quaternion?.y ? _.round(currentBone?.quaternion?.y, 4) : 0,
          z: currentBone?.quaternion?.z ? _.round(currentBone?.quaternion?.z, 4) : 0,
        });
      } else {
        setInitialValue({
          x: currentBone?.rotation?.x
            ? _.round(fnConvertEulerToDegree({ eulerValue: currentBone?.rotation?.x }), 4)
            : 0,
          y: currentBone?.rotation?.y
            ? _.round(fnConvertEulerToDegree({ eulerValue: currentBone?.rotation?.y }), 4)
            : 0,
          z: currentBone?.rotation?.z
            ? _.round(fnConvertEulerToDegree({ eulerValue: currentBone?.rotation?.z }), 4)
            : 0,
        });
      }
    }
    if (_.isEqual(name, CPNameType.Scale)) {
      setInitialValue({
        x: currentBone?.scale?.x ? _.round(currentBone?.scale?.x, 4) : 1,
        y: currentBone?.scale?.y ? _.round(currentBone?.scale?.y, 4) : 1,
        z: currentBone?.scale?.z ? _.round(currentBone?.scale?.z, 4) : 1,
      });
    }
  }, [currentBone, name, quaternionMode]);

  const handleChange = useCallback((e) => {
    if (!_.isNaN(Number(e.target.value))) {
      setValue(e.target.value);
    }
  }, []);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const valueList = [
    { key: x, value: values.x, name: x, prefix: 'X' },
    { key: y, value: values.y, name: y, prefix: 'Y' },
    { key: z, value: values.z, name: z, prefix: 'Z' },
  ];

  const quaternionList = [
    { key: w, value: values.w, name: w, prefix: 'W' },
    { key: x, value: values.x, name: x, prefix: 'X' },
    { key: y, value: values.y, name: y, prefix: 'Y' },
    { key: z, value: values.z, name: z, prefix: 'Z' },
  ];

  const iconClasses = cx('icon', {
    rotation: _.isEqual(name, 'Rotation'),
    quaternion: isModeSelectOpen,
  });

  const titleClasses = cx('property-title', {
    quaternionMode: quaternionMode,
  });

  const modeList = [
    {
      key: 'euler',
      value: 'Euler',
      isSelected: !quaternionMode,
      onClick: () => setQuaternionMode(false),
    },
    {
      key: 'quaternion',
      value: 'Quaternion',
      isSelected: quaternionMode,
      onClick: () => setQuaternionMode(true),
    },
  ];

  return (
    <div className={cx('panel-inner')}>
      <div className={titleClasses}>{name}</div>
      <IconWrapper
        className={iconClasses}
        icon={SvgPath.ChevronLeft}
        onClick={() => setIsModeSelectOpen(!isModeSelectOpen)}
        hasFrame={false}
      />
      <div className={cx('input-group')}>
        <Fragment>
          {isModeSelectOpen ? (
            <div className={cx('segment')}>
              <Segment list={modeList} />
            </div>
          ) : quaternionMode ? (
            _.map(quaternionList, (item, idx) => {
              const key = `${item.key}_${idx}`;
              return (
                <CPInput
                  key={key}
                  innerRef={inputRef}
                  value={item.value as number}
                  prefix={item.prefix}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyPress={handleKeyPress}
                  onKeyDown={handleKeyDown}
                  name={item.name}
                />
              );
            })
          ) : (
            _.map(valueList, (item, idx) => {
              const key = `${item.key}_${idx}`;
              return (
                <CPInput
                  key={key}
                  innerRef={inputRef}
                  value={item.value}
                  prefix={item.prefix}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyPress={handleKeyPress}
                  onKeyDown={handleKeyDown}
                  name={item.name}
                />
              );
            })
          )}
        </Fragment>
      </div>
    </div>
  );
};
export const CPListRowInput = React.memo(CPListRowInputComponent);
