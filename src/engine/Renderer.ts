import { Scene } from './scene/Scene';
import * as Zdog from 'zdog';
import { UserInput, UserInputController } from './UserInput';

type CanvasRenderFunction = (context: CanvasRenderingContext2D, width: number, height: number) => void;
type TickFunction = (dt: number, input: UserInput) => void;

export interface RendererOptions {
    canvasBackground?: string;
    maxTick?: number;
    aspectRatio?: number;
    logicalHeight?: number;
    preRender?: CanvasRenderFunction;
    postRender?: CanvasRenderFunction;
}

let defaultRendererOptions: RendererOptions = {
    canvasBackground: undefined,
    maxTick: Number.POSITIVE_INFINITY,
    aspectRatio: undefined,
    logicalHeight: 100,
    preRender: undefined,
    postRender: undefined,
};

function now() {
    return (typeof performance === 'undefined' ? Date : performance).now(); // see threejs clock.js
}

export class Renderer {
    private readonly options: RendererOptions;

    private readonly container: HTMLDivElement;
    private readonly canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D;
    private readonly inputController: UserInputController;

    private zdog: Zdog.Illustration;

    //from option and configurable
    public preRender: CanvasRenderFunction;
    public postRender: CanvasRenderFunction;

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
        this.ctx = canvas.getContext('2d');

        this.preRender = this.options.preRender;
        this.postRender = this.options.postRender;

        this.inputController = new UserInputController(canvas);
        this.inputController.attach();

        this.zdog = new Zdog.Illustration({
            element: canvas,
            zoom: 5,
        });

        this.zdog.onPrerender = () => {
            if (this.preRender) {
                this.ctx.save();
                this.ctx.resetTransform();
                this.preRender(this.ctx, this.width, this.height);
                this.ctx.restore();
            }
        };
    }


    get width(): number {
        return this.canvas.width;
    }
    get height(): number {
        return this.canvas.height;
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


    private animate() {
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

            if (this.preRender) this.preRender(this.ctx, this.width, this.height);

            this.scene.root.update();
            this.scene.root.drawable.zdog.updateGraph();
            this.zdog.updateRenderGraph(this.scene.root.drawable.zdog);

            if (this.postRender) {
                this.ctx.save();
                this.ctx.resetTransform();
                this.postRender(this.ctx, this.width, this.height);
                this.ctx.restore();
            }
        }
        requestAnimationFrame(() => this.animate());
    }


    private lastContainerWidth: number = 0;
    private lastContainerHeight: number = 0;
    private checkResize() {
        let cw = this.container.clientWidth;
        let ch = this.container.clientHeight;

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

            this.zdog.setSize(targetWidth, targetHeight);
            this.zdog.zoom = targetHeight / this.options.logicalHeight;
        }

        this.lastContainerWidth = cw;
        this.lastContainerHeight = ch;
    }

    //TODO destroy?
}
