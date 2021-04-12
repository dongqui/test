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
  const [selected, setSelected] = useState<number>(0);
  const targetIDRef = useRef(selected);

  const handleClick = (e: any) => {
    const targetID = e.target.id;
    setSelected(targetID);
  };

  useEffect(() => {
    targetIDRef.current = selected;
  }, [selected]);

  const obj = _.map(objList, (item, idx: number) => (
    <React.Fragment key={item.id}>
      <div
        role="button"
        onClick={handleClick}
        onKeyPress={handleClick}
        id={String(idx)}
        tabIndex={idx}
        className={cx('segment', Number(selected) === idx ? cx('active') : undefined)}
      >
        {item.contents}
      </div>
    </React.Fragment>
  ));
  return <div className={cx('segment-wrap')}>{obj}</div>;
};

export default Segment;
