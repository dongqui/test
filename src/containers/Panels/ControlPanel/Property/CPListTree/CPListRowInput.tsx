import React, { useCallback, useEffect, useState, useRef, Fragment } from 'react';
import { useReactiveVar } from '@apollo/client';
import { CPNameType } from 'types/CP';
import { RenderingDataPropertyName } from 'types/RP';
import {
  fnChangeBonePosition,
  fnChangeBoneRotation,
  fnChangeBoneScale,
} from 'utils/CP/transformUtils';
import { IconWrapper, SvgPath } from 'components/New_Icon';
import { storeCurrentBone, storeTransformControls } from 'lib/store';
import { CPInput } from './CPInput';
import { Segment } from 'components/New_Segment';
import _ from 'lodash';
import classNames from 'classnames/bind';
import styles from './CPListRowInput.module.scss';
import fnConvertEulerToDegree from 'utils/common/fnConvertEulerToDegree';
import fnConvertDegreeToEuler from 'utils/common/fnConvertDegreeToEuler';

const cx = classNames.bind(styles);

export interface CPListRowInputProps {
  rowKey: string;
  name: string;
  w?: RenderingDataPropertyName.QuaternionW;
  x?:
    | RenderingDataPropertyName.QuaternionX
    | RenderingDataPropertyName.positionX
    | RenderingDataPropertyName.rotationX
    | RenderingDataPropertyName.scaleX;
  y?:
    | RenderingDataPropertyName.QuaternionY
    | RenderingDataPropertyName.positionY
    | RenderingDataPropertyName.rotationY
    | RenderingDataPropertyName.scaleY;
  z?:
    | RenderingDataPropertyName.QuaternionZ
    | RenderingDataPropertyName.positionZ
    | RenderingDataPropertyName.rotationZ
    | RenderingDataPropertyName.scaleZ;
}

const CPListRowInputComponent: React.FC<CPListRowInputProps> = ({
  name,
  w = RenderingDataPropertyName.QuaternionW,
  x = RenderingDataPropertyName.positionX,
  y = RenderingDataPropertyName.positionY,
  z = RenderingDataPropertyName.positionZ,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const currentBone = useReactiveVar(storeCurrentBone);
  const transformControls = useReactiveVar(storeTransformControls);

  const [initialValue, setInitialValue] = useState({
    x: 0,
    y: 0,
    z: 0,
  });

  const [values, setValue] = useState(initialValue);

  const [quaternionMode, setQuaternionMode] = useState(false);
  const [quaternionTab, setQuaternionTab] = useState(false);

  const handleBlur = useCallback(
    (e: any) => {
      const value = e.target.value;
      const name = inputRef.current?.name;
      const property = name?.slice(0, -1);
      const axis: any = name?.slice(-1).toLowerCase();
      switch (property) {
        case 'position':
          if (currentBone) {
            fnChangeBonePosition({ targetBone: currentBone, axis, value });
          }
          break;
        case 'rotation':
          if (currentBone) {
            fnChangeBoneRotation({
              targetBone: currentBone,
              axis,
              value: fnConvertDegreeToEuler({ degreeValue: value }),
            });
          }
          break;
        case 'scale':
          if (currentBone) {
            fnChangeBoneScale({ targetBone: currentBone, axis, value });
          }
          break;
      }
    },
    [currentBone],
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
        if (_.isEqual(name, CPNameType.Scale)) {
          setInitialValue({
            x: targetObject?.scale?.x ? _.round(targetObject?.scale?.x, 4) : 0,
            y: targetObject?.scale?.y ? _.round(targetObject?.scale?.y, 4) : 0,
            z: targetObject?.scale?.z ? _.round(targetObject?.scale?.z, 4) : 0,
          });
        }
      };
      transformControls.addEventListener('objectChange', handleObjectChange);
      return () => {
        transformControls.removeEventListener('objectChange', handleObjectChange);
      };
    }
  }, [name, transformControls]);

  useEffect(() => {
    if (_.isEqual(name, CPNameType.Position)) {
      setInitialValue({
        x: currentBone?.position?.x ? _.round(currentBone?.position?.x, 4) : 0,
        y: currentBone?.position?.y ? _.round(currentBone?.position?.y, 4) : 0,
        z: currentBone?.position?.z ? _.round(currentBone?.position?.z, 4) : 0,
      });
    }
    if (_.isEqual(name, CPNameType.Rotation)) {
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
    if (_.isEqual(name, CPNameType.Scale)) {
      setInitialValue({
        x: currentBone?.scale?.x ? _.round(currentBone?.scale?.x, 4) : 0,
        y: currentBone?.scale?.y ? _.round(currentBone?.scale?.y, 4) : 0,
        z: currentBone?.scale?.z ? _.round(currentBone?.scale?.z, 4) : 0,
      });
    }
  }, [currentBone, name]);

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
    { key: w, value: values.z, name: w, prefix: 'W' },
    { key: x, value: values.x, name: x, prefix: 'X' },
    { key: y, value: values.y, name: y, prefix: 'Y' },
    { key: z, value: values.z, name: z, prefix: 'Z' },
  ];

  const iconClasses = cx('icon', {
    rotation: _.isEqual(name, 'Rotation'),
    quaternion: quaternionMode,
  });

  const titleClasses = cx('property-title', {
    quaternionMode: quaternionTab,
  });

  const modeList = [
    {
      key: 'euler',
      value: 'Euler',
      isSelected: !quaternionTab,
      onClick: () => setQuaternionTab(false),
    },
    {
      key: 'quaternion',
      value: 'Quaternion',
      isSelected: quaternionTab,
      onClick: () => setQuaternionTab(true),
    },
  ];

  return (
    <div className={cx('panel-inner')}>
      <div className={titleClasses}>{name}</div>
      <IconWrapper
        className={iconClasses}
        icon={SvgPath.ChevronLeft}
        onClick={() => setQuaternionMode(!quaternionMode)}
        hasFrame={false}
      />
      <div className={cx('input-group')}>
        <Fragment>
          {quaternionMode ? (
            <div>
              <Segment list={modeList} />
            </div>
          ) : quaternionTab ? (
            _.map(quaternionList, (item, idx) => {
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
