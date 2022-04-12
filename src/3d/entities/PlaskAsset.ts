import { PlaskEngine } from '3d/PlaskEngine';
import { visualizeNode } from 'actions/LP/lpNodeAction';
import { PlaskEntity, PlaskEntitySpec } from './PlaskEntity';

export interface PlaskAssetSpec extends PlaskEntitySpec {
  assetId: string;
}

export class PlaskAsset extends PlaskEntity {
  public className: string = 'PlaskAsset';
  public assetId: string = '';
  public clone() {
    const newAsset = new PlaskAsset();
    newAsset.assetId = this.assetId;

    return newAsset;
  }

  public copyFrom(other: PlaskAsset | PlaskAssetSpec): PlaskAsset {
    this.assetId = other.assetId;

    return this;
  }

  public async onUpdate() {
    const engine = PlaskEngine.GetInstance();

    return new Promise<void>((resolve, reject) => {
      engine.dispatch(visualizeNode({ assetId: this.assetId, plaskEngine: engine, onSuccess: () => resolve() }));
    });
  }

  public async onInitialize() {
    const engine = PlaskEngine.GetInstance();

    return new Promise<void>((resolve, reject) => {
      engine.dispatch(visualizeNode({ assetId: this.assetId, plaskEngine: engine, onSuccess: () => resolve() }));
    });
  }
}
