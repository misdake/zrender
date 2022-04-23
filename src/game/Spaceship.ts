import { DrawableAsset } from '../engine/components/Drawable';
import { SceneNode } from '../engine/scene/SceneNode';
import { Vec3 } from '../engine/util/Vec3';

function generateShape(color: string): DrawableAsset {
    return {
        shape: 'polyline',
        path: [
            {x: 0, y: -1, z: 0},
            {x: -2, y: -2, z: 0},
            {x: 0, y: 3, z: 0},
            {x: 2, y: -2, z: 0},
        ],
        closed: true,
        stroke: 0.5,
        color: color,
    };
}

export class Spaceship {

    public readonly node: SceneNode;

    constructor(parent: SceneNode) {
        this.node = new SceneNode('spaceship', {
            drawable: {
                asset: generateShape('#e62'),
            },
            sfx: {
                assets: {fire: 'fire.wav'},
                channel: 0,
                baseFolder: 'assets/sound/',
            },
        });

        parent.addChild(this.node);
    }

    public position: Vec3 = new Vec3();
    public speed: Vec3 = new Vec3();

    public rot: number = 0;
    public rotSpeed: number = 0;

    //spaceship model
    private accS: number = 5;
    private accF: number = (this.accS + 20);
    private accB: number = -(this.accS + 10);
    private speedMax: number = 30;
    private rotAccS: number = 10;
    private rotAccL: number = -(this.rotAccS + 20);
    private rotAccR: number = (this.rotAccS + 20);
    private rotSpeedMax: number = 4;

    transform(local: Vec3): Vec3 {
        local.rotateZSet(this.rot);
        return local;
    }

    playerMove(dt: number, forward: boolean, backward: boolean, left: boolean, right: boolean) {
        let acc = 0;
        if (forward) acc += this.accF;
        if (backward) acc += this.accB;

        let rotAcc = 0;
        if (left) rotAcc += this.rotAccL;
        if (right) rotAcc += this.rotAccR;

        this.rotSpeed += rotAcc * dt;
        let rotDvS = this.rotAccS * dt;
        if (Math.abs(this.rotSpeed) < rotDvS) {
            this.rotSpeed = 0;
        } else {
            this.rotSpeed -= Math.sign(this.rotSpeed) * rotDvS;
        }
        this.rotSpeed = Math.sign(this.rotSpeed) * Math.min(Math.abs(this.rotSpeed), this.rotSpeedMax);
        this.rot += this.rotSpeed * dt;
        this.rot = this.rot % (Math.PI * 2);

        let dir = new Vec3(0, acc * dt, 0);
        dir.rotateZSet(this.rot);
        this.speed.setVec3(this.speed.add(dir));

        let speedLen = this.speed.length();
        let speedDvS = this.accS * dt;
        if (speedLen < speedDvS) {
            speedLen = 0;
        } else {
            speedLen -= speedDvS;
        }
        speedLen = Math.min(speedLen, this.speedMax);
        this.speed.setLength(speedLen);

        this.position.setVec3(this.position.add(this.speed.multiplyScalar(dt)));

        this.node.position.setVec3(this.position);
        this.node.rotation.z = -this.rot;
    }

}
