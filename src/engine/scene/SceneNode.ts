import { Vec3 } from '../components/shape_types';
import { Drawable } from '../components/Drawable';
import { ComponentParam } from '../components/ComponentParam';
import { Sfx } from '../components/Sfx';

export class SceneNode {
    public readonly name: string;
    private readonly children: SceneNode[];

    public readonly position: Vec3 = new Vec3(0, 0, 0);
    public readonly rotation: Vec3 = new Vec3(0, 0, 0);
    public readonly scale: Vec3 = new Vec3(1, 1, 1);

    public readonly drawable: Drawable;
    public readonly sfx: Sfx;

    constructor(name?: string, components?: ComponentParam) {
        this.name = name || '';
        this.children = []; //TODO add parent control

        let drawableParam = components && components.drawable;
        if (drawableParam) {
            this.drawable = new Drawable(drawableParam);
        } else {
            this.drawable = new Drawable({shape: 'anchor'});
        }

        let sfxParam = components && components.sfx;
        if (sfxParam) {
            this.sfx = new Sfx(sfxParam.assets, sfxParam.channel);
        }
    }

    addChild(child: SceneNode) {
        //TODO add parent control
        this.children.push(child);
        this.drawable.zdog.addChild(child.drawable.zdog);
    }

    updateSelf(force: boolean = false): boolean {
        //check position/rotation/scale, update self
        let dirty1 = this.position.clearDirty();
        let dirty2 = this.rotation.clearDirty();
        let dirty3 = this.scale.clearDirty();
        let dirty = dirty1 || dirty2 || dirty3;
        if (force || dirty) {
            this.drawable.update(this.position, this.rotation, this.scale);
        }
        return dirty;
    }

    update(force: boolean = false): boolean {
        let dirty = this.updateSelf(force);
        for (let child of this.children) {
            dirty = child.update(force) || dirty;
        }
        return dirty;
    }

    setPosition(x?: number, y?: number, z?: number): SceneNode {
        this.position.set(x, y, z);
        return this;
    }
    setRotation(x?: number, y?: number, z?: number): SceneNode {
        this.rotation.set(x, y, z);
        return this;
    }
    setScale(x?: number, y?: number, z?: number): SceneNode {
        this.scale.set(x, y, z);
        return this;
    }
}
