import { memo, MouseEvent, useRef, useState } from 'react';

import classNames from 'classnames/bind';
import styles from './SwitchButton.module.scss';

const cx = classNames.bind(styles);

// Since it is input component, it has value and label separately.
interface Option {
  key: string;
  value: string;
  label: string;
}

type Props = {
  options: { content: string; onClick: (e?: MouseEvent<HTMLDivElement>, index?: number, content?: string) => void }[];
  type?: 'default' | 'primary';
  disabled?: boolean;
  fullSize?: boolean;
  defaultIndex?: number;
};

const SwitchButton = ({ defaultIndex = 0, disabled = false, fullSize = false, options, type = 'default' }: Props) => {
  // set to default index only if that index exists on options
  const [selected, setSelected] = useState(options.length > defaultIndex ? defaultIndex : 0);
  const wrapperRef = useRef<HTMLDivElement>(null);

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
      <div className={cx('btn-select', type)} style={{ width: `${100 / options.length}%`, left: `${(100 / options.length) * selected}%` }} />
      {options.map((value, index) => (
        <div className={cx('btn', { fullsize: fullSize, disabled, selected: index === selected })} key={`${value.content}.${index}`} onClick={(e) => buttonClickHandler(e, index)}>
          {/*for hover text above button-select-effect*/}
          <span className={cx('btn-text')}>{value.content}</span>
          {/*for keep div size behind the button-select-effect due to overlayed text*/}
          <span className={cx('padding')}>{value.content}</span>
          <input type="radio" value={value.content} defaultChecked={index === selected} />
        </div>
      ))}
    </div>
  );
};

export default memo(SwitchButton);
