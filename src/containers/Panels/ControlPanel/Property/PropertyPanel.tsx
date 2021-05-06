import { FunctionComponent, Fragment } from 'react';
import { useReactiveVar } from '@apollo/client';
import { AccordionMenu } from 'components/New_AccordionMenu';
import { storeCPData } from 'lib/store';
import _ from 'lodash';
import classNames from 'classnames/bind';
import styles from './PropertyPanel.module.scss';
import { CPComponentType, CPDataPropertyNames } from 'types/CP';
import { CPListRowInput } from './CPListTree/CPListRowInput';
import { CPListRowButton } from './CPListTree/CPListRowButton';

const cx = classNames.bind(styles);

const PropertyPanel: FunctionComponent<{}> = ({}) => {
  const cpData = useReactiveVar(storeCPData);

  return (
    <div className={cx('panel-wrap')}>
      <section className={cx('panel-transform')}>
        <AccordionMenu title="Transform">
          {_.map(cpData, (item, idx) => (
            <Fragment key={`transform-${idx}`}>
              <div className={cx('transform-group')}>
                {_.isEqual(item.type, CPComponentType.input) &&
                  _.find(cpData, [CPDataPropertyNames.key, item?.parentKey])?.isExpanded && (
                    <Fragment>
                      <CPListRowInput
                        rowKey={item.key}
                        name={item.name}
                        w={item.w}
                        x={item.x}
                        y={item.y}
                        z={item.z}
                      />
                    </Fragment>
                  )}
              </div>
            </Fragment>
          ))}
        </AccordionMenu>
      </section>
      <section className={cx('panel-visibility')}>
        <AccordionMenu title="Visibility">
          {_.map(cpData, (item, idx) => (
            <Fragment key={`visibility-${idx}`}>
              <div className={cx('transform-group')}>
                {_.isEqual(item.type, CPComponentType.select) &&
                  _.find(cpData, [CPDataPropertyNames.key, item?.parentKey])?.isExpanded && (
                    <Fragment>
                      <CPListRowButton rowKey={item.key} name={item.name} button={item.button} />
                    </Fragment>
                  )}
              </div>
            </Fragment>
          ))}
        </AccordionMenu>
      </section>
    </div>
  );
};

export default PropertyPanel;
