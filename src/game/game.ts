import { Scene } from '../engine/scene/Scene';
import { Renderer } from '../engine/Renderer';
import { Spaceship } from './Spaceship';
import { rendererOptions } from './Config';

// const SfxAssets = {
//     fire: 'fire.wav',
//     move: 'move.wav',
//     powerup: 'powerup.wav',
// };

// const BgmAssets = {
//     bgm: 'bgm.ogg',
// };
// let bgmParam: BgmParam = {
//     assets: BgmAssets,
//     baseFolder: 'assets/bgm/',
//     channel: 1,
//     onLoaded: bgm => {
//         bgm.play(BgmAssets.bgm, 0.5, true);
//         setTimeout(() => {
//             bgm.stop();
//         }, 10000);
//         setInterval(() => {
//             console.log(bgm.currentAsset);
//         }, 1000);
//     },
//     onEnd: (bgm, asset) => {
//         console.log('bgm onEnd', asset);
//     },
// };
// let bgm = new Bgm(bgmParam);

async function start() {
    let container = document.getElementById('container') as HTMLDivElement;

    let renderer = new Renderer(container, rendererOptions);

    let scene = new Scene();
    scene.root.scale.y = -1;

    let spaceship = new Spaceship(scene.root);

    renderer.scene = scene;

    renderer.start((dt, input) => {
        let pressed = input.keyboard.pressed;

        //TODO extract key name constants
        spaceship.playerMove(dt, pressed['w'], pressed['s'], pressed['a'], pressed['d']);

        if (pressed[' ']) {
            spaceship.tryFire(dt);
        }
    });

    renderer.preRender = (context, _width, _height) => {
        context.textBaseline = 'top';
        context.fillStyle = 'white';
        context.font = '20px sans-serif';
        context.fillText(`speed ${spaceship.speed.length().toFixed(0)}`, 10, 10);
    };
}

//TODO click or press to start
setTimeout(() => start());

