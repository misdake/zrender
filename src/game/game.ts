import { Scene } from '../engine/scene/Scene';
import { Renderer } from '../engine/Renderer';
import { rendererOptions } from './Config';
import { GameLogic, GameStateGlobal, Level } from './GameLogic';

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
    renderer.scene = scene;
    scene.root.scale.y = -1;

    let gameState = new GameStateGlobal(scene);
    let gameLogic = new GameLogic(gameState);

    let level = new Level(gameState);
    gameLogic.loadLevel(level);

    renderer.start((dt, input) => {
        gameLogic.update(dt, input);
    });

    renderer.preRender = (context, width, height) => {
        gameLogic.preRender(context, width, height);
    };
    renderer.postRender = (context, width, height) => {
        gameLogic.postRender(context, width, height);
    };
}

//TODO click or press to start
setTimeout(() => start());

