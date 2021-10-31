import produce from 'immer';
import { ClickCaretButton, ClickLayerCaretButton, ClickBoneCaretButton } from 'actions/trackList';
import { TrackListState } from '../index';

class Track {
  public isBoneTrack(payload: ClickCaretButton): payload is ClickBoneCaretButton {
    return (payload as ClickBoneCaretButton).boneIndex !== undefined;
  }

  public updateObject(oldObject: TrackListState, newValues: Partial<TrackListState>) {
    return Object.assign({}, oldObject, newValues);
  }
}

class LayerTrack extends Track {
  private readonly state: TrackListState;

  constructor(state: TrackListState) {
    super();
    this.state = state;
  }

  updateTrackList(layerIndex: number, isPointedDownCaret: boolean) {
    return produce(this.state.layerTrackList, (draft) => {
      draft[layerIndex].isPointedDownCaret = isPointedDownCaret;
    });
  }

  findTrackIndex(layerId: string) {
    return this.state.layerTrackList.findIndex((layer) => layer.layerId === layerId);
  }

  clickCaretButton(payload: ClickLayerCaretButton) {
    const layerIndex = this.findTrackIndex(payload.layerId);
    const nextLayerTrackList = this.updateTrackList(layerIndex, payload.isPointedDownCaret);
    return this.updateObject(this.state, { layerTrackList: nextLayerTrackList });
  }
}

class BoneTrack extends Track {
  private readonly state: TrackListState;

  constructor(state: TrackListState) {
    super();
    this.state = state;
  }

  updateTrackList(boneIndex: number, isPointedDownCaret: boolean) {
    return produce(this.state.boneTrackList, (draft) => {
      draft[boneIndex].isPointedDownCaret = isPointedDownCaret;
    });
  }

  findTrackIndex(boneIndex: number) {
    return this.state.boneTrackList.findIndex((bone) => bone.boneIndex === boneIndex);
  }

  clickCaretButton(payload: ClickBoneCaretButton) {
    const boneIndex = this.findTrackIndex(payload.boneIndex);
    const nextBoneTrackList = this.updateTrackList(boneIndex, payload.isPointedDownCaret);
    return this.updateObject(this.state, { boneTrackList: nextBoneTrackList });
  }
}

function clickCaretButton(state: TrackListState, payload: ClickCaretButton) {
  const track = new Track();
  if (track.isBoneTrack(payload)) {
    const boneTrack = new BoneTrack(state);
    return boneTrack.clickCaretButton(payload);
  } else {
    const layerTrack = new LayerTrack(state);
    return layerTrack.clickCaretButton(payload);
  }
}

export default clickCaretButton;
