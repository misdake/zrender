import { DrawableParam } from './Drawable';
import { SfxParam } from './Sfx';
import { ParticleSystemAsset } from './ParticleSystem';

export interface ComponentParam {
    drawable?: DrawableParam;
    sfx?: SfxParam,
    particle?: {
        asset: ParticleSystemAsset<any, any>,
        paramPayload: any,
    },
}
