import { Scene } from './model/Scene';
import { SceneNode } from './model/SceneNode';
import { Renderer } from './model/Renderer';

let renderer = new Renderer(document.getElementById('zdog-canvas') as HTMLCanvasElement);

let scene = new Scene();

scene.root.addChild(new SceneNode('circle', {
    shape: 'ellipse',
    diameter: 20,
    stroke: 5,
    color: 'rgba(0.5, 0.4, 0.8, 0.2)',
}).setPosition(0, 0, 10));

scene.root.addChild(new SceneNode('z', {
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
    if (pressed['a']) scene.root.rotation.y -= 0.05;
    if (pressed['d']) scene.root.rotation.y += 0.05;
});
