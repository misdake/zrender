import { Scene } from './Scene';
import * as Zdog from 'zdog';

export class Renderer {

    private readonly canvas: HTMLCanvasElement;
    private zdog: Zdog.Illustration;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;

        this.zdog = new Zdog.Illustration({
            element: document.getElementById('zdog-canvas') as HTMLCanvasElement,
            zoom: 5,
            dragRotate: true,
        });
    }


    private _scene: Scene;
    get scene(): Scene {
        return this._scene;
    }
    set scene(value: Scene) {
        this._scene = value;
    }


    private tick: () => void = null;
    start(tick: () => void) {
        this.tick = tick;
        this.animate();
    }

    animate() {
        if (this.scene) {
            if (this.tick) {
                this.tick(); //TODO dt
            }
            this.scene.root.update();
            this.scene.root.drawable.zdog.updateGraph();
            this.zdog.updateRenderGraph(this.scene.root.drawable.zdog);
        }
        requestAnimationFrame(() => this.animate());
    }

}
