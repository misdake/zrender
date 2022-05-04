import { SoundAsset, SoundAssets, SoundPlayer } from '../util/SoundPlayer';
import { SceneNode } from '../scene/SceneNode';
import { Component } from './Component';

export interface SfxParam {
    assets: SoundAssets,
    baseFolder: string,
    channel: number,
    onLoaded?: (sfx: Sfx) => void;
}

export class Sfx extends Component {
    private readonly _assets: Set<SoundAsset>;
    private channel: number;

    public readonly loadPromise: Promise<void>;

    constructor(node: SceneNode, param: SfxParam) {
        super(node);
        this.channel = param.channel;
        this._assets = new Set(Object.values(param.assets));

        this.loadPromise = SoundPlayer.load(param.assets, param.baseFolder).then(_ => {
            if (param.onLoaded) {
                param.onLoaded(this);
            }
        });
    }

    get assets() {
        return this._assets;
    }

    play(asset: SoundAsset, volume: number = 1.0, loop: boolean = false): AudioBufferSourceNode {
        if (this._assets.has(asset)) {
            return SoundPlayer.getInstance(this.channel).play(asset, volume, loop);
        } else {
            console.log(`cannot find sfx asset: ${asset} from ${this._assets}`);
            return null;
        }
    }
}
