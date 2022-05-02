import { Component } from './Component';
import { DrawableParam } from './Drawable';
import { Vec3 } from '../util/Vec3';
import { SceneNode } from '../scene/SceneNode';
import { animate, Animation } from './Animation';

export interface ParticleParam {
    particleName: string,
    drawable: DrawableParam;
    spawnParent?: SceneNode;
    animations: Animation[];
}

export class Particle {
    readonly node: SceneNode;
    data: any;

    animationSrc: Vec3[];
    animations: Animation[];
    time: number;

    keepAlive = false;

    constructor(name: string, drawable: DrawableParam) {
        this.node = new SceneNode('particle', {
            drawable: drawable,
        });
    }

    spawn(initFunc: (p: Particle, animations: Animation[], payload?: any) => void, animations: Animation[], payload?: any) {
        this.time = 0;
        this.animations = animations;
        initFunc(this, animations, payload);

        this.animationSrc = [];
        for (let animation of this.animations) {
            let src: Vec3 = this.node[animation.field];
            this.animationSrc.push(new Vec3(src.x, src.y, src.z));
        }
    }

    update(dt: number) {
        this.time += dt;
        this.keepAlive = animate(this.node, this.animations, this.animationSrc, this.time);
    }

    check(checkEnable: (p: Particle) => boolean): boolean {
        if (!this.keepAlive) return false;
        let enabled = checkEnable(this);
        return enabled;
    }
}

export class ParticleSystem extends Component {

    private enabled: Particle[] = [];
    private disabled: Particle[] = [];

    public readonly particleName: string;
    public readonly drawable: DrawableParam;
    public readonly spawnParent: SceneNode;
    public readonly animations: Animation[];

    constructor(node: SceneNode, param: ParticleParam) {
        super(node);

        this.particleName = param.particleName;
        this.drawable = param.drawable;
        this.animations = param.animations;

        if (param.spawnParent) {
            this.spawnParent = param.spawnParent;
        } else {
            this.spawnParent = new SceneNode('ParticleSystem');
            node.addChild(this.spawnParent);
        }
    }
    spawn(payload?: any) {
        let particle: Particle;
        if (this.disabled.length) {
            particle = this.disabled[this.disabled.length - 1];
            this.disabled.length = this.disabled.length - 1;
        } else {
            particle = new Particle(this.particleName, this.drawable);
            this.spawnParent.addChild(particle.node);
        }
        this.enabled.push(particle);

        let particleAnimations = this.animations.map(a => Object.assign({}, a));
        particle.spawn(this.initFunc, particleAnimations, payload);
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

    private initFunc: (p: Particle, animations: Animation[], payload?: any) => void;
    private checkFunc: (p: Particle) => boolean;
    setCallbacks(init: (p: Particle, animations: Animation[], payload?: any) => void, check: (p: Particle) => boolean) {
        this.initFunc = init;
        this.checkFunc = check;
    }
}
