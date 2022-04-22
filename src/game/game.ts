import { Scene } from '../engine/scene/Scene';
import { Renderer, RendererOptions } from '../engine/Renderer';
import { Spaceship } from './Spaceship';

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
    canvasBackground: '#ccc',
    aspectRatio: 4 / 3,
};
let container = document.getElementById('container') as HTMLDivElement;

let renderer = new Renderer(container, rendererOptions);

let scene = new Scene();
scene.root.scale.y = -1;

// scene.root.addChild(new SceneNode('circle', {
//     drawable: {
//         asset: {
//             shape: 'ellipse',
//             diameter: 20,
//             stroke: 5,
//             color: 'rgba(0.5, 0.4, 0.8, 0.2)',
//         },
//     },
// }).setPosition(0, 0, 10));

let spaceship = new Spaceship(scene.root);

// scene.root.addChild(new SceneNode('square', {
//     drawable: {
//         asset: {
//             shape: 'rect',
//             width: 20,
//             height: 20,
//             stroke: 5,
//             color: '#E62',
//             fill: false,
//         },
//     },
// }).setPosition(0, 0, -10));

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
        }
    }
});

renderer.preRender = (context, _width, _height) => {
    context.textBaseline = 'top';
    context.fillStyle = 'black';
    context.font = '20px sans-serif';
    context.fillText(`speed ${spaceship.speed.length().toFixed(2)}`, 10, 10);
};

