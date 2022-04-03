import { Scene } from './Scene';
import * as Zdog from 'zdog';
import { UserInput, UserInputController } from './UserInput';

type TickFunction = (dt: number, input: UserInput) => void;

export interface RendererOptions {
    canvasBackground?: string;
    maxTick?: number;
    aspectRatio?: number;
}

let defaultRendererOptions: RendererOptions = {
    canvasBackground: undefined,
    maxTick: Number.POSITIVE_INFINITY,
    aspectRatio: undefined,
};

function now() {
    return (typeof performance === 'undefined' ? Date : performance).now(); // see threejs clock.js
}

export class Renderer {
    private readonly options: RendererOptions;

    private readonly container: HTMLDivElement;
    private readonly canvas: HTMLCanvasElement;
    private readonly inputController: UserInputController;

    private zdog: Zdog.Illustration;

    constructor(container: HTMLDivElement, options?: RendererOptions) {
        this.options = Object.assign({}, defaultRendererOptions, options);

        //create canvas
        this.container = container;
        let canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.bottom = '0';
        canvas.style.right = '0';
        canvas.style.margin = 'auto';
        if (this.options.canvasBackground) canvas.style.background = this.options.canvasBackground;
        this.container.append(canvas);
        this.canvas = canvas;

        this.inputController = new UserInputController(canvas);
        this.inputController.attach();

        this.zdog = new Zdog.Illustration({
            element: canvas,
            zoom: 5,
            // centered: false,
        });
    }


    private _scene: Scene;
    get scene(): Scene {
        return this._scene;
    }
    set scene(value: Scene) {
        this._scene = value;
    }

    private lastTickTime: number = null;
    private tick: TickFunction = null;
    start(tick: TickFunction) {
        this.tick = tick;
        this.animate();
    }

    animate() {
        this.checkResize();

        //TODO extract clock
        let tickTime = now();
        let dt = (this.lastTickTime ? (tickTime - this.lastTickTime) : 0) * 0.001;
        if (dt > this.options.maxTick) dt = this.options.maxTick;
        this.lastTickTime = tickTime;

        if (this.scene) {
            if (this.tick) {
                this.tick(dt, this.inputController.tick());
            }
            this.scene.root.update();
            this.scene.root.drawable.zdog.updateGraph();
            this.zdog.updateRenderGraph(this.scene.root.drawable.zdog);
        }
        requestAnimationFrame(() => this.animate());
    }

    private lastContainerWidth: number = 0;
    private lastContainerHeight: number = 0;
    private checkResize() {
        let cw = this.container.clientWidth;
        let ch = this.container.clientHeight;
        let pr = window.devicePixelRatio; //TODO use pr

        if (cw !== this.lastContainerWidth || ch !== this.lastContainerHeight) {
            let targetWidth = cw;
            let targetHeight = ch;
            let targetAspectRatio = targetWidth / targetHeight;
            if (this.options.aspectRatio) {
                if (targetAspectRatio > this.options.aspectRatio) {
                    targetWidth = targetHeight * this.options.aspectRatio;
                } else {
                    targetHeight = targetWidth / this.options.aspectRatio;
                }
            }
            this.canvas.style.width = `${targetWidth}px`;
            this.canvas.style.height = `${targetHeight}px`;
            this.canvas.width = targetWidth * pr;
            this.canvas.height = targetHeight * pr;

            this.zdog.setSize(targetWidth, targetHeight);
            this.zdog.zoom = targetHeight / 100;
        }

        this.lastContainerWidth = cw;
        this.lastContainerHeight = ch;
    }

    //TODO destroy?
}
