import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { IconWrapper, SvgPath } from 'components/Icon';
import detectSafari from 'utils/common/detectSafari';
import * as modeSelectionActions from 'actions/modeSelection';

const Record = () => {
  const dispatch = useDispatch();

  const handleRecord = useCallback(() => {
    if (detectSafari()) return;
    dispatch(modeSelectionActions.setMode({ mode: 'videoMode' }));
  }, [dispatch]);

  return <IconWrapper hasFrame={false} icon={SvgPath.Record} onClick={handleRecord} />;
};

export default Record;
