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
}
