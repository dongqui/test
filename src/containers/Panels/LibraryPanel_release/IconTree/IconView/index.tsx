import { FunctionComponent, memo } from 'react';
import _ from 'lodash';
import IconNode from './IconNode';
import classNames from 'classnames/bind';
import styles from './index.module.scss';
import { LPItemListType } from 'types/LP';

const cx = classNames.bind(styles);

export interface IconViewProps {
  data: LPItemListType;
}

const IconView: FunctionComponent<IconViewProps> = ({ data }) => {
  return (
    <div className={cx('wrapper')}>
      {_.map(data, (item, index) => {
        const key = `${item.parentKey}_${item.name}_${index}`;
        return <IconNode key={key} item={item} />;
      })}
    </div>
  );
};
export default memo(IconView);
