import { Scene } from './model/Scene';
import { SceneNode } from './model/SceneNode';
import { Renderer } from './model/Renderer';

let renderer = new Renderer(document.getElementById('zdog-canvas') as HTMLCanvasElement);

let scene = new Scene();
let circle = new SceneNode('circle', {
    shape: 'ellipse',
    diameter: 20,
    stroke: 5,
    color: 'rgba(0.5, 0.4, 0.8, 0.2)',
});
circle.position.z = 10;
scene.root.addChild(circle);

renderer.scene = scene;

renderer.start(() => {
    scene.root.rotation.y += 0.003;
});

// let isSpinning = true;
//
// let illo = new Zdog.Illustration({
//     element: document.getElementById('zdog-canvas') as HTMLCanvasElement,
//     zoom: 5,
//     dragRotate: true,
//     // stop spinning when drag starts
//     onDragStart: function () {
//         isSpinning = false;
//     },
// });
//
//
// // circle
// new Zdog.Ellipse({
//     addTo: illo,
//     diameter: 20,
//     translate: {z: 10},
//     stroke: 5,
//     color: 'rgba(0.5, 0.4, 0.8, 0.2)',
// });
//
// // z-shape
// new Zdog.Shape({
//     addTo: illo,
//     path: [
//         {x: -32, y: -40}, // start at top left
//         {x: 32, y: -40}, // line to top right
//         {x: -32, y: 40}, // line to bottom left
//         {x: 32, y: 40}, // line to bottom right
//     ],
//     scale: {x: 0.3, y: 0.3, z: 0.3},
//     closed: false,
//     stroke: 5,
//     color: '#636',
// });
//
// // square
// new Zdog.Rect({
//     addTo: illo,
//     width: 20,
//     height: 20,
//     translate: {z: -10},
//     stroke: 5,
//     color: '#E62',
//     fill: false,
// });
//
// function animate() {
//     illo.rotate.y += isSpinning ? 0.03 : 0;
//     illo.updateRenderGraph();
//     requestAnimationFrame(animate);
// }
//
// animate();
