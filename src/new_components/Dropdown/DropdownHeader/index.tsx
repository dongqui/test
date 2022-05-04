import { useCallback, useContext, FunctionComponent } from 'react';

import { DropdownContext } from '../DropdownProvider';

import classNames from 'classnames/bind';
import styles from './index.module.scss';
import { SvgPath } from '../../../components/Icon';
import { ONBOARDING_ID } from '../../../containers/Onboarding/id';
import { ExpandButton } from '../../../components/Button';

const cx = classNames.bind(styles);

interface Props {
  onClose?: (params?: any) => void;
}

const DropdownHeader: FunctionComponent<Props> = (props) => {
  const { children, onClose } = props;

  const [{ isOpenMenu }, dispatch] = useContext(DropdownContext);

  // 드랍다운 헤더 클릭
  const handleClickDropdownHeader = useCallback(() => {
    dispatch('changeIsOpenMenu', { isOpenMenu: !isOpenMenu });
    if (isOpenMenu && onClose) {
      onClose();
    }
  }, [isOpenMenu, dispatch, onClose]);

  return <ExpandButton content={SvgPath.Support} variant="default" id={ONBOARDING_ID.HELP_BUTTON} onClick={handleClickDropdownHeader} />;
};

export default DropdownHeader;
