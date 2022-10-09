import { Drawable } from '../components/Drawable';
import { ComponentParam } from '../components/ComponentParam';
import { Sfx } from '../components/Sfx';
import { EventDispatcher } from '../util/EventDispatcher';
import { Vec1, Vec3 } from '../util/Vec3';
import { ParticleSystem } from '../components/ParticleSystem';
import { Shape } from 'zdog';

let idNext = 1;

export class SceneNode extends EventDispatcher {
    public readonly id: number;
    public readonly name: string;
    private parent: SceneNode;
    private readonly children: SceneNode[];

    public readonly position: Vec3 = new Vec3(0, 0, 0);
    public readonly rotation: Vec3 = new Vec3(0, 0, 0);
    public readonly scale: Vec3 = new Vec3(1, 1, 1);
    public readonly color: Vec3 = new Vec3(1, 1, 1);
    public readonly opacity: Vec1 = new Vec1(1);

    public readonly drawable: Drawable;
    public readonly sfx?: Sfx;
    public readonly particle?: ParticleSystem;

    constructor(name?: string, components?: ComponentParam) {
        super();
        this.id = idNext++;

        this.name = name || '';
        this.children = []; //TODO add parent control

        this.color.clearDirty();
        this.opacity.clearDirty();

        let drawableParam = components && components.drawable;
        if (drawableParam) {
            this.drawable = new Drawable(this, drawableParam);
        } else {
            this.drawable = new Drawable(this, {asset: {shape: 'anchor'}});
        }

        let sfxParam = components && components.sfx;
        if (sfxParam) {
            this.sfx = new Sfx(this, sfxParam);
        }

        let particleParam = components && components.particle;
        if (particleParam) {
            this.particle = new ParticleSystem(this, particleParam);
        }
    }

    addChild(child: SceneNode) {
        //TODO add parent control
        child.parent = this;
        this.children.push(child);
        this.drawable.zdog.addChild(child.drawable.zdog);
    }

    getParent(): SceneNode {
        return this.parent;
    }
    getChildren() : Readonly<SceneNode[]> {
        return this.children;
    }

    updateDrawableSelf(force: boolean = false) {
        //check position/rotation/scale, update self
        let dirty1 = this.position.clearDirty();
        let dirty2 = this.rotation.clearDirty();
        let dirty3 = this.scale.clearDirty();
        let dirty = dirty1 || dirty2 || dirty3;
        if (force || dirty) {
            this.drawable.updateTransform(this.position, this.rotation, this.scale);
        }

        let dirty4 = this.color.clearDirty();
        let dirty5 = this.opacity.clearDirty();
        if (force || dirty4 || dirty5) {
            (this.drawable.zdog as Shape).color = `rgba(${this.color.x * 255}, ${this.color.y * 255}, ${this.color.z * 255}, ${this.opacity.x})`;
        }
    }

    beforeTick(dt: number) {
        if (this.particle) {
            this.particle.updateParticles(dt);
        }
        for (let child of this.children) {
            child.beforeTick(dt);
        }
    }

    afterTick(dt: number) {
        this.updateDrawableSelf();

        if (this.particle) {
            this.particle.checkParticles();
        }

        for (let child of this.children) {
            child.afterTick(dt);
        }
    }
}
