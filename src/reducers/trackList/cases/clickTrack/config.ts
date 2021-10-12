import { TrackListState } from 'reducers/trackList';
import {
  ClickTrackBody,
  ClickLayerTrackBody,
  ClickBoneTrackBody,
  ClickTransformTrackBody,
} from 'actions/trackList';

import { LayerTrackService, BoneTrackService, TransformTrackService } from './service';
import { LayerTrackRepository, BoneTrackRepository, TransformTrackRepository } from './repository';

export class TrackChecker {
  public isLayerTrack(payload: ClickTrackBody): payload is ClickLayerTrackBody {
    return (payload as ClickLayerTrackBody).layerId !== undefined;
  }

  public isBoneTrack(payload: ClickTrackBody): payload is ClickBoneTrackBody {
    return (payload as ClickBoneTrackBody).boneIndex !== undefined;
  }

  public isTransformTrack(payload: ClickTrackBody): payload is ClickTransformTrackBody {
    return (payload as ClickTransformTrackBody).transformIndex !== undefined;
  }
}

export const layerTrackConfig = (state: TrackListState, payload: ClickLayerTrackBody) => {
  const repository = new LayerTrackRepository(state);
  const service = new LayerTrackService(state, payload, repository);
  const selectedLayer = service.selectClickType();
  const nextState = service.updateState(selectedLayer);
  return nextState;
};

export const boneTrackConfig = (state: TrackListState, payload: ClickBoneTrackBody) => {
  const repository = new BoneTrackRepository(state);
  const service = new BoneTrackService(state, payload, repository);
  const selectedTracks = service.selectClickType();
  const nextState = service.updateState(selectedTracks);
  return nextState;
};

export const transformTrackConfig = (state: TrackListState, payload: ClickTransformTrackBody) => {
  const repository = new TransformTrackRepository(state);
  const service = new TransformTrackService(state, payload, repository);
  const selectedTracks = service.selectClickType();
  const nextState = service.updateState(selectedTracks);
  return nextState;
};
