import { SoundAsset, SoundPlayer } from '../util/SoundPlayer';

export type SfxAsset = SoundAsset[];

export class Sfx {
    private readonly _assets: Set<SoundAsset>;
    private channel: number;

    constructor(sfxAsset: SfxAsset, channel: number) {
        this.channel = channel;
        this._assets = new Set(sfxAsset);
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
