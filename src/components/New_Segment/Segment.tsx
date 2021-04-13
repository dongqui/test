import { FunctionComponent, Fragment, ReactNode, ButtonHTMLAttributes, memo } from 'react';
import _ from 'lodash';
import classNames from 'classnames/bind';
import styles from './Segment.module.scss';

const cx = classNames.bind(styles);

interface SegmentItem {
  key: string;
  value: ReactNode;
  isSelected: boolean;
  onClick: (key: string) => void;
}

interface BaseProps {
  list: SegmentItem[];
}

export type Props = BaseProps & ButtonHTMLAttributes<HTMLButtonElement>;

const Segment: FunctionComponent<Props> = ({ list }) => {
  const child = _.map(list, (item, idx: number) => {
    const handleClick = () => {
      item.onClick(item.key);
    };

    const buttonClasses = cx('segment', {
      active: item.isSelected,
    });
    return (
      <div
        role="button"
        className={buttonClasses}
        key={item.key}
        id={item.key}
        tabIndex={idx}
        onKeyPress={handleClick}
        onClick={handleClick}
      >
        {item.value}
      </div>
    );
  });
  return <div className={cx('segment-wrap')}>{child}</div>;
};

export default memo(Segment);
