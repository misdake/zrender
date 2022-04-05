import { Scene } from './model/Scene';
import { SceneNode } from './model/SceneNode';
import { Renderer, RendererOptions } from './model/Renderer';

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
    shape: 'ellipse',
    diameter: 20,
    stroke: 5,
    color: 'rgba(0.5, 0.4, 0.8, 0.2)',
}).setPosition(0, 0, 10));

scene.root.addChild(z = new SceneNode('z', {
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
}).setScale(0.3, 0.3, 0.3));

scene.root.addChild(new SceneNode('square', {
    shape: 'rect',
    width: 20,
    height: 20,
    stroke: 5,
    color: '#E62',
    fill: false,
}).setPosition(0, 0, -10));

renderer.scene = scene;

renderer.start((dt, input) => {
    let pressed = input.keyboard.pressed;
    // console.log(pressed);
    if (pressed['ArrowLeft']) scene.root.rotation.y -= dt;
    if (pressed['ArrowRight']) scene.root.rotation.y += dt;
    if (pressed['a']) z.position.x -= dt * 10;
    if (pressed['d']) z.position.x += dt * 10;
    if (pressed['w']) z.position.y -= dt * 10;
    if (pressed['s']) z.position.y += dt * 10;
});

renderer.preRender = (context, width, height) => {
    context.fillStyle = 'black';
    context.fillRect(0, 0, 20, 20);
};
