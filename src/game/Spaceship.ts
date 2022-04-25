import { DrawableAsset } from '../engine/components/Drawable';
import { SceneNode } from '../engine/scene/SceneNode';
import { Vec3 } from '../engine/util/Vec3';
import { Particle } from '../engine/components/ParticleSystem';
import { isInScreen, RENDER_BOTTOM, RENDER_LEFT, RENDER_RIGHT, RENDER_TOP } from './Config';

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
    public readonly shipNode: SceneNode;
    public readonly bulletNode: SceneNode;

    private static readonly SFX_ASSETS = {fire: 'fire.wav'};

    constructor(parent: SceneNode) {
        this.node = new SceneNode('spaceship');
        this.shipNode = new SceneNode('ship', {
            drawable: {
                asset: generateShape('#e62'),
            },
            sfx: {
                assets: Spaceship.SFX_ASSETS,
                channel: 0,
                baseFolder: 'assets/sound/',
            },
        });
        this.bulletNode = new SceneNode('bullet', {
            particle: {
                particleName: 'bullet',
                drawable: {
                    asset: {
                        shape: 'rect',
                        fill: true,
                        width: 0,
                        height: 1.5,
                        stroke: 1,
                        color: '#e62',
                    },
                },
            },
        });

        parent.addChild(this.node);
        this.node.addChild(this.shipNode);
        this.node.addChild(this.bulletNode);
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

        //fit in screen
        let position = this.position, margin = -2;
        if (position.x < RENDER_LEFT - margin) {
            position.x = RENDER_LEFT - margin;
            this.speed.x = 0;
        }
        if (position.x > RENDER_RIGHT + margin) {
            position.x = RENDER_RIGHT + margin;
            this.speed.x = 0;
        }
        if (position.y < RENDER_TOP - margin) {
            position.y = RENDER_TOP - margin;
            this.speed.y = 0;
        }
        if (position.y > RENDER_BOTTOM + margin) {
            position.y = RENDER_BOTTOM + margin;
            this.speed.y = 0;
        }

        //apply scene
        this.shipNode.position.setVec3(this.position);
        this.shipNode.rotation.z = -this.rot;
    }

    private fireIntervalMin = 0.1;
    private sinceLastFire: number = 0;
    tryFire(dt: number) {
        this.sinceLastFire += dt;
        if (this.sinceLastFire >= this.fireIntervalMin) {
            this.shipNode.sfx.play(Spaceship.SFX_ASSETS.fire);
            this.sinceLastFire = 0;
            this.fire();
        }
    }

    private bulletSpeedDelta = 50;
    private fire() {
        this.bulletNode.particle.spawn(p => this.initParticle(p), p => isInScreen(p.node.position, 2));
    }
    private initParticle(p: Particle) {
        p.basePosition.setVec3(this.position.add(this.transform(new Vec3(0, 3, 0))));
        p.node.rotation.z = -this.rot;

        p.speed.setVec3(this.transform(new Vec3(0, this.bulletSpeedDelta, 0)));
        p.speed.setVec3(p.speed.add(this.speed));

        p.time = 0;
        p.timeMax = Number.POSITIVE_INFINITY;
    }

}
