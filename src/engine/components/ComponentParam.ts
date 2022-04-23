import { DrawableParam } from './Drawable';
import { SfxParam } from './Sfx';
import { ParticleParam } from './ParticleSystem';

export interface ComponentParam {
    drawable?: DrawableParam;
    sfx?: SfxParam,
    particle?: ParticleParam,
}
