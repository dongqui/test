import { FunctionComponent, memo, useCallback, useMemo, useState } from 'react';
import ListGroup from './ListGroup';
import { LPItemListType, LPItemType } from 'types/LP';
import _ from 'lodash';
import classNames from 'classnames/bind';
import styles from './ListView.module.scss';
import { useSelector } from 'reducers';

const cx = classNames.bind(styles);

export interface ListViewProps {
  data: LPItemListType;
  expandedKeys: string[];
}

export type GrouppedData = Array<LPItemListType>;

const ListView: FunctionComponent<ListViewProps> = ({ data, expandedKeys }) => {
  // const expandedKeys = useSelector((state) => state.lpData.expandedKeys);
  const unExpandedKeys = data
    .filter((item) => !expandedKeys.includes(item.key))
    .map((item) => item.key);

  /**
   * 그룹별로 묶는 가공을 거친 데이터입니다.
   * @return 그룹별 가공 후 데이터
   */
  const grouppedData = useMemo((): GrouppedData => {
    const groupKey: keyof LPItemType = 'groupKey';
    const groupKeys: string[] = Object.keys(_.groupBy(data, groupKey));
    const result = _.map(groupKeys, (groupKey) =>
      data.filter((item) => item.groupKey === groupKey),
    );
    return result;
  }, [data]);

  return (
    <div className={cx('wrapper')}>
      {_.map(grouppedData, (items, index) => {
        const key = `${items.length}_${index}`;
        return (
          <ListGroup
            key={key}
            items={items}
            expandedKeys={expandedKeys}
            unExpandedKeys={unExpandedKeys}
          />
        );
      })}
    </div>
  );
};

export default memo(ListView);
