import { memo, MouseEvent, useEffect, useRef, useState } from 'react';

import classNames from 'classnames/bind';
import styles from './SwitchButton.module.scss';

const cx = classNames.bind(styles);

interface BaseProps {
  options: { content: string; onClick: (e?: MouseEvent, index?: number, content?: string) => void }[];
  type?: 'default' | 'primary';
  disabled?: boolean;
  fullSize?: boolean;
  defaultIndex?: number;
}

type Props = BaseProps;

const defaultProps: Partial<Props> = {
  type: 'default',
  disabled: false,
  fullSize: false,
  defaultIndex: 0,
};

const SwitchButton = (props: Props) => {
  const { defaultIndex, disabled, fullSize, options, type } = props;
  // set to default index only if that index exists on options
  const [selected, setSelected] = useState((options.length > defaultIndex! ? defaultIndex : 0) ?? 0);
  const [effectWidth, setEffectWidth] = useState(0);
  const [effectPosition, setEffectPosition] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  // dynamically calculate width and left position
  useEffect(() => {
    if (wrapperRef.current) {
      const wrapperChildren = wrapperRef.current.children;
      const wrapperChildrenMap = Array.from(Array(options.length))
        .map((_, i) => i)
        .map((i) => {
          return wrapperChildren.item(i);
        })
        .slice(1, selected + 1);
      const selectedItem = wrapperChildren.item(selected + 1);
      if (selectedItem) {
        setEffectWidth(selectedItem.getBoundingClientRect().width);
        setEffectPosition(
          wrapperChildrenMap.reduce((prev, curr) => {
            let sum = prev;
            if (curr) {
              sum += curr.getBoundingClientRect().width;
            }
            return sum;
          }, 0),
        );
      } else {
        setEffectWidth(wrapperRef.current.getBoundingClientRect().width / options.length);
        setEffectPosition((wrapperRef.current.getBoundingClientRect().width / options.length) * selected);
      }
    }
  }, [wrapperRef, selected, options, fullSize]);

  const classes = cx('btn-group', { fullsize: fullSize, disabled });
  const buttonClickHandler = (e: MouseEvent<HTMLDivElement>, index: number) => {
    // active when press another button and not disabled
    if (selected !== index && !disabled) {
      setSelected(index);
      if (options[index]) {
        options[index].onClick(e, index, options[index].content);
      }
    }
  };

  return (
    <div className={classes} ref={wrapperRef}>
      <div className={cx('btn-select', type)} style={{ width: `${effectWidth}px`, left: `${effectPosition}px` }} />
      {options.map((value, index) => (
        <div className={cx('btn', type, { fullsize: fullSize, disabled, selected: index === selected })} key={`${value}.${index}`} onClick={(e) => buttonClickHandler(e, index)}>
          {/*for hover text above button-select-effect*/}
          <span className={cx('btn-text')}>{value.content}</span>
          {/*for keep div size behind the button-select-effect due to overlayed text*/}
          <span className={cx('padding')}>{value.content}</span>
        </div>
      ))}
    </div>
  );
};

SwitchButton.defaultProps = defaultProps;

export default memo(SwitchButton);
