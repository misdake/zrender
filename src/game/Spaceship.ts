import { DrawableAsset } from '../engine/components/Drawable';
import { AnimateAdd, Animation } from '../engine/components/Animation';
import { SceneNode } from '../engine/scene/SceneNode';
import { Vec3 } from '../engine/util/Vec3';
import { Particle } from '../engine/components/ParticleSystem';
import { isInScreen, RENDER_BOTTOM, RENDER_LEFT, RENDER_RIGHT, RENDER_TOP } from './Config';
import { Layer } from './Layer';
import { Linesegment2d, Point2d, Polygon2d } from '../engine/components/Collision';

interface SpaceshipType {
    color: string,
}

export enum SpaceshipOwner {
    player = 'player',
    enemy = 'enemy',
}

const SPACESHIP_TYPES: { [key: string]: SpaceshipType } = {
    player: {
        color: '#e63',
    },
    enemy: {
        color: '#2e3',
    },
};

const polygon = [
    {x: 0, y: -1, z: 0},
    {x: -2, y: -2, z: 0},
    {x: 0, y: 3, z: 0},
    {x: 2, y: -2, z: 0},
];
function generateShape(color: string): DrawableAsset {
    return {
        shape: 'polyline',
        path: polygon,
        closed: true,
        stroke: 0.5,
        color: color,
    };
}

export class Spaceship {

    public readonly node: SceneNode;
    public readonly shipNode: SceneNode;
    public readonly bulletNode: SceneNode;
    public readonly bubbleNode: SceneNode;

    private static readonly SFX_ASSETS = {fire: 'fire.ogg'};

    constructor(parent: SceneNode, spaceshipOwner: SpaceshipOwner) {
        let spaceshipType = SPACESHIP_TYPES[spaceshipOwner];

        this.node = new SceneNode('spaceship');
        this.shipNode = new SceneNode('ship', {
            drawable: {
                asset: generateShape(spaceshipType.color),
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
                        height: 1,
                        stroke: 0.5,
                        color: spaceshipType.color,
                    },
                },
                animations: [{
                    name: 'fire',
                    type: 'add',
                    field: 'position',
                    duration: 10000,
                    speed: null, //filled in initBullet
                }],
            },
        });
        this.bulletNode.particle.setCallbacks(
            (p, animations) => this.initBullet(p, animations),
            p => isInScreen(p.node.position, 2),
        );

        this.bubbleNode = new SceneNode('bullet', {
            particle: {
                particleName: 'bullet',
                drawable: {
                    asset: {
                        shape: 'cone',
                        diameter: 0.8,
                        length: 1.0,
                        stroke: false,
                        color: 'rgba(255, 0, 0, 0.6)',
                        backface: 'rgba(255, 0, 0, 0)',
                    },
                },
                animations: [{
                    name: 'scale',
                    type: 'lerp',
                    field: 'scale',
                    duration: 0.5,
                    target: new Vec3(0, 0, 0),
                }, {
                    name: 'move',
                    type: 'add',
                    field: 'position',
                    duration: 0.5,
                    speed: null,
                }],
            },
        });
        this.bubbleNode.particle.setCallbacks(
            (p, animations) => this.initBubble(p, animations),
            _ => true,
        );

        switch (spaceshipOwner) {
            case SpaceshipOwner.player:
                this.shipNode.position.z = Layer.player;
                this.bulletNode.position.z = Layer.player_bullet;
                this.bubbleNode.position.z = Layer.player_bubble;
                break;
            case SpaceshipOwner.enemy:
                this.shipNode.position.z = Layer.enemy;
                this.bulletNode.position.z = Layer.enemy_bullet;
                this.bubbleNode.position.z = Layer.enemy_bubble;
                break;

        }

        parent.addChild(this.node);
        this.node.addChild(this.shipNode);
        this.node.addChild(this.bulletNode);
        this.node.addChild(this.bubbleNode);
    }

    public readonly position: Vec3 = new Vec3();
    public readonly speed: Vec3 = new Vec3();

    public rot: number = 0;
    public rotSpeed: number = 0;

    public keepInScreen = false;

    //spaceship model
    private accS: number = 5;
    private accF: number = (this.accS + 20);
    private accB: number = -(this.accS + 10);
    private speedMax: number = 30;
    private rotAccS: number = 10;
    private rotAccL: number = -(this.rotAccS + 20);
    private rotAccR: number = (this.rotAccS + 20);
    private rotSpeedMax: number = 4;

    transformToWorld(local: Vec3): Vec3 {
        return local.rotateZ(this.rot).add(this.position);
    }
    rotateLocal(local: Vec3): Vec3 {
        return local.rotateZ(this.rot);
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
        if (this.keepInScreen) {
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
        }

        //apply scene
        this.shipNode.position.setVec3(this.position);
        this.shipNode.rotation.z = -this.rot;

        if (forward) {
            this.tryEmit(dt);
        }
    }

    enable(position: Vec3, rotateTarget: Vec3) {
        this.position.setVec3(position);
        //atan2(x,y) not atan2(y,x) is intentional, because rot definition is different
        this.rot = Math.atan2(rotateTarget.x - position.x, rotateTarget.y - position.y);

        this.shipNode.position.setVec3(this.position);
        this.shipNode.rotation.z = -this.rot;
    }
    disable() {
        this.position.set(-10000, -10000, 0);
        this.rot = 0;
        this.shipNode.position.setVec3(this.position);
        this.shipNode.rotation.z = -this.rot;
        //no need to reset particles, keep updating
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

    private bulletRecoilSpeedDelta = new Vec3(0, -1, 0);
    private bulletFireSpeedDelta = new Vec3(0, 50, 0);
    private fire() {
        this.bulletNode.particle.spawn();
    }
    private initBullet(p: Particle, animations: Animation[]) {
        let moveAnimation = animations[0] as AnimateAdd;
        p.node.position.setVec3(this.position.add(this.rotateLocal(new Vec3(0, 3, 0))));
        p.node.rotation.z = -this.rot;

        this.speed.setVec3(this.speed.add(this.rotateLocal(this.bulletRecoilSpeedDelta)));

        let speed = moveAnimation.speed = new Vec3();
        speed.setVec3(this.rotateLocal(this.bulletFireSpeedDelta));
        speed.setVec3(speed.add(this.speed));
    }

    private emitIntervalMin = 0.03;
    private sinceLastEmit: number = 0;
    tryEmit(dt: number) {
        this.sinceLastEmit += dt;
        while (this.sinceLastEmit >= this.emitIntervalMin) {
            this.sinceLastEmit = 0;
            this.emitBubble();
        }
    }
    private emitBubble() {
        this.bubbleNode.particle.spawn();
    }
    private bubbleSpeedDelta = new Vec3(0, -35, 0);
    private initBubble(p: Particle, animations: Animation[]) {
        let size = 1 + Math.random();
        let offsetX = Math.random() + Math.random() - 1;
        let offsetY = (Math.random() * 2 - 1) * 0.2;
        p.node.position.setVec3(this.position.add(this.rotateLocal(new Vec3(offsetX, -1.5 + offsetY, 0))));
        p.node.scale.set(size, size, size);
        p.node.rotation.set(Math.PI / 2, this.rot, 0);

        let moveAnimation = animations[1] as AnimateAdd;
        let speed = moveAnimation.speed = new Vec3();
        speed.setVec3(this.rotateLocal(this.bubbleSpeedDelta));
        speed.setVec3(speed.add(this.speed));
    }

    getPolygon2d(): Polygon2d {
        return new Polygon2d(polygon.map(point => {
            let p = this.transformToWorld(new Vec3(point.x, point.y, point.z));
            return new Point2d(p.x, p.y);
        }));
    }
    getBulletLinesegment2d(): Linesegment2d[] {
        let particles = this.bulletNode.particle.getParticles();
        return particles.map(particle => {
            let p = particle.node.position;
            let p1 = new Vec3(0, 0.5, 0).rotateZ(-particle.node.rotation.z).add(p);
            let p2 = new Vec3(0, -0.5, 0).rotateZ(-particle.node.rotation.z).add(p);
            return new Linesegment2d(new Point2d(p1.x, p1.y), new Point2d(p2.x, p2.y));
        });
    }
}
