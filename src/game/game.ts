import { Scene } from '../engine/scene/Scene';
import { Renderer } from '../engine/Renderer';
import { rendererOptions } from './Config';
import { GameLogic, GameStateGlobal } from './GameLogic';

async function start() {
    let container = document.getElementById('container') as HTMLDivElement;
    let renderer = new Renderer(container, rendererOptions);
    let scene = new Scene();
    renderer.scene = scene;
    scene.root.scale.y = -1;

    let gameState = new GameStateGlobal(scene);
    let gameLogic = new GameLogic(gameState);

    renderer.start((dt, input) => {
        gameLogic.update(dt, input);
    });

    renderer.preRender = (context, width, height) => {
        gameLogic.preRender(context, width, height);
    };
    renderer.postRender = (context, width, height) => {
        gameLogic.postRender(context, width, height);
    };

    (window as any).printSceneTree = () => {
        scene.printSceneTree();
    };
}

//TODO click or press to start
setTimeout(() => start());
