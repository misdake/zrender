export class SoundPlayer {

    private context = new AudioContext();

    init(assets: { [key: string]: string }, baseFolder: string) {
        return Promise.all(Object.values(assets).map(file => {
            console.log('loading sound', file);
            let promise = new Promise<void>(resolve => {
                let request = new XMLHttpRequest();
                request.open('GET', baseFolder + file, true);
                request.responseType = 'arraybuffer';
                request.onload = () => {
                    this.context.decodeAudioData(request.response).then(buffer => {
                        this.sounds.set(file, buffer);
                        console.log('loaded sound', file);
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

    private sounds = new Map<string, AudioBuffer>();

    play(asset: string, volume: number = 1.0, loop: boolean = false): AudioBufferSourceNode {
        console.log(asset, this.sounds);
        let sound = this.sounds.get(asset.valueOf());
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
