import { FunctionComponent, memo, useEffect, useState } from 'react';
import _ from 'lodash';
import { useSelector } from 'reducers';
import { ShootLayer, ShootTrack } from 'types/common';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const TimelinePanel: FunctionComponent = () => {
  const assetList = useSelector((state) => state.shootProject.assetList);
  const selectedTargets = useSelector((state) => state.selectingData.selectedTargets);
  const animationIngredients = useSelector((state) => state.animationIngredients);

  const [layers, setLayers] = useState<ShootLayer[]>([]);
  const [tracks, setTracks] = useState<ShootTrack[]>([]);

  useEffect(() => {
    const selectedTargetIds = selectedTargets.map((target) => target.id);
    const selectedAssetIds = _.uniq(selectedTargets.map((target) => target.id.split('//')[0]));
    const targetAssets = assetList.filter((asset) => selectedAssetIds.includes(asset.id));

    const totalLayers: ShootLayer[] = [];
    const totalTracks: ShootTrack[] = [];

    targetAssets.forEach((asset) => {
      const { id: assetId } = asset;

      const currentAnimationIngredient = animationIngredients.find(
        (anim) => anim.assetId === assetId && anim.current,
      );

      if (currentAnimationIngredient) {
        currentAnimationIngredient.layers.forEach((layer) => {
          totalLayers.push(layer);
        });

        currentAnimationIngredient.tracks.forEach((track) => {
          if (selectedTargetIds.includes(track.targetId)) {
            totalTracks.push(track);
          }
        });
      }
    });

    setLayers(totalLayers);
    setTracks(totalTracks);
  }, [animationIngredients, assetList, selectedTargets]);

  const editKeyframe = () => {};
  const deleteKeyframe = () => {};
  const copyKeyframe = () => {};
  const pasteKeyframe = () => {};
  const addLayer = () => {};
  const deleteLayer = () => {};

  return (
    <div className={cx('wrapper')}>
      {/* layer 선택  */}
      <div className={cx('first')}>
        <div className={cx('title')}>{`Layers (${layers.length})`}</div>
        {layers.map((layer) => {
          return (
            <button className={cx('button')} key={layer.id}>
              {layer.name}
            </button>
          );
        })}
      </div>
      {/* selectedTargets에 해당하는 track들 표시 */}
      <div className={cx('second')}>
        <div className={cx('title')}>{`Tracks (${tracks.length})`}</div>
        {tracks.map((track) => {
          return (
            <div
              className={cx('track')}
              key={`${track.layerId}&${track.targetId}&${track.property}&${track.axis}`}
            >
              {`${track.target.name}//${track.property}//${track.axis}`}
            </div>
          );
        })}
      </div>
      {/* 키프레임 편집 혹은 삭제 시 대상이 되는 frame */}
      <div className={cx('third')}>
        <div className={cx('title')}>Frame</div>
        <input className={cx('input')} type="number" placeholder="type target frame" />
      </div>
      {/* 키프레임 관련 조작 버튼 */}
      <div className={cx('fourth')}>
        <div className={cx('title')}>Control</div>
        <button className={cx('button')} onClick={editKeyframe}>
          Edit Keyframe
        </button>
        <button className={cx('button')} onClick={deleteKeyframe}>
          Delete Keyframe
        </button>
        <button className={cx('button')} onClick={copyKeyframe}>
          Copy Keyframe
        </button>
        <button className={cx('button')} onClick={pasteKeyframe}>
          Paste Keyframe
        </button>
        <button className={cx('button')} onClick={addLayer}>
          Add Layer
        </button>
        <button className={cx('button')} onClick={deleteLayer}>
          Delete Layer
        </button>
      </div>
    </div>
  );
};

export default memo(TimelinePanel);
