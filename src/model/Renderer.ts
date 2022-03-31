import { Scene } from './Scene';
import * as Zdog from 'zdog';
import { UserInput, UserInputController } from './UserInput';

type TickFunction = (dt: number, input: UserInput) => void;

export class Renderer {

    private readonly canvas: HTMLCanvasElement;
    private zdog: Zdog.Illustration;

    private readonly inputController: UserInputController;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.inputController = new UserInputController(canvas);
        this.inputController.attach();

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

    private tick: TickFunction = null;
    start(tick: TickFunction) {
        this.tick = tick;
        this.animate();
    }

    animate() {
        if (this.scene) {
            if (this.tick) {
                this.tick(0, this.inputController.tick()); //TODO dt
            }
            this.scene.root.update();
            this.scene.root.drawable.zdog.updateGraph();
            this.zdog.updateRenderGraph(this.scene.root.drawable.zdog);
        }
        requestAnimationFrame(() => this.animate());
    }

    //TODO destroy?
}
