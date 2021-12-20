import { ChangeEvent, FunctionComponent, memo, useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'reducers';
import { isUndefined, range, uniq } from 'lodash';
import produce from 'immer';
import { AnimationIngredient, PlaskLayer, PlaskTrack } from 'types/common';
import * as animationDataActions from 'actions/animationDataAction';
import { createPlaskTrack, getInterpolatedQuaternion, getInterpolatedVector, getValueInsertedTransformKeys } from 'utils/RP';
import { getRandomStringKey, roundToFourth } from 'utils/common';
import classNames from 'classnames/bind';
import styles from './index.module.scss';

const cx = classNames.bind(styles);

const DUMMY_DELETE_FRAME = roundToFourth(3 / 30);
const DUMMY_DELETE_FRAMES = range(1, 100).map((num) => roundToFourth(num / 30));

const TimelinePanel: FunctionComponent = () => {
  const assetList = useSelector((state) => state.plaskProject.assetList);
  const visualizedAssetIds = useSelector((state) => state.plaskProject.visualizedAssetIds);
  const fps = useSelector((state) => state.plaskProject.fps);
  const selectedTargets = useSelector((state) => state.selectingData.selectedTargets);
  const animationIngredients = useSelector((state) => state.animationData.animationIngredients);

  // 선택된 target들이 가진 layers, tracks만 남긴 배열들
  const [layers, setLayers] = useState<PlaskLayer[]>([]);
  const [tracks, setTracks] = useState<PlaskTrack[]>([]);

  const [targetLayerId, setTargetLayerId] = useState<string>();
  const [targetFrame, setTargetFrame] = useState<number>();
  const [deleteTargetTrackIds, setDeleteTargetTrackIds] = useState<string[]>([]);

  const [newLayerName, setNewLayerName] = useState('');

  const dispatch = useDispatch();

  // temp comment
  // useEffect(() => {
  //   console.log('layers: ', layers);
  //   console.log('tracks: ', tracks);
  // }, [layers, tracks]);

  useEffect(() => {
    const selectedTargetIds = selectedTargets.map((target) => target.id);
    const selectedAssetIds = uniq(selectedTargets.map((target) => target.id.split('//')[0]));
    const targetAssets = assetList.filter((asset) => selectedAssetIds.includes(asset.id));

    const totalLayers: PlaskLayer[] = [];
    const totalTracks: PlaskTrack[] = [];

    targetAssets.forEach((asset) => {
      const { id: assetId } = asset;

      const currentAnimationIngredient = animationIngredients.find((anim) => anim.assetId === assetId && anim.current);

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

  const editKeyframes = useCallback(() => {
    if (targetLayerId && !isUndefined(targetFrame)) {
      // 선택된 targets의 tracks 중 layer 또한 선택된 layer와 일치하는 track들
      const targetLayerTracks = tracks.filter((track) => track.layerId === targetLayerId);

      // temp comment
      // console.log('targetLayerTracks: ', targetLayerTracks);
      // console.log('targetFrame: ', targetFrame);

      // new 값들 insert
      const newAnimationIngredients = produce(animationIngredients, (draft) => {
        // track들 돌면서 다른 layer에 같은 track있는지 확인
        targetLayerTracks.forEach((track) => {
          const { position, rotationQuaternion, scaling } = track.target;
          const rotation = rotationQuaternion!.toEulerAngles(); // quaternion 회전 사용하기 때문에 직접 구해줘야 함

          const newPosition = position.clone();
          const newRotationQuaternion = rotationQuaternion!.clone();
          const newRotation = rotation.clone();
          const newScaling = scaling.clone();

          // 같은 대상에 대한 다른 layer의 트랙들
          const otherLayerTracks = tracks.filter((t) => t.targetId === track.targetId && t.layerId !== targetLayerId);

          otherLayerTracks.forEach((otherTrack) => {
            let transformKey = otherTrack.transformKeys.find((key) => key.frame === targetFrame);
            switch (otherTrack.property) {
              case 'position': {
                newPosition.subtract(transformKey ? transformKey.value : getInterpolatedVector(otherTrack.transformKeys, targetFrame));
                break;
              }
              case 'rotationQuaternion': {
                newRotationQuaternion.subtract(transformKey ? transformKey.value : getInterpolatedQuaternion(otherTrack.transformKeys, targetFrame));
                break;
              }
              case 'rotation': {
                newRotation.subtract(transformKey ? transformKey.value : getInterpolatedVector(otherTrack.transformKeys, targetFrame));
                break;
              }
              case 'scaling': {
                newScaling.subtract(transformKey ? transformKey.value : getInterpolatedVector(otherTrack.transformKeys, targetFrame));
                break;
              }
              default: {
                break;
              }
            }
          });

          const targetAnim = draft.find((anim) => anim.current && track.targetId.includes(anim.assetId));

          if (targetAnim) {
            const targetTracks = targetAnim.tracks.filter((t) => t.layerId === targetLayerId && t.targetId === track.targetId);
            targetTracks.forEach((t) => {
              switch (t.property) {
                case 'position': {
                  t.transformKeys = getValueInsertedTransformKeys(t.transformKeys, targetFrame, newPosition);
                  break;
                }
                case 'rotationQuaternion': {
                  t.transformKeys = getValueInsertedTransformKeys(t.transformKeys, targetFrame, newRotationQuaternion);
                  break;
                }
                case 'rotation': {
                  t.transformKeys = getValueInsertedTransformKeys(t.transformKeys, targetFrame, newRotation);
                  break;
                }
                case 'scaling': {
                  t.transformKeys = getValueInsertedTransformKeys(t.transformKeys, targetFrame, newScaling);
                }
                default: {
                  break;
                }
              }
            });
          }
        });
      });

      dispatch(
        animationDataActions.editAnimationIngredients({
          animationIngredients: newAnimationIngredients,
        }),
      );
    }
  }, [animationIngredients, dispatch, targetFrame, targetLayerId, tracks]);

  const deleteKeyframe = useCallback(() => {
    const currentAnimationIngredient = animationIngredients.find((anim) => visualizedAssetIds.includes(anim.assetId) && anim.current);

    if (currentAnimationIngredient) {
      const { tracks: currentTracks } = currentAnimationIngredient;

      if (targetLayerId) {
        const newTracks: PlaskTrack[] = [];

        currentTracks.forEach((track) => {
          // rotationQuaternion과 rotation의 경우 동시에 편집되도록
          if (track.property === 'rotationQuaternion') {
            if (deleteTargetTrackIds.includes(track.id)) {
              newTracks.push(
                createPlaskTrack(
                  track.name,
                  track.layerId,
                  track.target,
                  track.property,
                  track.transformKeys.filter((key) => DUMMY_DELETE_FRAME !== key.frame),
                  track.isMocapAnimation,
                ),
              );
              const rotationTrack = currentTracks.find((t) => t.id === track.id.replace('//rotationQuaternion', '//rotation'));
              if (rotationTrack) {
                newTracks.push(
                  createPlaskTrack(
                    rotationTrack.name,
                    rotationTrack.layerId,
                    rotationTrack.target,
                    rotationTrack.property,
                    track.transformKeys.filter((key) => DUMMY_DELETE_FRAME !== key.frame),
                    rotationTrack.isMocapAnimation,
                  ),
                );
              }
            } else {
              newTracks.push(track);
              const rotationTrack = currentTracks.find((t) => t.id === track.id.replace('//rotationQuaternion', '//rotation'));
              if (rotationTrack) {
                newTracks.push(rotationTrack);
              }
            }
          } else if (track.property === 'position' || track.property === 'scaling') {
            if (deleteTargetTrackIds.includes(track.id)) {
              newTracks.push(
                createPlaskTrack(
                  track.name,
                  track.layerId,
                  track.target,
                  track.property,
                  track.transformKeys.filter((key) => DUMMY_DELETE_FRAME !== key.frame),
                  track.isMocapAnimation,
                ),
              );
            } else {
              newTracks.push(track);
            }
          }
        });

        const newAnimationIngredient = {
          id: currentAnimationIngredient.id,
          name: currentAnimationIngredient.name,
          assetId: currentAnimationIngredient.assetId,
          current: currentAnimationIngredient.current,
          tracks: newTracks,
          layers: currentAnimationIngredient.layers,
        };

        dispatch(
          animationDataActions.editAnimationIngredient({
            animationIngredient: newAnimationIngredient,
          }),
        );
      }
    }
  }, [animationIngredients, deleteTargetTrackIds, dispatch, targetLayerId, visualizedAssetIds]);

  const deleteKeyframes = useCallback(() => {
    // edit와는 다르게 TP에서 직접 트랙 내 키프레임 선택해서 삭제
    // 키프레임 선택 시 1) layer 2) track 3) frame이 선택된 상태 (그 이전에 asset 과 currentAnimationIngredient도 결정)
    // track과 frame은 다수일 수 있음
    // single model visualze 상태에서는 visualizedAssetIds를 통해서 currentAnimationIngredient를 선택
    // multi model visualize 상태에서는 selectedAssetIds를 통해서 currentAnimationIngredient를 선택하도록 수정해야 함
    const currentAnimationIngredient = animationIngredients.find((anim) => visualizedAssetIds.includes(anim.assetId) && anim.current);

    if (currentAnimationIngredient) {
      const { tracks: currentTracks } = currentAnimationIngredient;

      if (targetLayerId) {
        const newTracks: PlaskTrack[] = [];

        currentTracks.forEach((track) => {
          // rotationQuaternion과 rotation의 경우 동시에 편집되도록
          if (track.property === 'rotationQuaternion') {
            if (deleteTargetTrackIds.includes(track.id)) {
              newTracks.push(
                createPlaskTrack(
                  track.name,
                  track.layerId,
                  track.target,
                  track.property,
                  track.transformKeys.filter((key) => !DUMMY_DELETE_FRAMES.includes(key.frame)),
                  track.isMocapAnimation,
                ),
              );
              const rotationTrack = currentTracks.find((t) => t.id === track.id.replace('//rotationQuaternion', '//rotation'));
              if (rotationTrack) {
                newTracks.push(
                  createPlaskTrack(
                    rotationTrack.name,
                    rotationTrack.layerId,
                    rotationTrack.target,
                    rotationTrack.property,
                    rotationTrack.transformKeys.filter((key) => !DUMMY_DELETE_FRAMES.includes(key.frame)),
                    rotationTrack.isMocapAnimation,
                  ),
                );
              }
            } else {
              newTracks.push(track);
              const rotationTrack = currentTracks.find((t) => t.id === track.id.replace('//rotationQuaternion', '//rotation'));
              if (rotationTrack) {
                newTracks.push(rotationTrack);
              }
            }
          } else if (track.property === 'position' || track.property === 'scaling') {
            if (deleteTargetTrackIds.includes(track.id)) {
              newTracks.push(
                createPlaskTrack(
                  track.name,
                  track.layerId,
                  track.target,
                  track.property,
                  track.transformKeys.filter((key) => !DUMMY_DELETE_FRAMES.includes(key.frame)),
                  track.isMocapAnimation,
                ),
              );
            } else {
              newTracks.push(track);
            }
          }
        });

        const newAnimationIngredient = {
          id: currentAnimationIngredient.id,
          name: currentAnimationIngredient.name,
          assetId: currentAnimationIngredient.assetId,
          current: currentAnimationIngredient.current,
          tracks: newTracks,
          layers: currentAnimationIngredient.layers,
        };

        dispatch(
          animationDataActions.editAnimationIngredient({
            animationIngredient: newAnimationIngredient,
          }),
        );
      }
    }
  }, [animationIngredients, deleteTargetTrackIds, dispatch, targetLayerId, visualizedAssetIds]);

  const copyKeyframes = useCallback(() => {}, []);

  const pasteKeyframes = useCallback(() => {}, []);

  const addLayer = useCallback(() => {
    const selectedAssetIds = uniq(selectedTargets.map((target) => target.id.split('//')[0]));
    const targetAssets = assetList.filter((asset) => selectedAssetIds.includes(asset.id));

    targetAssets.forEach((asset) => {
      const { id: assetId } = asset;

      const currentAnimationIngredient = animationIngredients.find((anim) => anim.assetId === assetId && anim.current);

      if (currentAnimationIngredient) {
        const { id, name, assetId, current, layers, tracks } = currentAnimationIngredient;
        const newLayer = {
          id: getRandomStringKey(),
          name: newLayerName,
        };
        const newAnimationIngredient: AnimationIngredient = {
          id,
          name,
          assetId,
          current,
          layers: [...layers, newLayer],
          tracks,
        };
        setNewLayerName('');
        dispatch(
          animationDataActions.editAnimationIngredient({
            animationIngredient: newAnimationIngredient,
          }),
        );
      }
    });
  }, [animationIngredients, assetList, dispatch, newLayerName, selectedTargets]);

  const deleteLayer = useCallback(() => {
    const selectedAssetIds = uniq(selectedTargets.map((target) => target.id.split('//')[0]));
    const targetAssets = assetList.filter((asset) => selectedAssetIds.includes(asset.id));

    targetAssets.forEach((asset) => {
      const { id: assetId } = asset;

      const currentAnimationIngredient = animationIngredients.find((anim) => anim.assetId === assetId && anim.current);

      if (currentAnimationIngredient) {
        const { id, name, assetId, current, layers, tracks } = currentAnimationIngredient;
        if (targetLayerId && layers.length > 1) {
          const newAnimationIngredient: AnimationIngredient = {
            id,
            name,
            assetId,
            current,
            layers: layers.filter((layer) => layer.id !== targetLayerId),
            tracks,
          };
          dispatch(
            animationDataActions.editAnimationIngredient({
              animationIngredient: newAnimationIngredient,
            }),
          );
        }
      }
    });
  }, [animationIngredients, assetList, dispatch, selectedTargets, targetLayerId]);

  const handleChangeKeyframe = (event: ChangeEvent<HTMLInputElement>) => {
    setTargetFrame(roundToFourth(parseInt(event.target.value) / fps));
  };

  const handleChangeLayerName = (event: ChangeEvent<HTMLInputElement>) => {
    setNewLayerName(event.target.value);
  };

  return (
    <div className={cx('wrapper')}>
      {/* layer 선택  */}
      <div className={cx('first')}>
        <div className={cx('title')}>{`Layers (${layers.length})`}</div>
        {layers.map((layer) => {
          return (
            <button
              className={cx('button', {
                selected: layer.id === targetLayerId,
              })}
              key={layer.id}
              onClick={() => setTargetLayerId(layer.id)}
            >
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
            <button
              className={cx('track', { selected: deleteTargetTrackIds.includes(track.id) })}
              key={`${track.layerId}&${track.targetId}&${track.property}`}
              onClick={() => setDeleteTargetTrackIds((prev) => (prev.includes(track.id) ? prev.filter((str) => str !== track.id) : [...prev, track.id]))}
            >
              {`${track.target.name}//${track.property}`}
            </button>
          );
        })}
      </div>
      {/* 키프레임 편집 혹은 삭제 시 대상이 되는 frame */}
      <div className={cx('third')}>
        <div className={cx('title')}>Frame</div>
        <input className={cx('input')} type="number" placeholder="type target frame" onChange={handleChangeKeyframe} />
      </div>
      {/* 키프레임 관련 조작 버튼 */}
      <div className={cx('fourth')}>
        <div className={cx('title')}>Control</div>
        <button className={cx('button')} onClick={editKeyframes}>
          Edit Keyframes
        </button>
        <button className={cx('button')} onClick={deleteKeyframe}>
          Delete Keyframe
        </button>
        <button className={cx('button')} onClick={deleteKeyframes}>
          Delete Keyframes
        </button>
        <button className={cx('button')} onClick={copyKeyframes}>
          Copy Keyframes
        </button>
        <button className={cx('button')} onClick={pasteKeyframes}>
          Paste Keyframes
        </button>
        <input className={cx('input')} placeholder="type layer name" onChange={handleChangeLayerName} />
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
