import { KeyframesState } from 'reducers/keyframes';

interface Service {
  updateTrackKeyframesList(): Partial<KeyframesState>;
}

export default Service;
