import { PlaskEngine } from '3d/PlaskEngine';
import { cancelVisulization, visualizeNode } from 'actions/LP/lpNodeAction';
import { PlaskEntity, PlaskEntitySpec } from './PlaskEntity';

export interface PlaskAssetSpec extends PlaskEntitySpec {
  assetId: string;
}

export class PlaskAsset extends PlaskEntity {
  public className: string = 'PlaskAsset';
  public assetId: string = '';
  public clone() {
    const newAsset = new PlaskAsset(this.entityId);
    newAsset.assetId = this.assetId;

    return newAsset;
  }

  public copyFrom(other: PlaskAsset | PlaskAssetSpec): PlaskAsset {
    console.log('assetId update :', other.assetId);
    this.assetId = other.assetId;

    return this;
  }

  public onDispose(): void {
    const engine = PlaskEngine.GetInstance();
    engine.assetModule.unvisualizeModel(this.assetId);
  }

  public async onUpdate() {
    const engine = PlaskEngine.GetInstance();

    return new Promise<void>((resolve, reject) => {
      console.log(this.assetId, 'visualized');
      engine.assetModule.visualizeModel(this.assetId);
      // engine.dispatch(cancelVisulization({ assetId: this.assetId, plaskEngine: engine }));
      // engine.dispatch(visualizeNode({ assetId: this.assetId, plaskEngine: engine, onSuccess: () => resolve() }));
    });
  }

  public async onInitialize() {
    const engine = PlaskEngine.GetInstance();

    return new Promise<void>((resolve, reject) => {
      engine.assetModule.visualizeModel(this.assetId);

      // engine.dispatch(visualizeNode({ assetId: this.assetId, plaskEngine: engine, onSuccess: () => resolve() }));
    });
  }
}
