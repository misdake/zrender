import { ShapeParam, Vec3 } from '../components/shape_types';
import { Drawable } from '../components/Drawable';

export class SceneNode {
    public readonly name: string;
    private readonly children: SceneNode[];

    public readonly position: Vec3 = new Vec3(0, 0, 0);
    public readonly rotation: Vec3 = new Vec3(0, 0, 0);
    public readonly scale: Vec3 = new Vec3(1, 1, 1);

    public readonly drawable: Drawable;

    constructor(name?: string, shape?: ShapeParam) {
        this.name = name || '';
        this.children = []; //TODO add parent control

        if (shape) {
            this.drawable = new Drawable(shape);
        } else {
            this.drawable = new Drawable({shape: 'anchor'});
        }
    }

    addChild(child: SceneNode) {
        //TODO add parent control
        this.children.push(child);
        this.drawable.zdog.addChild(child.drawable.zdog);
    }

    updateSelf(force: boolean = false): boolean {
        //check position/rotation/scale, update self
        let dirty = this.position.getDirtyClear() || this.rotation.getDirtyClear() || this.scale.getDirtyClear();
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

    setPosition(x?: number, y?: number, z?: number) : SceneNode {
        this.position.set(x, y, z);
        return this;
    }
    setRotation(x?: number, y?: number, z?: number) : SceneNode {
        this.rotation.set(x, y, z);
        return this;
    }
    setScale(x?: number, y?: number, z?: number) : SceneNode {
        this.scale.set(x, y, z);
        return this;
    }
}
