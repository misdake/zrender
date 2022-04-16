export type SoundAsset = string;
export type SoundAssets = { [key: string]: SoundAsset };

export class SoundPlayer {

    private static instances: SoundPlayer[] = [];
    static getInstance(channel: number) {
        if (!this.instances[channel]) this.instances[channel] = new SoundPlayer();
        return this.instances[channel];
    }

    static
    load(assets: SoundAssets, baseFolder: string): Promise<void[]> {
        return Promise.all(Object.values(assets).map(file => {
            let promise = new Promise<void>(resolve => {
                let request = new XMLHttpRequest();
                request.open('GET', baseFolder + file, true);
                request.responseType = 'arraybuffer';
                request.onload = () => {
                    this.loadContext.decodeAudioData(request.response).then(buffer => {
                        this.sounds.set(file, buffer);
                        resolve();
                    }).catch(() => {
                        resolve(); //force resolve
                    });
                };
                request.send();
            });
            return promise;
        }));
    }

    private constructor() {
    }

    private static loadContext = new AudioContext();
    private context = new AudioContext();

    private static sounds = new Map<string, AudioBuffer>();

    play(asset: string, volume: number, loop: boolean): AudioBufferSourceNode {
        let sound = SoundPlayer.sounds.get(asset.valueOf());
        if (sound) {
            let context = this.context;
            let bufferSource = context.createBufferSource();

            let gainNode = context.createGain();
            gainNode.gain.value = volume; // [0, 1]
            gainNode.connect(context.destination);

            bufferSource.buffer = sound;
            bufferSource.connect(gainNode);
            bufferSource.start();
            bufferSource.loop = loop;
            return bufferSource;
        }
        return null;
    }
}
