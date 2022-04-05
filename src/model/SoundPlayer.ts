export class SoundPlayer {

    private static context = new AudioContext();

    init(assets: { [key: string]: string }, baseFolder: string) {
        let self = this;
        return Promise.all(Object.values(assets).map(file => {
            console.log('loading sound', file);
            let promise = new Promise<void>(resolve => {
                let request = new XMLHttpRequest();
                request.open('GET', baseFolder + file, true);
                request.responseType = 'arraybuffer';
                request.onload = function () {
                    SoundPlayer.context.decodeAudioData(request.response).then(buffer => {
                        self.sounds.set(file, buffer);
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

    play(asset: string): AudioBufferSourceNode {
        console.log(asset, this.sounds);
        let sound = this.sounds.get(asset.valueOf());
        if (sound) {
            let context = SoundPlayer.context;
            let bufferSource = context.createBufferSource();
            bufferSource.buffer = sound;
            bufferSource.connect(context.destination);
            bufferSource.start();
            return bufferSource;
        }
        return null;
    }
}
