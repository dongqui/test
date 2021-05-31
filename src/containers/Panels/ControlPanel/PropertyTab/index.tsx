import { FunctionComponent, memo } from 'react';
import _ from 'lodash';
import { AccordionMenu } from 'components/AccordionMenu';
import CPListRowInput from './CPListTree/CPListRowInput';
import CPListRowButton from './CPListTree/CPListRowButton';
import classNames from 'classnames/bind';
import styles from './index.module.scss';
import { CP_ITEMS } from 'utils/const';

const cx = classNames.bind(styles);

const PropertyTab: FunctionComponent = () => {
  return (
    <div className={cx('panel-wrap')}>
      <div className={cx('panel-transform')}>
        <AccordionMenu title="Transform">
          {_.map(CP_ITEMS, (item, idx) => (
            <div className={cx('transform-group')} key={`transform-${idx}`}>
              {_.isEqual(item.type, 'input') &&
                _.find(CP_ITEMS, ['key', item?.parentKey])?.isExpanded && (
                  <CPListRowInput rowKey={item.key} name={item.name} />
                )}
            </div>
          ))}
        </AccordionMenu>
      </div>
      <div className={cx('panel-visibility')}>
        <AccordionMenu title="Visibility">
          {_.map(CP_ITEMS, (item, idx) => (
            <div className={cx('transform-group')} key={`visibility-${idx}`}>
              {_.isEqual(item.type, 'select') &&
                _.find(CP_ITEMS, ['key', item?.parentKey])?.isExpanded && (
                  <CPListRowButton rowKey={item.key} name={item.name} button={item.button} />
                )}
            </div>
          ))}
        </AccordionMenu>
      </div>
    </div>
  );
};

export default memo(PropertyTab);
