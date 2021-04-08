import _ from 'lodash';
import React, { FunctionComponent, useState, useRef, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './Segment.module.scss';

const cx = classNames.bind(styles);

interface BaseProps {
  objList?: any;
}

export type Props = BaseProps;

const Segment: FunctionComponent<Props> = ({ objList }) => {
  const [selected, setSelected] = useState<Number>(0);
  const targetIDRef = useRef(selected);

  const handleClick = (e: any) => {
    const targetID = Number(e.target.id);
    setSelected(targetID);
  };

  useEffect(() => {
    targetIDRef.current = selected;
  }, [selected]);

  const obj = _.map(objList, (item, idx) => (
    <React.Fragment key={item.id}>
      <div
        role="button"
        onClick={handleClick}
        onKeyPress={handleClick}
        id={String(idx)}
        tabIndex={Number(idx)}
        className={cx('segment', Number(selected) === Number(idx) ? cx('active') : undefined)}
      >
        {item.contents}
      </div>
    </React.Fragment>
  ));
  return <div className={cx('segment-wrap')}>{obj}</div>;
};

export default Segment;
