import { DrawableAsset } from './Drawable';
import { SfxAsset } from './Sfx';

export interface ComponentParam {
    drawable?: DrawableAsset;
    sfx?: {
        assets: SfxAsset,
        channel: number,
    },
}
