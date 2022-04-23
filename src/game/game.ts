import { Scene } from '../engine/scene/Scene';
import { Renderer, RendererOptions } from '../engine/Renderer';
import { Spaceship } from './Spaceship';
import { Bullet } from './Bullet';
import { Vec3 } from '../engine/util/Vec3';

const SfxAssets = {
    fire: 'fire.wav',
    move: 'move.wav',
    powerup: 'powerup.wav',
};

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

let rendererOptions: RendererOptions = {
    maxTick: 0.1,
    canvasBackground: '#222',
    aspectRatio: 4 / 3,
};
let container = document.getElementById('container') as HTMLDivElement;

let renderer = new Renderer(container, rendererOptions);

let scene = new Scene();
scene.root.scale.y = -1;

let spaceship = new Spaceship(scene.root);
let bullet = new Bullet(scene.root);

renderer.scene = scene;

let lastFire: number = -1;
renderer.start((dt, input) => {
    let pressed = input.keyboard.pressed;
    // console.log(pressed);

    //TODO extract key name constants
    spaceship.playerMove(dt, pressed['w'], pressed['s'], pressed['a'], pressed['d']);

    if (pressed[' ']) {
        let now = performance.now();
        if (now - lastFire > 100) {
            spaceship.node.sfx.play(SfxAssets.fire);
            lastFire = now;
            bullet.fire(spaceship, new Vec3(0, 3, 0), 0);
        }
    }
    bullet.update(dt);
});

renderer.preRender = (context, _width, _height) => {
    context.textBaseline = 'top';
    context.fillStyle = 'white';
    context.font = '20px sans-serif';
    context.fillText(`speed ${spaceship.speed.length().toFixed(0)}`, 10, 10);
};

