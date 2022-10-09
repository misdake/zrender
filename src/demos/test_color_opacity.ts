import { Scene } from '../engine/scene/Scene';
import { Renderer, RendererOptions } from '../engine/Renderer';
import { SceneNode } from '../engine/scene/SceneNode';
import { AnimateField, AnimateType, AnimationAdd } from '../engine/components/Animation';
import { Vec3 } from '../engine/util/Vec3';

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
        particle: {
            particleName: 'move',
            drawable: {
                asset: {
                    shape: 'rect',
                    fill: true,
                    width: 1,
                    height: 1,
                    stroke: false,
                    color: "rgba(255, 0, 255, 1.0)",
                },
            },
            animations: [{
                name: 'move',
                type: AnimateType.add,
                field: AnimateField.Position,
                duration: 5,
                speed: new Vec3(2, 0, 0),
            }, {
                name: 'opacity',
                type: AnimateType.lerp,
                field: AnimateField.Opacity,
                duration: 5,
                target: new Vec3(0, 0, 0), // TODO field to provide info about mask
            }, {
                name: 'color',
                type: AnimateType.lerp,
                field: AnimateField.Color,
                duration: 2.5,
                target: new Vec3(0, 1, 1),
            }],
        },
    });
    node.particle.setCallbacks(
        (p, animations, _) => {
            //TODO auto reset?
            p.node.position.set(0,0,0);
            p.node.scale.set(1, 1, 1);
            p.node.color.set(1, 0, 0);
            p.node.opacity.set(1);
        },
        _ => true,
    );

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
