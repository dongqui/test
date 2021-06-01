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
   * 아이콘뷰로 전달할 가공데이터입니다.
   * @return 검색어 필터링 후 lpModelDataList
   */
  const groupppedData = useMemo((): GrouppedData => {
    return [];
  }, []);

  return <div className={cx('wrapper')}></div>;
};

export default memo(ListView);
