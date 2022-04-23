import { DrawableAsset } from '../engine/components/Drawable';
import { SceneNode } from '../engine/scene/SceneNode';
import { Spaceship } from './Spaceship';
import { Vec3 } from '../engine/util/Vec3';

function generateShape(color: string): DrawableAsset {
    return {
        shape: 'rect',
        fill: true,
        width: 0,
        height: 1.5,
        stroke: 1,
        color: color,
    };
}

export class Bullet {

    public readonly node: SceneNode;
    private _fired: boolean = false;

    public readonly spaceship: Spaceship;

    private basePosition: Vec3 = new Vec3();
    private speed: Vec3 = new Vec3();
    private time: number;

    private speedDelta: number = 50;

    constructor(parent: SceneNode) {
        this.node = new SceneNode('bullet', {
            drawable: {
                asset: generateShape('#e62'),
            },
        });

        parent.addChild(this.node);
    }

    get fired(): boolean {
        return this._fired;
    }

    fire(spaceship: Spaceship, positionOffset: Vec3, rotationOffset: number) {
        this._fired = true;

        this.basePosition.setVec3(spaceship.position.add(spaceship.transform(positionOffset)));
        this.node.rotation.z = -(spaceship.rot + rotationOffset);

        this.speed.setVec3(spaceship.transform(new Vec3(0, this.speedDelta, 0)));
        this.speed.setVec3(this.speed.add(spaceship.speed));
        console.log(this.speed);
        this.time = 0;
    }

    update(dt: number) {
        if (!this._fired) return;

        this.time += dt;
        let position = this.basePosition.add(this.speed.multiplyScalar(this.time));
        this.node.position.setVec3(position);
    }

}
