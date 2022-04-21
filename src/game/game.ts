import { Scene } from '../engine/scene/Scene';
import { SceneNode } from '../engine/scene/SceneNode';
import { Renderer, RendererOptions } from '../engine/Renderer';
import { Bgm, BgmParam } from '../engine/Bgm';

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

let z: SceneNode;
scene.root.addChild(new SceneNode('circle', {
    drawable: {
        asset: {
            shape: 'ellipse',
            diameter: 20,
            stroke: 5,
            color: 'rgba(0.5, 0.4, 0.8, 0.2)',
        },
    },
}).setPosition(0, 0, 10));

scene.root.addChild(z = new SceneNode('z', {
    drawable: {
        asset: {
            shape: 'polyline',
            path: [
                {x: -32, y: -40, z: 0}, // start at top left
                {x: 32, y: -40, z: 0}, // line to top right
                {x: -32, y: 40, z: 0}, // line to bottom left
                {x: 32, y: 40, z: 0}, // line to bottom right
            ],
            closed: false,
            stroke: 5,
            color: '#636',
        },
    },
    sfx: {
        assets: {fire: SfxAssets.fire},
        channel: 0,
        baseFolder: 'assets/sound/',
    },
}).setScale(0.3, 0.3, 0.3));

scene.root.addChild(new SceneNode('square', {
    drawable: {
        asset: {
            shape: 'rect',
            width: 20,
            height: 20,
            stroke: 5,
            color: '#E62',
            fill: false,
        },
    },
}).setPosition(0, 0, -10));

renderer.scene = scene;

let lastFire: number = -1;
renderer.start((dt, input) => {
    let pressed = input.keyboard.pressed;
    // console.log(pressed);
    //TODO extract key name constants
    if (pressed['ArrowLeft']) scene.root.rotation.y -= dt;
    if (pressed['ArrowRight']) scene.root.rotation.y += dt;
    if (pressed['a']) z.position.x -= dt * 10;
    if (pressed['d']) z.position.x += dt * 10;
    if (pressed['w']) z.position.y -= dt * 10;
    if (pressed['s']) z.position.y += dt * 10;
    if (pressed[' ']) {
        let now = performance.now();
        if (now - lastFire > 100) {
            z.sfx.play(SfxAssets.fire);
            lastFire = now;
        }
    }
});

renderer.preRender = (context, width, height) => {
    context.fillStyle = 'black';
    context.fillRect(0, 0, 20, 20);
};

