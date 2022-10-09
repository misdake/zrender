import { Component } from './Component';
import { DrawableParam } from './Drawable';
import { SceneNode } from '../scene/SceneNode';
import { Animation, AnimationAsset, animationFillSrc, animationInit, animationUpdate } from './Animation';

export interface ParticleParam {
    particleName: string,
    drawable: DrawableParam;
    spawnParent?: SceneNode;
    animations: AnimationAsset[];
}

export class Particle {
    readonly node: SceneNode;

    animations: Animation[];
    time: number;

    keepAlive = false;

    constructor(name: string, drawable: DrawableParam) {
        this.node = new SceneNode('particle', {
            drawable: drawable,
        });
    }

    spawn(initFunc: (p: Particle, animations: AnimationAsset[], payload?: any) => void, animationAssets: AnimationAsset[], payload?: any) {
        this.time = 0;
        this.animations = animationInit(this.node, animationAssets);
        initFunc(this, this.animations, payload);
        animationFillSrc(this.node, this.animations);
    }

    update(dt: number) {
        this.time += dt;
        this.keepAlive = animationUpdate(this.node, this.animations, this.time);
    }

    check(checkEnable: (p: Particle) => boolean): boolean {
        if (!this.keepAlive) return false;
        let enabled = checkEnable(this);
        return enabled;
    }
}

export class ParticleSystemAsset<ParamPayload, SpawnPayload> {
    private readonly paramGen: (payload: ParamPayload) => ParticleParam;
    private readonly initFunc: (p: Particle, animations: Animation[], payload: SpawnPayload) => void;
    private readonly checkFunc: (p: Particle) => boolean;

    constructor(paramGen: (payload: ParamPayload) => ParticleParam, initFunc: (p: Particle, animations: Animation[], payload: SpawnPayload) => void, checkFunc: (p: Particle) => boolean) {
        this.paramGen = paramGen;
        this.initFunc = initFunc;
        this.checkFunc = checkFunc;
    }

    public create(paramPayload: ParamPayload, node: SceneNode): ParticleSystem {
        let system = new ParticleSystem(node, this.paramGen(paramPayload));
        system.setCallbacks(this.initFunc, this.checkFunc);
        return system;
    }
}

export class ParticleSystem extends Component {
    private enabled: Particle[] = [];
    private disabled: Particle[] = [];

    public readonly particleName: string;
    public readonly drawable: DrawableParam;
    public readonly spawnParent: SceneNode;
    public readonly animationAssets: AnimationAsset[];

    constructor(node: SceneNode, param: ParticleParam) {
        super(node);

        this.particleName = param.particleName;
        this.drawable = param.drawable;
        this.animationAssets = param.animations;

        if (param.spawnParent) {
            this.spawnParent = param.spawnParent;
        } else {
            this.spawnParent = new SceneNode('ParticleSystem');
            node.addChild(this.spawnParent);
        }
    }
    spawn(payload: any) {
        let particle: Particle;
        if (this.disabled.length) {
            particle = this.disabled[this.disabled.length - 1];
            this.disabled.length = this.disabled.length - 1;
        } else {
            particle = new Particle(this.particleName, this.drawable);
            this.spawnParent.addChild(particle.node);
        }
        this.enabled.push(particle);

        particle.spawn(this.initFunc, this.animationAssets, payload);
        particle.update(0);
    }

    updateParticles(dt: number) {
        this.enabled.forEach(particle => {
            particle.keepAlive = false;
            particle.update(dt);
        });
    }
    checkParticles() {
        this.enabled = this.enabled.filter(particle => {
            let enabled = particle.check(this.checkFunc);
            if (!enabled) {
                this.disabled.push(particle);
            }
            particle.node.drawable.visible = enabled;
            return enabled;
        });
    }

    getParticles(): readonly Particle[] {
        return this.enabled;
    }

    clear() {
        this.disabled.push(...this.enabled);
        this.enabled.length = 0;
    }

    private initFunc: (p: Particle, animations: Animation[], payload: any) => void;
    private checkFunc: (p: Particle) => boolean;
    setCallbacks(init: (p: Particle, animations: Animation[], payload: any) => void, check: (p: Particle) => boolean) {
        this.initFunc = init;
        this.checkFunc = check;
    }
}
