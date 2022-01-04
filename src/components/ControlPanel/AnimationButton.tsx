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
  activeStatus?: boolean;
}

const cx = classNames.bind(styles);

const AnimationButton: FunctionComponent<Props> = ({ className, buttonInfo, activeStatus }) => {
  // 버튼이 활성화 되었는지 확인하여 css 스타일을 변경하기 위한 상태
  const [activeButton, setActiveButton] = useState<string>(buttonInfo[0].text);

  const classes = cx('wrapper', className);

  return (
    <div className={cx(classes)}>
      {buttonInfo.map((info, idx) => {
        return (
          <button
            className={cx({ active: activeButton === info.text }, { disable: !activeStatus })}
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
