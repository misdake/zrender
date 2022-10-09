import { Scene } from '../engine/scene/Scene';
import { Renderer, RendererOptions } from '../engine/Renderer';
import { SceneNode } from '../engine/scene/SceneNode';
import { AnimateField, AnimateType } from '../engine/components/Animation';
import { Vec1, Vec3 } from '../engine/util/Vec3';
import { ParticleSystemAsset } from '../engine/components/ParticleSystem';

const rendererOptions: RendererOptions = {
    maxTick: 0.1,
    canvasBackground: '#222',
    aspectRatio: 1,
    logicalHeight: 100,
};

async function start() {
    let container = document.getElementById('container') as HTMLDivElement;
    let renderer = new Renderer(container, rendererOptions);
    let scene = new Scene();
    renderer.scene = scene;
    scene.root.scale.y = -1;

    let node = new SceneNode('ship', {
        particle: {asset: PARTICLE_ASSET, paramPayload: {}},
    });

    let time = 0;
    let last = -1000;

    scene.root.addChild(node);

    renderer.start((dt, input) => {
        time += dt;
        if (time - last > 1) {
            last = time;
            node.particle.spawn({})
            console.log("spawn");
        }
    });

    (window as any).printSceneTree = () => {
        scene.printSceneTree();
    };
}

//TODO click or press to start
setTimeout(() => start());

const PARTICLE_ASSET = new ParticleSystemAsset<{}, {}>(() => ({
    particleName: 'move',
    drawable: {
        asset: {
            shape: 'rect',
            fill: true,
            width: 1,
            height: 1,
            stroke: false,
            color: 'rgba(255, 0, 255, 1.0)',
        },
    },
    animations: [{
        name: 'move',
        type: AnimateType.add,
        field: AnimateField.Position,
        duration: 5,
        src: new Vec3(0, 0, 0),
        speed: new Vec3(2, 0, 0),
    }, {
        name: 'opacity',
        type: AnimateType.lerp,
        field: AnimateField.Opacity,
        duration: 5,
        src: new Vec1(1),
        target: new Vec1(0),
    }, {
        name: 'color',
        type: AnimateType.lerp,
        field: AnimateField.Color,
        duration: 2.5,
        src: new Vec3(1, 0, 0),
        target: new Vec3(0, 1, 1),
    }],
}), (p, animations, _) => {
}, _ => true);
