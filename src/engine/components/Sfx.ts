import { SoundAsset, SoundPlayer } from '../util/SoundPlayer';
import { SceneNode } from '../scene/SceneNode';

export interface SfxParam {
    assets: SoundAsset[],
    channel: number,
    enableEventTrigger?: boolean,
}

export class Sfx {
    private readonly _assets: Set<SoundAsset>;
    private channel: number;

    constructor(node: SceneNode, param: SfxParam) {
        this.channel = param.channel;
        this._assets = new Set(param.assets);
    }

    get assets() {
        return this._assets;
    }

    play(asset: SoundAsset, volume: number = 1.0, loop: boolean = false) {
        if (this._assets.has(asset)) {
            SoundPlayer.getInstance(this.channel).play(asset, volume, loop);
        } else {
            console.log(`cannot find sfx asset: ${asset} from ${this._assets}`);
        }
    }
}
