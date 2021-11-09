import { FunctionComponent, memo } from 'react';
// import _ from 'lodash';
// import { AccordionMenu } from 'components/AccordionMenu';
// import { CP_ITEMS } from 'utils/const';
// import { PropertyType } from 'types';
// import PropertyInput from './PropertyInput';
// import PropertyButton from './PropertyButton';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const PropertyTab: FunctionComponent = () => {
  return (
    <div className={cx('panel-wrap')}>
      <div className={cx('panel-transform')}>
        {/* <AccordionMenu title="Transform">
          {_.map(CP_ITEMS, (item, idx) => (
            <div className={cx('transform-group')} key={`transform-${idx}`}>
              {item.type === 'input' && _.find(CP_ITEMS, ['key', item?.parentKey])?.isExpanded && (
                <PropertyInput rowKey={item.key} name={item.name as PropertyType} />
              )}
            </div>
          ))}
        </AccordionMenu> */}
      </div>
      <div className={cx('panel-visibility')}>
        {/* <AccordionMenu title="Visibility">
          {_.map(CP_ITEMS, (item, idx) => (
            <div className={cx('transform-group')} key={`visibility-${idx}`}>
              {_.isEqual(item.type, 'select') &&
                _.find(CP_ITEMS, ['key', item?.parentKey])?.isExpanded && (
                  <PropertyButton rowKey={item.key} name={item.name} button={item.button} />
                )}
            </div>
          ))}
        </AccordionMenu> */}
      </div>
    </div>
  );
};

export default memo(PropertyTab);
