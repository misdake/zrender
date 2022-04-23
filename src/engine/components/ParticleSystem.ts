import { Component } from './Component';
import { DrawableParam } from './Drawable';
import { Vec3 } from '../util/Vec3';
import { SceneNode } from '../scene/SceneNode';

export interface ParticleParam {
    particleName: string,
    drawable: DrawableParam;
    spawnParent?: SceneNode;
}

export class Particle {
    readonly node: SceneNode;

    basePosition: Vec3 = new Vec3();
    speed: Vec3 = new Vec3();
    time: number;
    timeMax: number;

    checkEnable: (p: Particle) => boolean;

    constructor(name: string, drawable: DrawableParam) {
        this.node = new SceneNode('particle', {
            drawable: drawable,
        });
    }

    spawn(init: (p: Particle) => void, checkEnable: (p: Particle) => boolean) {
        this.basePosition.set(0, 0, 0);
        this.speed.set(0, 0, 0);
        this.time = 0;
        this.timeMax = Number.POSITIVE_INFINITY;

        init(this);
        this.checkEnable = checkEnable;
    }

    updateParticle(dt: number): boolean {
        this.time += dt;
        if (this.time > this.timeMax) {
            return false;
        }

        this.node.position.setVec3(this.basePosition.add(this.speed.multiplyScalar(this.time)));
        // console.log('update particle', this.node.position);

        let enabled = this.checkEnable(this);
        return enabled;
    }

}

export class ParticleSystem extends Component {

    private enabled: Particle[] = [];
    private disabled: Particle[] = [];

    public readonly particleName: string;
    public readonly drawable: DrawableParam;
    public readonly spawnParent: SceneNode;

    constructor(node: SceneNode, param: ParticleParam) {
        super(node);

        this.particleName = param.particleName;
        this.drawable = param.drawable;

        if (param.spawnParent) {
            this.spawnParent = param.spawnParent;
        } else {
            this.spawnParent = new SceneNode('ParticleSystem');
            node.addChild(this.spawnParent);
        }
    }

    spawn(init: (p: Particle) => void, checkEnable: (p: Particle) => boolean) {
        let particle: Particle;
        if (this.disabled.length) {
            particle = this.disabled[this.disabled.length - 1];
            this.disabled.length = this.disabled.length - 1;
        } else {
            particle = new Particle(this.particleName, this.drawable);
            this.spawnParent.addChild(particle.node);
        }
        this.enabled.push(particle);

        particle.spawn(init, checkEnable);
    }

    updateParticle(dt: number) {
        this.enabled = this.enabled.filter(particle => {
            let enabled = particle.updateParticle(dt);
            if (!enabled) {
                this.disabled.push(particle);
            }
            particle.node.drawable.visible = enabled;
            return enabled;
        });
    }

    clear() {
        this.disabled.push(...this.enabled);
        this.enabled.length = 0;
    }

}
