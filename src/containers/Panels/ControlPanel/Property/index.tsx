import { FunctionComponent, memo } from 'react';
import _ from 'lodash';
import { useReactiveVar } from '@apollo/client';
import { AccordionMenu } from 'components/AccordionMenu';
import { storeCPData } from 'lib/store';
import { CPComponentType, CPDataPropertyNames } from 'types/CP';
import { CPListRowInput } from './CPListTree/CPListRowInput';
import { CPListRowButton } from './CPListTree/CPListRowButton';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const PropertyPanel: FunctionComponent = () => {
  const cpData = useReactiveVar(storeCPData);

  return (
    <div className={cx('panel-wrap')}>
      <div className={cx('panel-transform')}>
        <AccordionMenu title="Transform">
          {_.map(cpData, (item, idx) => (
            <div className={cx('transform-group')} key={`transform-${idx}`}>
              {_.isEqual(item.type, CPComponentType.input) &&
                _.find(cpData, [CPDataPropertyNames.key, item?.parentKey])?.isExpanded && (
                  <CPListRowInput
                    rowKey={item.key}
                    name={item.name}
                    w={item.w}
                    x={item.x}
                    y={item.y}
                    z={item.z}
                  />
                )}
            </div>
          ))}
        </AccordionMenu>
      </div>
      <div className={cx('panel-visibility')}>
        <AccordionMenu title="Visibility">
          {_.map(cpData, (item, idx) => (
            <div className={cx('transform-group')} key={`visibility-${idx}`}>
              {_.isEqual(item.type, CPComponentType.select) &&
                _.find(cpData, [CPDataPropertyNames.key, item?.parentKey])?.isExpanded && (
                  <CPListRowButton rowKey={item.key} name={item.name} button={item.button} />
                )}
            </div>
          ))}
        </AccordionMenu>
      </div>
    </div>
  );
};

export default memo(PropertyPanel);
