import { SoundPlayer } from '../util/SoundPlayer';

export type SfxParam = {
    // baseFolder: string, //TODO
    assets: string[],
};

export class Sfx {
    private player: SoundPlayer;
    private assets: Set<string>;

    constructor(player: SoundPlayer, sfxParam: SfxParam) {
        this.player = player;
        this.assets = new Set<string>(sfxParam.assets);

        //TODO
    }


}
