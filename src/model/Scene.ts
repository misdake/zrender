import { SceneNode } from './SceneNode';
import * as Zdog from 'zdog';

let isSpinning = true;

export class Scene {
    public readonly root: SceneNode;
    private readonly zdog: Zdog.Illustration;

    constructor() {
        this.root = new SceneNode('root', {shape: 'anchor'});
    }

    start() {
        this.animate();
    }

    animate() {
        this.root.rotation.y += isSpinning ? 0.03 : 0;
        this.root.update();
        this.root.drawable.zdog.updateGraph();
        this.zdog.updateRenderGraph(this.root.drawable.zdog);
        requestAnimationFrame(() => this.animate());
    }
}
