import { SoundAsset, SoundAssets, SoundPlayer } from './util/SoundPlayer';

export interface BgmParam {
    assets: SoundAssets,
    baseFolder: string,
    channel: number,
    onLoaded?: (bgm: Bgm) => void;
    onEnd?: (bgm: Bgm, asset: SoundAsset) => void;
}

export class Bgm {
    private readonly _assets: Set<SoundAsset>;
    private readonly channel: number;
    private readonly onEnd: (bgm: Bgm, asset: SoundAsset) => void;

    public readonly loadPromise: Promise<void>;

    constructor(param: BgmParam) {
        this.channel = param.channel;
        this._assets = new Set(Object.values(param.assets));
        this.onEnd = param.onEnd;

        this.loadPromise = SoundPlayer.load(param.assets, param.baseFolder).then(_ => {
            if (param.onLoaded) {
                param.onLoaded(this);
            }
        });
    }

    get assets() {
        return this._assets;
    }

    get currentAsset() {
        return this._currentAsset;
    }

    stop() {
        if (this._currentPlaying) {
            this._currentPlaying.stop();
        }
    }

    private _currentAsset: SoundAsset = null;
    private _currentPlaying: AudioBufferSourceNode = null;
    play(asset: SoundAsset, volume: number = 1.0, loop: boolean = false) {
        if (this._assets.has(asset)) {
            let audio = SoundPlayer.getInstance(this.channel).play(asset, volume, loop);
            this._currentAsset = asset;
            this._currentPlaying = audio;
            audio.addEventListener('ended', _ => {
                if (this.onEnd) {
                    this._currentAsset = null;
                    this._currentPlaying = null;
                    this.onEnd(this, asset);
                }
            });
        } else {
            console.log(`cannot find bgm asset: ${asset} from ${this._assets}`);
        }
    }
}
