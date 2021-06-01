import { FunctionComponent, memo, useMemo } from 'react';
import _ from 'lodash';
import classNames from 'classnames/bind';
import styles from './ListView.module.scss';
import { LPItemsState } from 'actions/lpData';

const cx = classNames.bind(styles);

export interface ListViewProps {
  data: LPItemsState;
}

export interface GrouppedData extends Array<LPItemsState> {}

const ListView: FunctionComponent<ListViewProps> = ({ data }) => {
  /**
   * 그룹별로 묶는 가공을 거친 데이터입니다.
   * @return 그룹별 가공 후 데이터
   */
  const grouppedData = useMemo((): GrouppedData => {
    const groupKeys: string[] = Object.keys(_.groupBy(data, 'groupKey'));
    const result: GrouppedData = _.map(groupKeys, (groupKey) =>
      data.filter((item) => item.groupKey === groupKey),
    );
    console.log('result', result);
    return result;
  }, [data]);

  return <div className={cx('wrapper')}></div>;
};

export default memo(ListView);
