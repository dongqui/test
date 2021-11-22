import { FunctionComponent, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './AnimationButton.module.scss';

export type ButtonInfo = {
  text: string;
  func: () => void;
};

interface Props {
  className?: string;
  buttonInfo: ButtonInfo[];
}

const cx = classNames.bind(styles);

const AnimationButton: FunctionComponent<Props> = ({ className, buttonInfo }) => {
  const [activeButton, setActiveButton] = useState<string>(buttonInfo[0].text);

  const classes = cx('wrapper', className);

  return (
    <div className={cx(classes)}>
      {buttonInfo.map((info, idx) => {
        return (
          <button
            className={cx({ active: activeButton === info.text }, 'disable')}
            key={idx}
            onClick={() => {
              info.func();
              setActiveButton(info.text);
            }}
          >
            {info.text}
          </button>
        );
      })}
    </div>
  );
};

export default AnimationButton;
