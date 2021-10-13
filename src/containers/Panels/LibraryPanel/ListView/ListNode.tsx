import { FunctionComponent, ReactNode, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { IconWrapper, SvgPath } from 'components/Icon';
import * as lpNodeActions from 'actions/LP/lpNodeAction';
import classNames from 'classnames/bind';
import styles from './ListNode.module.scss';

// 임시 추가
import { useSelector } from 'reducers';
import * as shootProjectActions from 'actions/shootProjectAction';

const cx = classNames.bind(styles);

interface Props {
  type: 'Folder' | 'Model' | 'Motion';
  name: ReactNode;
  fileURL: string | File;
}

const ListNode: FunctionComponent<Props> = ({ type, name, fileURL }) => {
  const { assetList, visualizedAssetIds } = useSelector((state) => state.shootProject);

  const dispatch = useDispatch();

  const arrowClasses = cx('icon-arrow', {
    invisible: type === 'Motion',
  });

  const handleArrowClick = useCallback(() => {
    dispatch(lpNodeActions.visualize(fileURL));
  }, [dispatch, fileURL]);

  const dummyArrowClick = useCallback(
    (event: MouseEvent) => {
      const targetAsset = assetList[0];
      // assetId를 사용해서 node를 생성하신 후, 위의 코드를 아래의 코드로 변경하면 됩니다.
      // const targetAsset = assetList.find((asset) => asset.id === assetId)

      // render/unrender 기능 구현을 임의로 click/altClick으로 구분해두었습니다.
      if (event.altKey) {
        if (targetAsset && visualizedAssetIds.includes(targetAsset.id)) {
          dispatch(shootProjectActions.unrenderAsset({ assetId: targetAsset.id }));
        }
      } else {
        // 이미 render된 asset이 아닌 경우에만
        if (targetAsset && !visualizedAssetIds.includes(targetAsset.id)) {
          dispatch(shootProjectActions.renderAsset({ assetId: targetAsset.id }));
        }
      }
    },
    [assetList, dispatch, visualizedAssetIds],
  );

  return (
    <div className={cx('wrapper')}>
      <IconWrapper icon={SvgPath.FilledArrow} className={arrowClasses} onClick={dummyArrowClick} />
      <IconWrapper icon={SvgPath[type]} className={cx('icon-type')} />
      <div className={cx('name')}>{name}</div>
    </div>
  );
};

export default ListNode;
