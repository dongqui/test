import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { clickInterpolationMode } from 'actions/trackList';
import { InterpolationType } from 'types/TP_New/track';
import { useSelector } from 'reducers';
import { IconWrapper, SvgPath } from 'components/Icon';

import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const InterpolationMode = () => {
  const dispatch = useDispatch();
  const interpolationType = useSelector((state) => state.trackList.interpolationType);
  const selectedTransforms = useSelector((state) => state.trackList.selectedTransforms);

  const handleModeButtonClick = useCallback(
    (type: InterpolationType) => () => {
      if (!selectedTransforms.length) return;
      const payload = { interpolationType: type };
      dispatch(clickInterpolationMode(payload));
    },
    [dispatch, selectedTransforms.length],
  );

  return (
    <div className={cx('interpolation-mode')}>
      <IconWrapper
        className={cx({ bezier: interpolationType === 'bezier' })}
        icon={SvgPath.Bezier}
        hasFrame={false}
        onClick={handleModeButtonClick('bezier')}
      />
      <IconWrapper
        className={cx({ linear: interpolationType === 'linear' })}
        icon={SvgPath.Linear}
        hasFrame={false}
        onClick={handleModeButtonClick('linear')}
      />
      <IconWrapper
        className={cx({ constant: interpolationType === 'constant' })}
        icon={SvgPath.Constant}
        hasFrame={false}
        onClick={handleModeButtonClick('constant')}
      />
    </div>
  );
};

export default InterpolationMode;
